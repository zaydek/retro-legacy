package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path"
	"time"

	"github.com/evanw/esbuild/pkg/api"
)

type ReactMeta struct {
	LoadProps map[string]interface{} `json:"loadProps"`
	Head      string                 `json:"head"`
}

// func main() {
//   result := api.Build(api.BuildOptions{
//     EntryPoints: []string{"app.js"},
//     Bundle:      true,
//     Outfile:     "out.js",
//     Incremental: true,
//   })
//   if len(result.Errors) > 0 {
//     os.Exit(1)
//   }
//
//   // Call "Rebuild" as many times as you want
//   for i := 0; i < 5; i++ {
//     result2 := result.Rebuild()
//     if len(result2.Errors) > 0 {
//       os.Exit(1)
//     }
//   }
// }

// func IPCReactLoadPropsAndHead() ReactMeta

var resolveRetroStaticPathPlugin = api.Plugin{
	Name: "resolveRetroStaticPathPlugin",
	Setup: func(build api.PluginBuild) {
		build.OnResolve(api.OnResolveOptions{Filter: "^%RETRO_STATIC_PATH%$"},
			func(args api.OnResolveArgs) (api.OnResolveResult, error) {
				cwd, err := os.Getwd()
				if err != nil {
					return api.OnResolveResult{}, fmt.Errorf("cannot cwd for plugin resolveRetroStaticPathPlugin; %w", err)
				}
				// Must resolve an absolute path; use cwd:
				return api.OnResolveResult{Path: path.Join(cwd, "retro-app/pages/index.js")}, nil
			})
	},
}

func main() {
	t1 := time.Now()
	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": `"production"`},
		EntryPoints: []string{"app.js"},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
		Plugins:     []api.Plugin{resolveRetroStaticPathPlugin},
	})
	if len(result.Errors) > 0 {
		bstr, _ := json.MarshalIndent(result.Errors, "", "\t")
		fmt.Fprintln(os.Stderr, string(bstr))
		os.Exit(1)
	}
	fmt.Printf("%0.3fs - esbuild\n", time.Since(t1).Seconds())

	t2 := time.Now()
	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		panic(fmt.Errorf("failed to pipe stdin: %w", err))
	}

	go func() {
		defer stdin.Close()
		stdin.Write(result.OutputFiles[0].Contents)
	}()

	out, err := cmd.CombinedOutput()
	if err != nil {
		if len(out) != 0 { // stderr takes precedence
			panic(fmt.Errorf("failed to run command: %s", out))
		}
		panic(fmt.Errorf("failed to run command: %w", err))
	}
	fmt.Printf("%0.3fs - node\n", time.Since(t2).Seconds())

	var meta ReactMeta
	err = json.Unmarshal(out, &meta)
	if err != nil {
		panic(fmt.Errorf("failed to unmarshal: %w", err))
	}

	fmt.Print("loadProps=", meta.LoadProps, "\n")
	fmt.Print("head=", meta.Head, "\n")
}
