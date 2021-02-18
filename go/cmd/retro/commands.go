package retro

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	p "path"
	"strings"
	"time"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
)

// type srvResponse struct {
// 	Hints    []api.Message `json:"hints"`
// 	Warnings []api.Message `json:"warnings"`
// 	Errors   []api.Message `json:"errors"`
// }

// Caches the runtime to disk as resources.json for --cached.

// serializeRuntime serializes runtime for Node-based scripts.
func serializeRuntime(runtime Runtime) error {
	bstr, err := json.MarshalIndent(runtime, "", "\t")
	if err != nil {
		return err
	}
	bstr = append(bstr, '\n') // EOF
	dst := p.Join(runtime.DirectoryConfiguration.CacheDir, "runtime.json")
	if err := ioutil.WriteFile(dst, bstr, perm.File); err != nil {
		return err
	}
	return nil
}

func (r Runtime) Dev() {
	if err := serializeRuntime(r); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	// ...
}

func (r Runtime) Export() {
	if err := copyAssetDirToBuildDir(r.DirectoryConfiguration); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	fmt.Println("TODO")
}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirectoryConfiguration.ExportDir); os.IsNotExist(err) {
		loggers.ErrorAndEnd("It looks like you’re trying to run retro serve but you haven’t run retro export yet. " +
			"Try retro export && retro serve.")
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		loggers.OK(fmt.Sprintf("http://localhost:%s", r.getPort()))
	}()

	http.HandleFunc("/", func(wr http.ResponseWriter, req *http.Request) {
		path := req.URL.Path
		if p.Ext(path) == "" {
			if strings.HasSuffix(path, "/") {
				path += "index.html"
			} else {
				path += ".html"
			}
		}
		http.ServeFile(wr, req, p.Join(r.DirectoryConfiguration.ExportDir, path))
	})
	if err := http.ListenAndServe(":"+r.getPort(), nil); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
}
