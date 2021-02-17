package retro

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/zaydek/retro/pkg/loggers"
)

func (r Runtime) Dev() {}

func (r Runtime) Export() {}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirConfiguration.BuildDirectory); os.IsNotExist(err) {
		loggers.ErrorAndEnd("It looks like you’re trying to run retro serve but you haven’t run retro export yet. " +
			"Try retro export && retro serve.")
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		loggers.OK(fmt.Sprintf("http://localhost:%s", r.getPort()))
	}()

	// fs := http.FileServer(http.Dir(r.DirConfiguration.BuildDirectory))
	// http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
	// 	if p.Ext(r.URL.Path) == "" {
	// 		r.URL.Path += ".html"
	// 	}
	// 	fs.ServeHTTP(w, r)
	// })
	must(http.ListenAndServe(":"+r.getPort(), http.FileServer(http.Dir(r.DirConfiguration.BuildDirectory))))
	// must(http.ListenAndServe(":"+r.getPort(), nil))
}
