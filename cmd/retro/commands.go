package retro

import (
	"fmt"
	"net/http"
	"os"
	p "path"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func (r Runtime) Build() {
	must(copyAssetDirectoryToBuildDirectory(r.DirConfiguration))
	must(r.RenderPageProps())
	must(r.RenderApp())
	must(r.RenderPages())
}

func (r Runtime) Start() {
	events := make(chan string, 1)

	if !r.Command.(cli.StartCommand).Cached {
		must(r.RenderPageProps())
	}

	loggers.Stdout.Println(term.Boldf("http://localhost:%s", r.getPort()))

	// TODO: Can’t we serve this without writing it to disk? Then we don’t pollute
	// build which seems right.
	// TODO: Add support for source map here and other places.
	result := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{p.Join(r.DirConfiguration.PagesDirectory, "index.js")},
		Loader: map[string]api.Loader{
			".js": api.LoaderJSX,
			".ts": api.LoaderTSX,
		},
		Outfile: p.Join(r.DirConfiguration.BuildDirectory, "app.js"),
		Watch: &api.WatchMode{
			OnRebuild: func(result api.BuildResult) {
				// TODO: Don’t we want to propagate these errors to the client?
				if len(result.Warnings) > 0 {
					loggers.Stderr.Println(formatEsbuildMessagesAsTermString(result.Warnings))
				} else if len(result.Errors) > 0 {
					loggers.Stderr.Println(formatEsbuildMessagesAsTermString(result.Errors))
				}
				events <- "reload"
			},
		},
		Write: true,
	})
	// TODO
	if len(result.Warnings) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(result.Warnings))
	} else if len(result.Errors) > 0 {
		loggers.Stderr.Println(formatEsbuildMessagesAsTermString(result.Errors))
	}

	http.HandleFunc("/", func(rw http.ResponseWriter, req *http.Request) {
		// Serve non-pages:
		if ext := p.Ext(req.URL.Path); ext != "" {
			http.ServeFile(rw, req, p.Join(string(r.DirConfiguration.BuildDirectory), req.URL.Path))
			return
		}
		// TODO: Add some caching layer here.
		// TODO: Maybe we don’t want to cache intentionally?
		// TODO: Add some kind of r.Router.getRouteForPath(req.URL.Path). Non-
		// matches should defer to ServeFile logic.
		bstr, err := r.RenderPageAsBytes(r.PageBasedRouter[0])
		if err != nil {
			// TODO
			loggers.Stderr.Fatalln(err)
		}
		rw.Write(bstr)
	})

	http.HandleFunc("/public/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, fmt.Sprintf("./%s", r.URL.Path))
	})

	http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		events <- "ready"
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			// TODO: We don’t support warnings yet, but when we do, this should be
			// logged as a warning.
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

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirConfiguration.BuildDirectory); os.IsNotExist(err) {
		loggers.Stderr.Fatalln("Failed to stat directory " + term.Bold(r.DirConfiguration.BuildDirectory) + ". " +
			"It looks like haven’t run " + term.Bold("retro build") + " yet. " +
			"Try " + term.Bold("retro build && retro serve") + ".")
	}

	loggers.Stdout.Println(term.Boldf("http://localhost:%s", r.getPort()))

	http.Handle("/", http.FileServer(http.Dir(r.DirConfiguration.BuildDirectory)))
	must(http.ListenAndServe(":"+r.getPort(), nil))
}
