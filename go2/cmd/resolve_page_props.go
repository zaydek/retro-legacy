package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os/exec"
	"path"

	"github.com/evanw/esbuild/pkg/api"
)

// resolvePageProps asynchronously resolves bytes for pageProps.js.
//
// TODO: Test for the presence of Node.
func resolvePageProps(retro Retro) ([]byte, error) {
	requires, imports := buildRequiresAndImports(retro)

	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
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
	await asyncRun(` + imports + `)
})()
`

	if err := ioutil.WriteFile(path.Join(retro.config.CacheDir, "pageProps.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return nil, fmt.Errorf("failed to write %s/pageProps.esbuild.js: %w", retro.config.CacheDir, err)
	}

	res := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{path.Join(retro.config.CacheDir, "pageProps.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(res.Errors) > 0 {
		bstr, err := json.MarshalIndent(res.Errors, "", "\t")
		if err != nil {
			return nil, fmt.Errorf("failed to marshal; %w", err)
		}
		return nil, errors.New(string(bstr))
	}

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to pipe stdin to node: %w", err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(res.OutputFiles[0].Contents)
	}()

	output, err := cmd.CombinedOutput()
	if err != nil {
		if len(output) != 0 { // stderr takes precedence
			return nil, fmt.Errorf("failed to run node: %s", output)
		}
		return nil, fmt.Errorf("failed to run node: %w", err)
	}

	contents := []byte("// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.\n\nmodule.exports = " + string(output))
	return contents, nil
}
