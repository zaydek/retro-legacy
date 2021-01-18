package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path"
	"sync"

	"github.com/evanw/esbuild/pkg/api"
)

type ReactMeta struct {
	LoadProps map[string]interface{} `json:"loadProps"`
	Head      string                 `json:"head"`
}

func resolveMeta(filename string) (ReactMeta, error) {
	resolveRetroStaticPathPlugin := api.Plugin{
		Name: "resolveRetroStaticPathPlugin",
		Setup: func(build api.PluginBuild) {
			build.OnResolve(api.OnResolveOptions{Filter: "^%RETRO_STATIC_PATH%$"},
				func(args api.OnResolveArgs) (api.OnResolveResult, error) {
					cwd, err := os.Getwd()
					if err != nil {
						return api.OnResolveResult{}, fmt.Errorf("cannot cwd for plugin resolveRetroStaticPathPlugin; %w", err)
					}
					return api.OnResolveResult{Path: path.Join(cwd, filename)}, nil
				})
		},
	}

	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{"app.js"},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
		Plugins:     []api.Plugin{resolveRetroStaticPathPlugin},
	})
	if len(result.Errors) > 0 {
		bstr, err := json.MarshalIndent(result.Errors, "", "\t")
		if err != nil {
			return ReactMeta{}, fmt.Errorf("failed to marshal; %w", err)
		}
		return ReactMeta{}, errors.New(string(bstr))
	}

	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return ReactMeta{}, fmt.Errorf("failed to pipe stdin: %w", err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(result.OutputFiles[0].Contents)
	}()

	out, err := cmd.CombinedOutput()
	if err != nil {
		if len(out) != 0 { // stderr takes precedence
			return ReactMeta{}, fmt.Errorf("failed to run command: %s", out)
		}
		return ReactMeta{}, fmt.Errorf("failed to run command: %w", err)
	}

	var meta ReactMeta
	err = json.Unmarshal(out, &meta)
	if err != nil {
		return ReactMeta{}, fmt.Errorf("failed to unmarshal: %w", err)
	}
	return meta, nil
}

func main() {
	filenames := []string{
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
		"retro-app/pages/index.js",
	}

	var wg sync.WaitGroup
	for _, filename := range filenames {
		wg.Add(1)
		go func(filename string) {
			defer wg.Done()
			meta, err := resolveMeta("retro-app/pages/index.js")
			if err != nil {
				panic(err)
			}
			fmt.Print("loadProps=", meta.LoadProps, "\n")
			fmt.Print("head=", meta.Head, "\n")
		}(filename)
	}
	wg.Wait()
}
