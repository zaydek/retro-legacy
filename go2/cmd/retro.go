package main

import (
	_ "embed"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"time"

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
	start := time.Now()

	// Get paths not created by the user:
	var paths []string
	err := fs.WalkDir(static.StaticFS, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			if _, err := os.Stat(path.Join(rootDir, path.Dir(p))); os.IsNotExist(err) {
				paths = append(paths, p)
			}
		}
		return nil
	})
	if err != nil {
		panic(err)
	}

	// Copy from the embedded filesystem to disk:
	for _, p := range paths {
		if dir := path.Join(rootDir, path.Dir(p)); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				panic(fmt.Errorf("an unexpected error occurred; %w", err))
			}
		}
		in, err := static.StaticFS.Open(p)
		if err != nil {
			panic(fmt.Errorf("an unexpected error occurred; %w", err))
		}
		out, err := os.Create(path.Join(rootDir, p))
		if err != nil {
			panic(fmt.Errorf("an unexpected error occurred; %w", err))
		}
		if _, err := io.Copy(out, in); err != nil {
			if err != nil {
				panic(fmt.Errorf("an unexpected error occurred; %w", err))
			}
		}
		in.Close()
		out.Close()
	}

	elapsed := time.Since(start)
	fmt.Fprintf(r.stdout, "⚡️ success! (%0.3f)\n", elapsed.Seconds())
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
