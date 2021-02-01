package render

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/dev"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/run"
)

func Props(runtime dev.Runtime) error {
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

// Pages
` + strings.Join(requires(runtime.PageBasedRouter), "\n") + `

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
	` + strings.Join(exports(runtime.PageBasedRouter), ",\n\t") + `
])
`

	src := p.Join(runtime.DirConfiguration.CacheDirectory, "props.esbuild.js")
	dst := p.Join(runtime.DirConfiguration.CacheDirectory, "props.js")

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
		return errors.New(FormatEsbuildMessagesAsTermString(results.Warnings))
	} else if len(results.Errors) > 0 {
		return errors.New(FormatEsbuildMessagesAsTermString(results.Errors))
	}

	// TODO
	stdout, err := run.Cmd(results.OutputFiles[0].Contents, "node")
	if err != nil {
		return err
	}

	contents := []byte(`// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

export default ` + string(stdout))

	if err := ioutil.WriteFile(dst, contents, perm.File); err != nil {
		return errs.WriteFile(dst, err)
	}
	return nil
}
