package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	pathpkg "path"
	"strings"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
)

// var re = regexp.MustCompile(`(?m)^\s+`)

func prerenderPages(retro Retro) error {
	bstr, err := ioutil.ReadFile(path.Join(retro.Config.AssetDir, "index.html"))
	if err != nil {
		return fmt.Errorf("failed to read %s/index.html; %w", retro.Config.AssetDir, err)
	}

	text := string(bstr)
	if !strings.Contains(text, `{{ .Head }}`) {
		return errors.New(`no such {{ .Head }}; add to <head>`)
	} else if !strings.Contains(text, `{{ .Page }}`) {
		return errors.New(`no such {{ .Page }}; add to <body>`)
	}

	tmpl, err := template.New(path.Join(retro.Config.AssetDir, "index.html")).Parse(text)
	if err != nil {
		return fmt.Errorf("failed to parse template %s/index.html; %w", retro.Config.AssetDir, err)
	}

	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + buildRequireStmt(retro.Routes) + `

// Props
const props = require("../` + retro.Config.CacheDir + `/props.js").default

async function asyncRun(requireStmtAsArray) {
	const chain = []
	for (const { fs_path, path, exports } of requireStmtAsArray) {
		const promise = new Promise(async resolve => {
			const { Head, default: Page } = exports
			let head = ""
			if (Head) {
 				head = ReactDOMServer.renderToStaticMarkup(<Head {...props[path]} />)
			}
			let page = '<div id="root"></div>'
			if (Page) {
				page = ReactDOMServer.renderToString(<div id="root"><Page {...props[path]} /></div>)
			}
			resolve({ fs_path, path, head, page })
		})
		chain.push(promise)
	}
	const resolvedAsArr = await Promise.all(chain)
	console.log(JSON.stringify(resolvedAsArr, null, 2))
}

asyncRun(` + buildRequireStmtAsArray(retro.Routes) + `)
`

	if err := ioutil.WriteFile(pathpkg.Join(retro.Config.CacheDir, "pages.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return fmt.Errorf("failed to write %s/pages.esbuild.js; %w", retro.Config.CacheDir, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{pathpkg.Join(retro.Config.CacheDir, "pages.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return fmt.Errorf("failed to marshal; %w", err)
		}
		return errors.New(string(bstr))
	}

	var (
		stdoutBuf bytes.Buffer
		stderrBuf bytes.Buffer
	)

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to pipe stdin to node; %w", err)
	}

	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	go func() {
		defer stdin.Close()
		stdin.Write(results.OutputFiles[0].Contents)
	}()

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to pipe node; %w", err)
	} else if stderr := stderrBuf.String(); stderr != "" {
		return fmt.Errorf("failed to pipe node; %w", errors.New(stderr))
	}

	var pages []struct {
		FSPath string `json:"fs_path"`
		Path   string `json:"path"`

		Head string `json:"head"`
		Page string `json:"page"`
	}
	if err := json.Unmarshal(stdoutBuf.Bytes(), &pages); err != nil {
		return fmt.Errorf("failed to unmarshal; %w", err)
	}

	// TODO: Change to sync.WaitGroup or errgroup?
	for _, each := range pages {
		var path string
		path = each.FSPath[len(retro.Config.PagesDir):]          // pages/page.js -> page.js
		path = path[:len(path)-len(pathpkg.Ext(path))] + ".html" // page.js -> page.html
		path = pathpkg.Join(retro.Config.BuildDir, path)         // page.html -> build/page.html
		if dir := pathpkg.Dir(path); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return fmt.Errorf("failed to mkdir -p %s; %w", dir, err)
			}
		}
		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, each); err != nil {
			return fmt.Errorf("failed to execute template %s; %w", path, err)
		}
		if err := ioutil.WriteFile(path, buf.Bytes(), 0644); err != nil {
			return fmt.Errorf("failed to write %s; %w", path, err)
		}
	}
	return nil
}
