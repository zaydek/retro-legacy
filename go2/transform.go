package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/evanw/esbuild/pkg/api"
)

var filenames = []string{
	"./retro-app/pages/index.js",
	// "./retro-app/pages/nested/index.js",
}

func name(filename string) string {
	var name string
	name = filepath.Base(filename)
	name = name[:len(name)-len(filepath.Ext(name))]
	return name
}

func main() {
	var requires string
	for x, filename := range filenames {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requires += sep + fmt.Sprintf("const %s = require(%q)", name(filename), filename)
	}

	var importsAsArr string
	for x, filename := range filenames {
		var sep string
		if x > 0 {
			sep = ", "
		}
		importsAsArr += sep + fmt.Sprintf("{ name: %[1]q, imports: %[1]s }", name(filename))
	}
	importsAsArr = "[" + importsAsArr + "]"

	js := `import React from "react"
import ReactDOMServer from "react-dom/server"

// Synthetic requires
` + requires + `

async function asyncRun(imports) {
	const chain = []
	for (const each of imports) {
		const p = new Promise(async resolve => {
			const { load, head: Head } = each.imports
			const loadProps = await load()
			const head = ReactDOMServer.renderToStaticMarkup(<Head {...loadProps} />)
			resolve({ name: each.name, loadProps, head })
		})
		chain.push(p)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.name] = { ...each, name: undefined }
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap))
}

;(async () => {
	// Synthetic imports array
	await asyncRun(` + importsAsArr + `)
})()
`

	err := ioutil.WriteFile("app2.js", []byte(js), 0644)
	if err != nil {
		panic(fmt.Errorf("failed to write file: %w", err))
	}

	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{"app2.js"},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(result.Errors) > 0 {
		bstr, _ := json.MarshalIndent(result.Errors, "", "\t")
		fmt.Println(string(bstr))
		os.Exit(1)
	}
	fmt.Print(string(result.OutputFiles[0].Contents))
}
