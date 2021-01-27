package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	pathpkg "path"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/errs"
)

func (r Runtime) prerenderProps() error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

// Pages
` + buildRequireStmt(r.Router) + `

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

asyncRun(` + buildRequireStmtAsArray(r.Router) + `)
`

	if err := ioutil.WriteFile(pathpkg.Join(r.Config.CacheDirectory, "props.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(r.Config.CacheDirectory, "props.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{pathpkg.Join(r.Config.CacheDirectory, "props.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		return errors.New(FormatMessageAsTermString(results.Errors))
	}

	stdoutBuf, err := runNode(results.OutputFiles[0].Contents)
	if err != nil {
		return err
	}

	contents := []byte(`// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

export default ` + stdoutBuf.String())

	if err := ioutil.WriteFile(pathpkg.Join(r.Config.CacheDirectory, "props.js"), contents, 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(r.Config.CacheDirectory, "props.js"), err)
	}
	return nil
}
