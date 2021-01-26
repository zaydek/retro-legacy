package main

// import (
// 	"encoding/json"
// 	"fmt"
// 	"net/http"
// 	"os"
// 	"path"
// 	pathpkg "path"
// 	"strconv"
// 	"strings"
// 	"time"
//
// 	"github.com/evanw/esbuild/pkg/api"
// 	"github.com/zaydek/retro/sse"
// 	"github.com/zaydek/retro/watcher"
// )
//
// // // CLIOptions describes command-line options.
// // type CLIOptions struct {
// // 	Poll time.Duration
// //
// // 	Directory string
// // }
// //
// // // parseCLIOptions parses command-line options.
// // func parseCLIOptions() CLIOptions {
// // 	var cli CLIOptions
// //
// // 	// No-op package stdout / stderr:
// // 	flag.CommandLine.SetOutput(ioutil.Discard)
// //
// // 	flag.Usage = func() {
// // 		fmt.Fprintln(os.Stdout, "oops")
// // 		os.Exit(0)
// // 	}
// //
// // 	flag.DurationVar(&cli.Poll, "poll", 100*time.Millisecond, "")
// // 	flag.Parse()
// //
// // 	for _, v := range []interface{}{cli.Poll} {
// // 		if reflect.ValueOf(v).IsZero() {
// // 			flag.Usage()
// // 		}
// // 	}
// //
// // 	return cli
// // }
// //
// // // TODO: Debounce events sooner than 10-100ms?
// // func main() {
// // 	cli := parseCLIOptions()
// //
// // 	cli.Directory = "src"
// // 	if args := flag.Args(); len(args) > 0 {
// // 		cli.Directory = args[0]
// // 	}
// //
// // 	if info, err := os.Stat(cli.Directory); os.IsNotExist(err) {
// // 		fmt.Printf("Failed to stat directory '%[1]s'. "+
// // 			"'%[1]s' is not a directory.\n", cli.Directory)
// // 		os.Exit(1)
// // 	} else if !info.IsDir() {
// // 		fmt.Printf("Failed to stat directory '%[1]s'. "+
// // 			"'%[1]s' is not a directory.\n", cli.Directory)
// // 		os.Exit(1)
// // 	}
//
// // parseAppFromCLIOptions parses a Retro app from command-line options.
// func newRetroApp() *RetroApp2 {
// 	app := &RetroApp2{
// 		WatchPoll:      250 * time.Millisecond,
// 		WatchDirectory: "src",
// 		BuildDirectory: "public",
// 		ServePort:      8000,
// 	}
// 	return app
// }
//
// type RetroApp2 struct {
// 	esbuildResult   api.BuildResult
// 	esbuildWarnings []api.Message
// 	esbuildErrors   []api.Message
//
// 	WatchPoll      time.Duration
// 	WatchDirectory string
// 	BuildDirectory string
// 	ServePort      int
// }
//
// // func repeat(str string, repeat int) string {
// // 	if repeat <= 0 {
// // 		return ""
// // 	}
// // 	return strings.Repeat(str, repeat)
// // }
//
// func (a *RetroApp2) WarningString() string {
// 	msg := a.esbuildWarnings[0]
// 	cwd, _ := os.Getwd()
//
// 	gap := len(strconv.Itoa(msg.Location.Line))
// 	return fmt.Sprintf("vscode://file%s/%s:%d:%d: %s", cwd, msg.Location.File, msg.Location.Line, msg.Location.Column, msg.Text) + `
//
//     ` + fmt.Sprintf("// ./%s", msg.Location.File) + `
//     ` + fmt.Sprintf("%-*d | %s", gap, msg.Location.Line+0, msg.Location.LineText) + `
//     ` + fmt.Sprintf("%-*d | %s^", gap, msg.Location.Line+1, strings.Repeat(" ", msg.Location.Column)) + `
//     ` + fmt.Sprintf("%-*d | %s%s", gap, msg.Location.Line+2, strings.Repeat(" ", msg.Location.Column), msg.Text) + `
// `
// }
//
// func (a *RetroApp2) ErrorString() string {
// 	msg := a.esbuildErrors[0]
// 	// cwd, _ := os.Getwd()
//
// 	gap := len(strconv.Itoa(msg.Location.Line))
// 	return fmt.Sprintf("%s:%d:%d: %s", msg.Location.File, msg.Location.Line, msg.Location.Column, msg.Text) + `
//
//     ` + fmt.Sprintf("// ./%s", msg.Location.File) + `
//     ` + fmt.Sprintf("%-*d | %s", gap, msg.Location.Line+0, msg.Location.LineText) + `
//     ` + fmt.Sprintf("%-*d | %s^", gap, msg.Location.Line+1, strings.Repeat(" ", msg.Location.Column)) + `
//     ` + fmt.Sprintf("%-*d | %s%s", gap, msg.Location.Line+2, strings.Repeat(" ", msg.Location.Column), msg.Text) + `
// `
// }
//
// func (a *RetroApp2) HTMLErrorString() string {
// 	msg := a.esbuildErrors[0]
// 	cwd, _ := os.Getwd()
//
// 	return `<!DOCTYPE html>
// <html>
// 	<head>
// 		<title>
// 			` + fmt.Sprintf("Error: %s", msg.Text) + `
// 		</title>
// 		<style>
//
// a {
// 	color: unset;
// 	text-decoration: unset;
// }
//
// body {
// 	color: hsla(0, 0%, 0%, 0.95);
// 	background-color: #fff;
// }
//
// @media (prefers-color-scheme: dark) {
// 	body {
// 		color: hsla(0, 0%, 100%, 0.95);
// 		background-color: rgb(36, 36, 36);
// 	}
// }
//
// 		</style>
// 	</head>
// 	<body>
// 		<a href="` + fmt.Sprintf("vscode://file%s/%s:%d:%d", cwd, msg.Location.File, msg.Location.Line, msg.Location.Column) + `">
// 			<pre><code>` + a.ErrorString() + `</code></pre>
// 		</a>
// 		<script>
// 			const source = new EventSource("/sse")
// 			source.addEventListener("reload", e => {
// 				window.location.reload()
// 			})
// 			source.addEventListener("warning", e => {
// 				console.warn(JSON.parse(e.data))
// 			})
// 		</script>
// 	</body>
// </html>
// `
// }
//
// func (a *RetroApp2) Build() {
// 	results := api.Build(api.BuildOptions{
// 		Bundle:      true,
// 		EntryPoints: []string{path.Join(a.WatchDirectory, "index.js")},
// 		Incremental: true,
// 		Outfile:     path.Join(a.BuildDirectory, "app.js"),
// 		Write:       true,
// 	})
// 	a.esbuildResult = results
// 	a.esbuildWarnings = results.Warnings
// 	a.esbuildErrors = results.Errors
// }
//
// func (a *RetroApp2) Rebuild() {
// 	start := time.Now()
//
// 	results := a.esbuildResult.Rebuild()
// 	a.esbuildResult = results
// 	a.esbuildWarnings = results.Warnings
// 	a.esbuildErrors = results.Errors
//
// 	stdout.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
// }
//
// // var (
// // 	stdout = NewLogger(os.Stdout)
// // 	stderr = NewLogger(os.Stderr)
// // )
//
// // TODO: Should copy public to build.
// func (app *RetroApp) watch() {
// 	var (
// 		// app              = newRetroApp()
// 		serverSentEvents = make(chan sse.Event, 8)
// 	)
//
// 	app.Build()
//
// 	stdout.Printf("👾 http://localhost:%d\n", app.ServePort)
//
// 	if len(app.esbuildWarnings) > 0 {
// 		stderr.Println(app.WarningString())
// 		// (Do not return or os.Exit(1))
// 	}
// 	if len(app.esbuildErrors) > 0 {
// 		stderr.Println(app.ErrorString())
// 		// (Do not return or os.Exit(1))
// 	}
//
// 	go func() {
// 		for range watcher.New(app.WatchDirectory, app.WatchPoll) {
// 			app.Rebuild()
// 			serverSentEvents <- sse.Event{Event: "reload"}
// 		}
// 	}()
//
// 	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
// 		if ext := path.Ext(r.URL.Path); ext == "" {
// 			app.Rebuild()
// 			if len(app.esbuildWarnings) > 0 {
// 				stderr.Println(app.WarningString())
// 				data, _ := json.Marshal(app.WarningString())
// 				defer func() {
// 					// Pause 100ms so the server-sent event does not drop on refresh:
// 					time.Sleep(100 * time.Millisecond)
// 					serverSentEvents <- sse.Event{Event: "warning", Data: string(data)}
// 				}()
// 			}
// 			if len(app.esbuildErrors) > 0 {
// 				stderr.Println(app.ErrorString())
// 				fmt.Fprintln(w, app.HTMLErrorString())
// 				return
// 			}
// 		}
// 		http.ServeFile(w, r, pathpkg.Join(string(app.BuildDirectory), r.URL.Path))
// 	})
//
// 	http.HandleFunc("/sse", func(w http.ResponseWriter, r *http.Request) {
// 		w.Header().Set("Content-Type", "text/event-stream")
// 		w.Header().Set("Cache-Control", "no-cache")
// 		w.Header().Set("Connection", "keep-alive")
// 		flusher, ok := w.(http.Flusher)
// 		if !ok {
// 			stderr.Println("Your browser doesn’t appear to support server-sent events (serverSentEvents). " +
// 				"This means changes to your source code can’t automatically refresh your browser tab.")
// 			return
// 		}
// 		for {
// 			select {
// 			case e := <-serverSentEvents:
// 				e.Write(w)
// 				flusher.Flush()
// 			case <-r.Context().Done():
// 				// No-op
// 				return
// 			}
// 		}
// 	})
//
// 	if err := http.ListenAndServe(fmt.Sprintf(":%d", app.ServePort), nil); err != nil {
// 		stderr.Println(err)
// 		os.Exit(1)
// 	}
//
// }
