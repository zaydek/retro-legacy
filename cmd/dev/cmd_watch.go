package dev

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	p "path"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/dev/cli"
	"github.com/zaydek/retro/pkg/events"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/watcher"
)

func (r *Runtime) esbuildBuild() {
	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{p.Join(r.Config.PagesDirectory, "index.js")},
		Incremental: true,
		Loader:      map[string]api.Loader{".js": api.LoaderJSX, ".ts": api.LoaderTSX},
		Outfile:     p.Join(r.Config.BuildDirectory, "app.js"),
		Write:       true,
	})
	r.esbuildResult = results
	r.esbuildWarnings = results.Warnings
	r.esbuildErrors = results.Errors
}

func (r *Runtime) esbuildRebuild() {
	// start := time.Now()
	results := r.esbuildResult.Rebuild()
	r.esbuildResult = results
	r.esbuildWarnings = results.Warnings
	r.esbuildErrors = results.Errors
	// fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}

// TODO: prerenderServeOrBuild
// TODO: Add --cached to watch and build.

func (r Runtime) Watch() {
	// // if r.WatchCommand.Cached
	if err := r.prerenderProps(); err != nil {
		loggers.Stderr.Fatalln(err)
	}
	base, err := r.parseBaseHTMLTemplate()
	if err != nil {
		loggers.Stderr.Fatalln(err)
	}

	srvEvents := make(chan events.SSE, 8)

	r.esbuildBuild()

	fmt.Printf("👾 http://localhost:%s\n", r.getPort())

	if len(r.esbuildWarnings) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildWarnings))
	}
	if len(r.esbuildErrors) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildErrors))
	}

	go func() {
		// TODO: Add support for many paths.
		cmd := r.Command.(cli.WatchCommand)
		for range watcher.New(cmd.Paths[0], cmd.Poll) {
			r.esbuildRebuild()
			srvEvents <- events.SSE{Event: "reload"}
		}
	}()

	http.HandleFunc("/", func(wr http.ResponseWriter, req *http.Request) {
		// TODO: We probably don’t need this anymore, right?
		if ext := p.Ext(req.URL.Path); ext != "" {
			http.ServeFile(wr, req, p.Join(string(r.Config.BuildDirectory), req.URL.Path))
		}
		r.esbuildRebuild()
		if len(r.esbuildWarnings) > 0 {
			// TODO
			loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildWarnings))
			data, _ := json.Marshal(formatEsbuildMessagesAsTermString(r.esbuildWarnings))
			defer func() {
				// Pause so the server-sent event does not drop on refresh:
				time.Sleep(100 * time.Millisecond)
				srvEvents <- events.SSE{Event: "warning", Data: string(data)}
			}()
		}
		if len(r.esbuildErrors) > 0 {
			loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildErrors))
			fmt.Fprintln(wr, esbuildMessagesAsHTMLDocument(r.esbuildErrors))
			return
		}
		// TODO: Add some caching layer here.
		// TODO: Add some kind of r.Router.getRouteForPath(req.URL.Path). Non-
		// matches should defer to ServeFile logic.
		bstr, err := r.prerenderPage(base, r.Router[0])
		if err != nil {
			// TODO
			loggers.Stderr.Fatalln(err)
		}
		wr.Write(bstr)

		// 		wr.Write([]byte(`<!DOCTYPE html>
		// <html>
		// 	<head></head>
		// 	<body>
		// 		<h1>Hello, world!</h1>
		// 	</body>
		// </html>
		// `))

		// fmt.Fprint(wr, string(bstr))
		// return

		// http.ServeFile(wr, req, p.Join(string(r.Config.BuildDirectory), req.URL.Path))
	})

	http.HandleFunc("/public/", func(w http.ResponseWriter, r *http.Request) {
		path := fmt.Sprintf("./%s", r.URL.Path)
		if p.Ext(r.URL.Path) == "" {
			path += ".html"
		}
		http.ServeFile(w, r, path)
	})

	http.HandleFunc("/sse", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			// TODO: Change to a warning.
			loggers.Stderr.Fatalln("Your browser does not support server-sent events (SSE).")
			return
		}
		for {
			select {
			case e := <-srvEvents:
				e.Write(w)
				flusher.Flush()
			case <-r.Context().Done():
				// No-op
				return
			}
		}
	})

	if err := http.ListenAndServe(":"+r.getPort(), nil); err != nil {
		loggers.Stderr.Fatalln(err)
	}
}
