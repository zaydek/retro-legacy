package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	p "path"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/events"
	"github.com/zaydek/retro/loggers"
	"github.com/zaydek/retro/watcher"
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
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
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
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	base, err := r.parseBaseHTMLTemplate()
	if err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}

	serverSentEvents := make(chan events.SSE, 8)

	must(copyAssetDirectoryToBuildDirectory(r.Config))
	r.esbuildBuild()

	fmt.Printf("👾 http://localhost:%d\n", r.getPort())

	if len(r.esbuildWarnings) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildWarnings))
	}
	if len(r.esbuildErrors) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildErrors))
	}

	go func() {
		for range watcher.New(r.WatchCommand.Directory, r.WatchCommand.Poll) {
			r.esbuildRebuild()
			serverSentEvents <- events.SSE{Event: "reload"}
		}
	}()

	http.HandleFunc("/", func(wr http.ResponseWriter, req *http.Request) {
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
				serverSentEvents <- events.SSE{Event: "warning", Data: string(data)}
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
			loggers.Stderr.Println(err)
			os.Exit(1)
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

	http.HandleFunc("/sse", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			loggers.Stderr.Println("Your browser does not support server-sent events (SSE).")
			os.Exit(1)
			return
		}
		for {
			select {
			case e := <-serverSentEvents:
				e.Write(w)
				flusher.Flush()
			case <-r.Context().Done():
				// No-op
				return
			}
		}
	})

	if err := http.ListenAndServe(fmt.Sprintf(":%d", r.getPort()), nil); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
}