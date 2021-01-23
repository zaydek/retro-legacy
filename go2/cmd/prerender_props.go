package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	pathpkg "path"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/errs"
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

	if err := ioutil.WriteFile(pathpkg.Join(retro.Config.CacheDir, "props.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(retro.Config.CacheDir, "props.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{pathpkg.Join(retro.Config.CacheDir, "props.esbuild.js")},
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

	if err := ioutil.WriteFile(pathpkg.Join(retro.Config.CacheDir, "props.js"), contents, 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(retro.Config.CacheDir, "props.js"), err)
	}
	return nil
}
