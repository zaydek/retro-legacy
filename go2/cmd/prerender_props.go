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

func prerenderProps(retro Retro) error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

// Pages
` + buildRequireStmt(retro.Routes) + `

async function asyncRun(requireStmtAsArray) {
	const chain = []
	for (const { path, exports } of requireStmtAsArray) {
		const promise = new Promise(async resolve => {
			const load = exports.load
			let props = {}
			if (load) {
				props = await load()
			}
			resolve({ path, props })
		})
		chain.push(promise)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.path] = each.props
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap, null, 2))
}

asyncRun(` + buildRequireStmtAsArray(retro.Routes) + `)
`
	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "props.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return fmt.Errorf("failed to write %s/props.esbuild.js; %w", retro.Config.CacheDir, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{path.Join(retro.Config.CacheDir, "props.esbuild.js")},
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
	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "props.js"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/props.js; %w", retro.Config.CacheDir, err)
	}
	return nil
}
