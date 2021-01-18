package main

import (
	"bytes"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/static"
)

func (r Retro) init(rootDir string) {
	var paths []string
	err := fs.WalkDir(static.StaticFS, ".", func(embedPath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		diskPath := path.Join(rootDir, embedPath)
		if _, err := os.Stat(diskPath); !os.IsNotExist(err) {
			b1, err := ioutil.ReadFile(diskPath)
			if err != nil {
				return err
			}
			file, err := static.StaticFS.Open(embedPath)
			if err != nil {
				return err
			}
			b2, err := ioutil.ReadAll(file)
			if err != nil {
				return err
			}
			if !bytes.Equal(b1, b2) {
				stderr.Printf("found %[1]s; delete %[1]s and rerun retro init or ignore this warning\n", diskPath)
				return nil
			}
			file.Close()
		}
		paths = append(paths, embedPath)
		return nil
	})
	if err != nil {
		stderr.Fatalf("an unexpected error occurred; %w", err)
	}

	for _, p := range paths {
		if diskDir := path.Join(rootDir, path.Dir(p)); diskDir != "." {
			if err := os.MkdirAll(diskDir, 0755); err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		in, err := static.StaticFS.Open(p)
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		out, err := os.Create(path.Join(rootDir, p))
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		if _, err := io.Copy(out, in); err != nil {
			if err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		in.Close()
		out.Close()
	}

	if rootDir == "." {
		stdout.Print(`🔥 created a retro app

   npm or yarn
   retro
`)
	} else {
		stdout.Printf(`🔥 created retro app `+color.BoldTeal("`")+color.Bold(`%[1]s`)+color.BoldTeal("`")+`

   cd %[1]s
   npm or yarn
   retro
`, rootDir)
	}
}
