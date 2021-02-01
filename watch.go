package main

import (
	"fmt"
	"net/http"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/loggers"
)

func main() {
	events := make(chan string, 1)

	api.Build(api.BuildOptions{
		Bundle:      true,
		EntryPoints: []string{"in.js"},
		Outfile:     "out.js",
		Watch: &api.WatchMode{
			OnRebuild: func(result api.BuildResult) {
				if len(result.Errors) > 0 {
					fmt.Printf("watch build failed: %d errors\n", len(result.Errors))
				} else {
					fmt.Printf("watch build succeeded: %d warnings\n", len(result.Warnings))
				}
				events <- "reload"
			},
		},
		Write: true,
	})

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})
	http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		events <- "ready"
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			loggers.Stderr.Fatalln("Your browser does not support server-sent events (SSE).")
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
	http.HandleFunc("/out.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "out.js")
	})
	if err := http.ListenAndServe(":8001", nil); err != nil {
		loggers.Stderr.Fatalln(err)
	}
}
