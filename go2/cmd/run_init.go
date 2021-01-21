package main

import (
	"bytes"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/embedded"
)

func (r Retro) init(rootDir string) {
	if rootDir != "." {
		if _, err := os.Stat(rootDir); !os.IsNotExist(err) {
			stderr.Fatalf("delete %[1]s and rerun retro init %[1]s\n", rootDir)
		}
	}

	var (
		embeddedPaths      []string
		corruptedUserPaths []string
	)

	if err := fs.WalkDir(embedded.FS, ".", func(embeddedPath string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if dirEntry.IsDir() {
			return nil
		}
		userPath := path.Join(rootDir, embeddedPath)
		if _, err := os.Stat(userPath); !os.IsNotExist(err) {
			userBytes, err := ioutil.ReadFile(userPath)
			if err != nil {
				return err
			}
			f, err := embedded.FS.Open(embeddedPath)
			if err != nil {
				return err
			}
			embeddedBytes, err := ioutil.ReadAll(f)
			if err != nil {
				return err
			}
			if !bytes.Equal(userBytes, embeddedBytes) {
				corruptedUserPaths = append(corruptedUserPaths, userPath)
				return nil
			}
			f.Close()
		}
		embeddedPaths = append(embeddedPaths, embeddedPath)
		return nil
	}); err != nil {
		stderr.Fatalf("an unexpected error occurred; %w", err)
	}

	if len(corruptedUserPaths) > 0 {
		var msg string
		for x, warn := range corruptedUserPaths {
			var sep string
			if x > 0 {
				sep = "\n"
			}
			msg += sep + "- " + warn
		}
		stderr.Fatalf("delete and rerun retro init %s\n\n%s\n", rootDir, msg)
	}

	for _, embeddedPath := range embeddedPaths {
		if userDir := path.Join(rootDir, path.Dir(embeddedPath)); userDir != "." {
			if err := os.MkdirAll(userDir, 0755); err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		src, err := embedded.FS.Open(embeddedPath)
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		dst, err := os.Create(path.Join(rootDir, embeddedPath))
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		if _, err := io.Copy(dst, src); err != nil {
			if err != nil {
				stderr.Fatalf("an unexpected error occurred; %w", err)
			}
		}
		src.Close()
		dst.Close()
	}

	if rootDir == "." {
		stdout.Print(color.Bold("created a retro app") + `

# npm
npm
npm run watch

# yarn
yarn
yarn watch
`)
	} else {
		stdout.Printf(color.Boldf("created retro app %s", rootDir)+`

# npm
cd %[1]s
npm
npm run watch

# yarn
cd %[1]s
yarn
yarn watch
`, rootDir)
	}
}
