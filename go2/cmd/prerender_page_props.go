package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os/exec"
	"path"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
)

func buildRequireStatement(routes []PageBasedRoute) string {
	var requires string
	for x, each := range routes {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requires += sep + fmt.Sprintf(`const %s = require("../%s")`,
			each.Component, each.FSPath)
	}
	return requires
}

func buildRequireStatementAsArray(routes []PageBasedRoute) string {
	var requireAsArray string
	for x, each := range routes {
		var sep string
		if x > 0 {
			sep = ", "
		}
		requireAsArray += sep + fmt.Sprintf(`{ path: %q, imports: %s }`,
			each.Path, each.Component)
	}
	requireAsArray = "[" + strings.Join(strings.Split(requireAsArray, "{ "), "\n\t{ ") + ",\n]"
	return requireAsArray
}

// TODO: Test for the presence of Node.
func prerenderPageProps(retro Retro) error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

` + buildRequireStatement(retro.Routes) + `

async function asyncRun(imports) {
	const chain = []
	for (const each of imports) {
		const p = new Promise(async resolve => {
			const { load } = each.imports
			const loadProps = await load()
			resolve({ path: each.path, loadProps })
		})
		chain.push(p)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.path] = each.loadProps
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap, null, 2))
}

asyncRun(` + buildRequireStatementAsArray(retro.Routes) + `)
`
	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "pageProps.artifact.js"), []byte(rawstr), 0644); err != nil {
		return fmt.Errorf("failed to write %s/pageProps.artifact.js; %w", retro.Config.CacheDir, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{path.Join(retro.Config.CacheDir, "pageProps.artifact.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return fmt.Errorf("failed to marshal; %w", err)
		}
		return errors.New(string(bstr))
	}

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to pipe stdin to node; %w", err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(results.OutputFiles[0].Contents)
	}()

	output, err := cmd.CombinedOutput()
	if err != nil {
		if len(output) != 0 { // stderr takes precedence
			return fmt.Errorf("failed to pipe node: %s", output)
		}
		return fmt.Errorf("failed to pipe node; %w", err)
	}

	contents := []byte(`// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

export default ` + string(output))
	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "pageProps.js"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/pageProps.js; %w", retro.Config.CacheDir, err)
	}
	return nil
}
