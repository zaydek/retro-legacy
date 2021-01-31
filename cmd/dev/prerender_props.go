package dev

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
)

func (r Runtime) prerenderProps() error {
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

// Pages
` + strings.Join(requires(r.Router), "\n") + `

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

asyncRun([
	` + strings.Join(exports(r.Router), ",\n\t") + `
])
`

	src := p.Join(r.Config.CacheDirectory, "props.esbuild.js")
	dst := p.Join(r.Config.CacheDirectory, "props.js")

	if err := ioutil.WriteFile(src, []byte(text), perm.File); err != nil {
		return errs.WriteFile(src, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{src},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX, ".ts": api.LoaderTSX},
	})
	// TODO
	if len(results.Warnings) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Warnings))
	}
	if len(results.Errors) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	// TODO
	stdoutBuf, err := runNode(results.OutputFiles[0].Contents)
	if err != nil {
		return err
	}

	contents := []byte(`// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

export default ` + stdoutBuf.String())

	if err := ioutil.WriteFile(dst, contents, perm.File); err != nil {
		return errs.WriteFile(dst, err)
	}
	return nil
}
