package main

import (
	"bytes"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path"

	"github.com/zaydek/retro/static"
)

func (r Retro) init(rootDir string) {
	_, err := os.Stat(rootDir)
	if rootDir != "." && !os.IsNotExist(err) {
		stderr.Fatalf("delete %[1]s and rerun retro init %[1]s\n", rootDir)
	}

	var paths []string
	var warnPaths []string
	err = fs.WalkDir(static.StaticFS, ".", func(embedPath string, d fs.DirEntry, err error) error {
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
			f, err := static.StaticFS.Open(embedPath)
			if err != nil {
				return err
			}
			b2, err := ioutil.ReadAll(f)
			if err != nil {
				return err
			}
			if !bytes.Equal(b1, b2) {
				warnPaths = append(warnPaths, diskPath)
				return nil
			}
			f.Close()
		}
		paths = append(paths, embedPath)
		return nil
	})
	if err != nil {
		stderr.Fatalf("an unexpected error occurred; %w", err)
	}

	if len(warnPaths) > 0 {
		var msg string
		for x, warn := range warnPaths {
			var sep string
			if x > 0 {
				sep = "\n"
			}
			msg += sep + "- " + warn
		}
		stderr.Fatalln("delete and rerun retro init" + "\n\n" + msg)
	}

	for _, p := range paths {
		if diskDir := path.Join(rootDir, path.Dir(p)); diskDir != "." {
			if err := os.MkdirAll(diskDir, 0755); err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		fileIn, err := static.StaticFS.Open(p)
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		fileOut, err := os.Create(path.Join(rootDir, p))
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		if _, err := io.Copy(fileOut, fileIn); err != nil {
			if err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		fileIn.Close()
		fileOut.Close()
	}

	if rootDir == "." {
		stdout.Print(`🔥 created a retro app

   npm or yarn
   retro
`)
	} else {
		stdout.Printf(`🔥 created retro app %[1]s

   cd %[1]s
   npm or yarn
   retro
`, rootDir)
	}
}
