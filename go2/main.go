package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/evanw/esbuild/pkg/api"
)

// Renders load.
func main() {
	// esbuild retro-app/pages/index.js \
	//   --bundle \
	//   --define:process.env.NODE_ENV=\"production\" \
	//   --loader:.js=jsx
	//

	t1 := time.Now()
	result := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": `"production"`},
		EntryPoints: []string{"app.js"},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
		Outfile:     "tmp.js",
	})
	if len(result.Errors) > 0 {
		bstr, _ := json.MarshalIndent(result.Errors, "", "\t")
		fmt.Fprintln(os.Stderr, bstr)
		os.Exit(1)
	}
	fmt.Printf("%0.3fs - esbuild\n", time.Since(t1).Seconds())

	t2 := time.Now()
	cmd := exec.Command("node")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		defer stdin.Close()
		stdin.Write(result.OutputFiles[0].Contents)
	}()

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("%0.3fs - node\n", time.Since(t2).Seconds())

	fmt.Print(string(out))
}
