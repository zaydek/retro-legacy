package main

import (
	_ "embed"
	"io/fs"
	"os"
	"path"
	"strings"

	"fmt"
	"io"

	"github.com/zaydek/retro/static"
)

// Retro is a namespace for commands.
type Retro struct {
	stdout io.Writer // In writer
	stderr io.Writer // Out writer
}

func newRetro(stdout, stderr io.Writer) Retro {
	return Retro{stdout: stdout, stderr: stderr}
}

//go:embed usage
var usageMessage string

func (r Retro) help() {
	fmt.Fprintln(r.stdout, usageMessage)
}

func (r Retro) unknown(cmd string) {
	fmt.Fprintln(r.stderr, fmt.Sprintf("unknown command %s; try retro help", cmd))
}

type MaskedPath struct {
	mask string
	path string
}

func (r Retro) init(rootDir string) {
	var paths []string
	err := fs.WalkDir(static.AssetFS, "starter", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		// Step-over starter:
		if p != "starter" {
			paths = append(paths, p)
		}
		return nil
	})
	if err != nil {
		panic(err)
	}

	// Mask starter:
	var maskedPaths []MaskedPath
	for _, p := range paths {
		maskedPaths = append(maskedPaths, MaskedPath{
			mask: strings.TrimPrefix(p, "starter/"),
			path: p,
		})
	}

	// mkdir -p
	for _, mp := range maskedPaths {
		dir := path.Join(rootDir, path.Dir(mp.mask))
		// NOTE: Compare "." because path.Join(".", ".") returns ".".
		if dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				panic(fmt.Errorf("an unexpected error occurred; %w", err))
			}
		}
		// if err := ioutil.WriteFile(path.Join(root, mp.path), mp.Contents, 0644); err != nil {
		// 	panic(fmt.Errorf("an unexpected error occurred; %w", err))
		// }
	}

	// // arr := strings.SplitN("a/b/c/d", "/", 2)
	// for _, path := range paths {
	// 	// if arr := strings.SplitN(p, "/", 2); len(arr) > 1 {
	// 	// 	fmt.Println(arr[1:])
	// 	// }
	// 	bstr, err := fsys.ReadFile(path)
	// 	if err != nil {
	// 		panic(err)
	// 	}
	// 	fmt.Println(string(bstr))
	// 	ioutil.WriteFile(, bstr, 0644)
	// }

}

func (r Retro) watch() {
	fmt.Fprintln(r.stdout, "! Not yet implemented")
}

func (r Retro) build() {
	fmt.Fprintln(r.stdout, "! Not yet implemented")
}

func (r Retro) serve() {
	fmt.Fprintln(r.stdout, "! Not yet implemented")
}
