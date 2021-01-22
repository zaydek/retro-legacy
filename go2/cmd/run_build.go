package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os/exec"
	"path"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
)

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	stderr.Fatalln(err)
}

// TODO: Should copy public to build.
func (r Retro) build() {
	var err error
	if r.Config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.Routes, err = loadRoutes(r.Config); err != nil {
		stderr.Fatalln(err)
	}

	must(prerenderPageProps(r))
	must(prerenderApp(r))
	// must(prerenderPages(r))

	rawstr := `import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + buildRequireStmt(r.Routes) + `

// Page props
const pageProps = require("../{{ .Config.CacheDir }}/pageProps.js")

async function asyncRun(requireStmtAsArray) {
	const chain = []
	for (const { path, exports } of requireStmtAsArray) {
		const promise = new Promise(async resolve => {
			const { Head, default: Page } = exports
			let head = ""
			if (Head) {
 				head = ReactDOMServer.renderToStaticMarkup(<Head {...pageProps[path]} />)
			}
			let page = ""
			if (Page) {
				page = ReactDOMServer.renderToString(<Page {...pageProps[path]} />)
			}
			resolve({ path, head, page })
		})
		chain.push(promise)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.path] = { head: each.head, page: each.page }
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap, null, 2))
}

asyncRun(` + buildRequireStmtAsArray(r.Routes) + `)
`

	var buf bytes.Buffer
	tmpl, err := template.New(path.Join(r.Config.CacheDir, "pages.artifact.js")).Parse(rawstr)
	if err != nil {
		// return fmt.Errorf("failed to parse template %s/pages.artifact.js; %w", retro.Config.CacheDir, err)
		panic(err)
	} else if err := tmpl.Execute(&buf, r); err != nil {
		// return fmt.Errorf("failed to execute template %s/pages.artifact.js; %w", retro.Config.CacheDir, err)
		panic(err)
	}

	if err := ioutil.WriteFile(path.Join(r.Config.CacheDir, "pages.artifact.js"), buf.Bytes(), 0644); err != nil {
		panic(err)
	}

	// contents, err := ioutil.ReadFile(path.Join(r.Config.CacheDir, "pages.artifact.js"))
	// if err != nil {
	// 	panic(err)
	// }

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{path.Join(r.Config.CacheDir, "pages.artifact.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			// return fmt.Errorf("failed to marshal; %w", err)
			panic(err)
		}
		// return errors.New(string(bstr))
		panic(string(bstr))
	}

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		// return fmt.Errorf("failed to pipe stdin to node; %w", err)
		panic(err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(results.OutputFiles[0].Contents)
	}()

	output, err := cmd.CombinedOutput()
	if err != nil {
		if len(output) != 0 { // stderr takes precedence
			// return fmt.Errorf("failed to pipe node: %s", output)
			panic(string(output))
		}
		// return fmt.Errorf("failed to pipe node; %w", err)
		panic(err)
	}

	fmt.Print(string(output))
}
