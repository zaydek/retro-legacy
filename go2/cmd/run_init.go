package main

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	pathpkg "path"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/embedded"
)

// TODO: Change to npx create-retro-app?
func (r Retro) init(dirname string) {
	if dirname != "." {
		if _, err := os.Stat(dirname); !os.IsNotExist(err) {
			stderr.Fatalf("try rm -r %[1]s && retro init %[1]s\n", dirname)
		}

		if err := os.MkdirAll(dirname, 0755); err != nil {
			stderr.Fatalf("failed to mkdir -p %s; %w\n", dirname, err)
		} else if err := os.Chdir(dirname); err != nil {
			stderr.Fatalf("failed to cd %s; %w\n", dirname, err)
		}
		defer os.Chdir("..")
	}

	var (
		paths    []string
		badPaths []string
	)

	if err := fs.WalkDir(embedded.FS, ".", func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if dirEntry.IsDir() {
			return nil
		}
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			embed, err := embedded.FS.Open(path)
			if err != nil {
				return err
			}
			src, err := ioutil.ReadAll(embed)
			if err != nil {
				return err
			}
			dst, err := ioutil.ReadFile(path)
			if err != nil {
				return err
			}
			if !bytes.Equal(src, dst) {
				badPaths = append(badPaths, path)
				return nil
			}
			embed.Close()
		}
		paths = append(paths, path)
		return nil
	}); err != nil {
		stderr.Fatalf("an unexpected error occurred; %w", err)
	}

	if len(badPaths) > 0 {
		var msg string
		for x, each := range badPaths {
			var sep string
			if x > 0 {
				sep = "\n"
			}
			msg += sep + "- " + each
		}
		stderr.Fatalf("rm ... && retro init %s\n\n%s\n", dirname, msg)
	}

	for _, path := range paths {
		if dir := pathpkg.Dir(path); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				stderr.Fatalf("failed to mkdir -p %s; %w", dir, err)
			}
		}
		src, err := embedded.FS.Open(path)
		if err != nil {
			stderr.Fatalf("an unexpected error occurred; %w", err)
		}
		dst, err := os.Create(path)
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

	name := dirname
	if name == "." {
		name = "retro-app"
	}

	pkg := `{
	"name": ` + fmt.Sprintf("%q", name) + `,
	"scripts": {
		"watch": "retro-react-scripts watch",
		"build": "retro-react-scripts build",
		"serve": "retro-react-scripts serve"
	},
	"dependencies": {
		"react": "latest",
		"react-dom": "latest",
		"retro-react": "latest",
		"retro-react-scripts": "latest"
	}
}
`

	if _, err := os.Stat("package.json"); os.IsNotExist(err) {
		if err := ioutil.WriteFile("package.json", []byte(pkg), 0644); err != nil {
			if dirname == "." {
				stderr.Fatalf("failed to write package.json; %w\n", err)
			} else {
				stderr.Fatalf("failed to write %s/package.json; %w\n", dirname, err)
			}
		}
	}

	if dirname == "." {
		stdout.Print(color.Bold("created a retro app") + `

# npm
npm
npm run watch

# yarn
yarn
yarn watch
`)
	} else {
		stdout.Printf(color.Boldf("created retro app %s", dirname)+`

# npm
cd %[1]s
npm
npm run watch

# yarn
cd %[1]s
yarn
yarn watch
`, dirname)
	}
}
