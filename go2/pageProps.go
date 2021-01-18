package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
)

// TODO: Add tests.
func camelCase(filename string) string {
	byteIsLetter := func(b byte) bool {
		ok := ('a' <= b && b <= 'z') ||
			('A' <= b && b <= 'Z')
		return ok
	}

	trim := filename
	trim = strings.TrimPrefix(trim, "./")           // Remove ./etc
	trim = trim[:len(trim)-len(filepath.Ext(trim))] // Remove etc.*

	var ret string
	for x := 0; x < len(trim); x++ {
		switch trim[x] {
		case '/':
			ret += "Slash"
			x++
			if x < len(trim) {
				ret += strings.ToUpper(string(trim[x]))
			}
		case '-':
			x++
			if x < len(trim) && byteIsLetter(trim[x]) {
				ret += strings.ToUpper(string(trim[x]))
			}
		default:
			ret += string(trim[x])
		}
	}

	return ret
}

// TODO: Add tests.
func pageCase(filename string) string {
	camelCase := camelCase(filename)
	return "Page" + strings.Split(camelCase, "PagesSlash")[1]
}

// renderPageProps renders cache/pageProps.jsonc contents.
func renderPageProps(filenames []string) ([]byte, error) {
	var requires string
	for x, filename := range filenames {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requires += sep + fmt.Sprintf("const %s = require(%q)", pageCase(filename), filename)
	}

	var importsAsArr string
	for x, filename := range filenames {
		var sep string
		if x > 0 {
			sep = ", "
		}
		importsAsArr += sep + fmt.Sprintf("{ name: %[1]q, imports: %[1]s }", pageCase(filename))
	}
	importsAsArr = "[" + strings.Join(strings.Split(importsAsArr, "{ "), "\n\t\t{ ") + ",\n\t]"

	js := `// import React from "react"
// import ReactDOMServer from "react-dom/server"

// Synthetic requires
` + requires + `

async function asyncRun(imports) {
	const chain = []
	for (const each of imports) {
		const p = new Promise(async resolve => {
			const { load } = each.imports
			const loadProps = await load()
			resolve({ name: each.name, loadProps })
		})
		chain.push(p)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.name] = each.loadProps
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap, null, 2))
}

;(async () => {
	// Synthetic imports array
	await asyncRun(` + importsAsArr + `)
})()
`

	err := ioutil.WriteFile("app2.js", []byte(js), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write file: %w", err)
	}

	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{"app2.js"},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(result.Errors) > 0 {
		bstr, err := json.MarshalIndent(result.Errors, "", "\t")
		if err != nil {
			return nil, fmt.Errorf("failed to marshal; %w", err)
		}
		return nil, errors.New(string(bstr))
	}

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to pipe stdin: %w", err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(result.OutputFiles[0].Contents)
	}()

	out, err := cmd.CombinedOutput()
	if err != nil {
		if len(out) != 0 { // stderr takes precedence
			return nil, fmt.Errorf("failed to run command: %s", out)
		}
		return nil, fmt.Errorf("failed to run command: %w", err)
	}

	return out, nil
}
