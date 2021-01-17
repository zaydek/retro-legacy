package main

import (
	"fmt"
	"os"
	"path"

	"github.com/evanw/esbuild/pkg/api"
)

func main() {
	resolveDynamicImportPath := api.Plugin{
		Name: "resolveDynamicImportPath",
		Setup: func(build api.PluginBuild) {
			build.OnResolve(api.OnResolveOptions{Filter: "TEST"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					cwd, err := os.Getwd()
					if err != nil {
						return api.OnResolveResult{}, fmt.Errorf("cannot get the cwd for plugin resolveDynamicImportPath; %w", err)
					}
					return api.OnResolveResult{
						Path: path.Join(cwd, "HelloWorld.tsx"),
					}, nil
				})
		},
	}

	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{"run.tsx"},
		Outfile:     "out.js",
		Plugins:     []api.Plugin{resolveDynamicImportPath},
		Write:       true,
	})
	if len(result.Warnings) > 0 {
		for _, w := range result.Warnings {
			os.Stderr.WriteString(w.Text + "\n")
		}
	}
	if len(result.Errors) > 0 {
		for _, e := range result.Errors {
			os.Stderr.WriteString(e.Text + "\n")
		}
		os.Exit(1)
	}
}
