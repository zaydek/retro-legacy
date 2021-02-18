package retro

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	p "path"
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
	dst := p.Join(runtime.DirConfiguration.CacheDirectory, "runtime.json")
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
	if err := copyAssetDirToBuildDir(r.DirConfiguration); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	fmt.Println("TODO")
}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirConfiguration.BuildDirectory); os.IsNotExist(err) {
		loggers.ErrorAndEnd("It looks like you’re trying to run retro serve but you haven’t run retro export yet. " +
			"Try retro export && retro serve.")
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		loggers.OK(fmt.Sprintf("http://localhost:%s", r.getPort()))
	}()

	fs := http.FileServer(http.Dir(r.DirConfiguration.BuildDirectory))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if p.Ext(r.URL.Path) == "" {
			if r.URL.Path != "/" { // TODO
				r.URL.Path += ".html"
			}
			fmt.Println(r.URL.Path)
		}
		fs.ServeHTTP(w, r)
	})
	if err := http.ListenAndServe(":"+r.getPort(), nil); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
}
