package dev

import (
	"fmt"
	"net/http"
	p "path"

	"github.com/zaydek/retro/pkg/loggers"
)

// TODO: prerenderServeOrBuild
// TODO: Add --cached to watch and build.

// 	results := api.Build(api.BuildOptions{
// 		Bundle: true,
// 		Define: map[string]string{
// 			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
// 			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
// 		},
// 		EntryPoints: []string{p.Join(r.Config.PagesDirectory, "index.js")},
// 		Incremental: true,
// 		Loader:      map[string]api.Loader{".js": api.LoaderJSX, ".ts": api.LoaderTSX},
// 		Outfile:     p.Join(r.Config.BuildDirectory, "app.js"),
// 		Write:       true,
// 	})

func (r Runtime) Watch() {
	// // if r.WatchCommand.Cached
	if err := r.prerenderProps(); err != nil {
		loggers.Stderr.Fatalln(err)
	}

	events := make(chan string, 1)

	// r.esbuildBuild()

	fmt.Printf("👾 http://localhost:%s\n", r.getPort())

	// TODO
	if len(r.esbuildWarnings) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildWarnings))
	} else if len(r.esbuildErrors) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(r.esbuildErrors))
	}

	// go func() {
	// 	// TODO: Add support for many paths.
	// 	cmd := r.Command.(cli.WatchCommand)
	// 	for range watcher.New(cmd.Paths[0], cmd.Poll) {
	// 		r.esbuildRebuild()
	// 		// TODO: Add retry here.
	// 		events <- events.SSE{Event: "reload"}
	// 	}
	// }()

	http.HandleFunc("/", func(wr http.ResponseWriter, req *http.Request) {
		// TODO
		if ext := p.Ext(req.URL.Path); ext != "" {
			http.ServeFile(wr, req, p.Join(string(r.Config.BuildDirectory), req.URL.Path))
		}
		// TODO: Add some caching layer here.
		// TODO: Add some kind of r.Router.getRouteForPath(req.URL.Path). Non-
		// matches should defer to ServeFile logic.
		bstr, err := r.prerenderPageAsBytes(base, r.Router[0])
		if err != nil {
			// TODO
			loggers.Stderr.Fatalln(err)
		}
		wr.Write(bstr)
	})

	http.HandleFunc("/public/", func(w http.ResponseWriter, r *http.Request) {
		path := fmt.Sprintf("./%s", r.URL.Path)
		if p.Ext(r.URL.Path) == "" {
			// NOTE: http.ServeFile only handles index.html:
			//
			// As another special case, ServeFile redirects any request where r.URL.Path
			// ends in "/index.html" to the same path, without the final
			// "index.html". To avoid such redirects either modify the path or
			// use ServeContent.
			//
			path += ".html"
		}
		http.ServeFile(w, r, path)
	})

	http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		events <- "ready"
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			// TODO: Change to a warning.
			loggers.Stderr.Fatalln("Your browser does not support server-sent events.")
			return
		}
		for {
			select {
			case typ := <-events:
				fmt.Fprintf(w, "event: %s\ndata\n\n", typ)
				flusher.Flush()
			case <-r.Context().Done():
				// No-op
				return
			}
		}
	})

	must(http.ListenAndServe(":"+r.getPort(), nil))
}
