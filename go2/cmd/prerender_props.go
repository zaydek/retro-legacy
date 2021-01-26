package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	pathpkg "path"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/errs"
)

func prerenderProps(app *RetroApp) error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

// Pages
` + buildRequireStmt(app.PageBasedRouter) + `

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

asyncRun(` + buildRequireStmtAsArray(app.PageBasedRouter) + `)
`

	if err := ioutil.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "props.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "props.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", app.Configuration.Env == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", app.Configuration.Env),
		},
		EntryPoints: []string{pathpkg.Join(app.Configuration.CacheDirectory, "props.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return errs.Unexpected(err)
		}
		return errors.New(string(bstr))
	}

	stdoutBuf, err := pipeNode(results.OutputFiles[0].Contents)
	if err != nil {
		return errs.PipeNode(err)
	}

	contents := []byte(`// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

export default ` + stdoutBuf.String())

	if err := ioutil.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "props.js"), contents, 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "props.js"), err)
	}
	return nil
}
