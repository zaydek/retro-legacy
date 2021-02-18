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
	"github.com/zaydek/retro/pkg/run"
	"github.com/zaydek/retro/pkg/term"
)

// type srvResponse struct {
// 	Hints    []api.Message `json:"hints"`
// 	Warnings []api.Message `json:"warnings"`
// 	Errors   []api.Message `json:"errors"`
// }

// Caches the runtime to disk as resources.json for --cached.

// serializeRuntime serializes runtime for Node.js-based scripts.
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
	fmt.Println(term.Boldf("⚡️ %0.3fs", time.Since(start).Seconds()))
}

func (r Runtime) Export() {
	if err := copyPublicDirToExportDir(r.DirectoryConfiguration); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	if err := serializeRuntime(r); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	if _, err := run.Cmd("node", "scripts/export.esbuild.js"); err != nil {
		loggers.ErrorAndEnd(err)
	}

	// TODO: Make this log more descriptive.
	fmt.Println(fmt.Sprintf("⚡️ (%0.3fs) Success! "+
		"You can run retro serve when you’re ready to serve your web app.",
		time.Since(start).Seconds()))
}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirectoryConfiguration.ExportDir); os.IsNotExist(err) {
		loggers.ErrorAndEnd("It looks like you’re trying to run retro serve but you haven’t run retro export yet. " +
			"Try retro export && retro serve.")
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		// loggers.OK(fmt.Sprintf("http://localhost:%s", r.getPort()))

		// TODO: How do we clear the terminal?
		fmt.Println(fmt.Sprintf("📡 http://localhost:%s", r.getPort()))
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
