package main

import (
	_ "embed"
	"io/fs"
	"io/ioutil"
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
	masked string
	actual string
}

func (r Retro) init(rootDir string) {
	var paths []string
	err := fs.WalkDir(static.AssetFS, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			paths = append(paths, p)
		}
		return nil
	})
	if err != nil {
		panic(err)
	}

	// Mask starter:
	var maskedPaths []MaskedPath
	for _, actual := range paths {
		masked := strings.TrimPrefix(actual, "starter/")
		maskedPaths = append(maskedPaths, MaskedPath{masked: masked, actual: actual})
	}

	// - Make directories
	// - Read files from the embedded filesystem
	// - Write to disk
	//
	for _, mp := range maskedPaths {
		if dir := path.Join(rootDir, path.Dir(mp.masked)); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				panic(fmt.Errorf("an unexpected error occurred; %w", err))
			}
		}
		bstr, err := static.AssetFS.ReadFile(mp.actual)
		if err != nil {
			panic(fmt.Errorf("an unexpected error occurred; %w", err))
		}
		filename := path.Join(rootDir, mp.masked)
		if err := ioutil.WriteFile(filename, bstr, 0644); err != nil {
			panic(fmt.Errorf("an unexpected error occurred; %w", err))
		}
	}
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
