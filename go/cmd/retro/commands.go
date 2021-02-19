package retro

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	p "path"
	"strings"
	"time"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/run"
)

// type srvResponse struct {
// 	Hints    []api.Message `json:"hints"`
// 	Warnings []api.Message `json:"warnings"`
// 	Errors   []api.Message `json:"errors"`
// }

// stashRuntime stashes the runtime for Node.js scripts.
func stashRuntime(runtime Runtime) error {
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

////////////////////////////////////////////////////////////////////////////////

type JSON map[string]interface{}

// Sends a POST request to the Node.js server.
func post(in []byte) ([]byte, error) {
	var buf bytes.Buffer
	buf.Write(in)

	res, err := http.Post("http://localhost:8000", "application/json", &buf)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	out, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (r Runtime) Dev() {
	events := make(chan string, 1)

	if err := stashRuntime(r); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}

	log.SetFlags(log.Lmicroseconds)

	ch := make(chan []byte)
	defer func() {
		close(ch)
	}()

	go func() {
		time.Sleep(100 * time.Millisecond)

		payload := JSON{"type": "ping"}
		in, _ := json.Marshal(payload)

		log.Printf("sent: %s\n", in)
		out, err := post(in)
		if err != nil {
			// TODO: The Go <-> Node.js "pong" request errored: ...
			panic(err)
		}
		log.Printf("recv: %s\n", out)
	}()

	if _, err := run.Cmd("node", "scripts/dev.esbuild.js"); err != nil {
		panic(err)
	}

	http.HandleFunc(fmt.Sprintf("/%s/", r.DirectoryConfiguration.PublicDir), func(w http.ResponseWriter, r *http.Request) {
		// TODO: Negate index.html.
		http.ServeFile(w, r, fmt.Sprintf("./%s", r.URL.Path))
	})

	http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		events <- "ready"
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			loggers.Warning("Your browser does not support server-sent events (SSE). " +
				"See https://caniuse.com/eventsource.")
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

	// fmt.Println(term.Boldf("⚡️ %0.3fs", time.Since(start).Seconds()))
}

////////////////////////////////////////////////////////////////////////////////

func (r Runtime) Export() {
	if err := copyPublicDirToExportDir(r.DirectoryConfiguration); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	if err := stashRuntime(r); err != nil {
		loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
			err.Error())
	}
	if _, err := run.Cmd("node", "scripts/export.esbuild.js"); err != nil {
		loggers.ErrorAndEnd(err)
	}

	// TODO: Make this log more descriptive; add an export summary.
	// fmt.Println(fmt.Sprintf("⚡️ (%0.3fs) Success! "+
	// 	"You can run retro serve when you’re ready to serve your web app.",
	// 	time.Since(start).Seconds()))
	fmt.Println(fmt.Sprintf("⚡️ Success! (%0.3fs)", time.Since(start).Seconds()))
}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirectoryConfiguration.ExportDir); os.IsNotExist(err) {
		loggers.ErrorAndEnd("It looks like you’re trying to run retro serve but you haven’t run retro export yet. " +
			"Try retro export && retro serve.")
	}

	go func() {
		time.Sleep(100 * time.Millisecond)
		// // loggers.OK(fmt.Sprintf("http://localhost:%s", r.getPort()))
		fmt.Println(fmt.Sprintf("📡 Serving on port %[1]s; http://localhost:%[1]s", r.getPort()))
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
