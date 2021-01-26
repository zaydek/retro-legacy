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
	"github.com/zaydek/retro/errs"
)

// TODO: Change to npx create-retro-app?
func (app *RetroApp) init(rootDirectory string) {
	if rootDirectory != "." {
		if info, err := os.Stat(rootDirectory); !os.IsNotExist(err) {
			var typ string
			if info.IsDir() {
				typ = "file"
			} else {
				typ = "directory"
			}
			stderr.Printf("Aborted. A %s named '%[2]s' already exists.\n\n"+
				"- Try 'retro init [dir]' where '[dir]' is not '%[2]s'\n\n"+
				"Or\n\n"+
				"- Try 'rm %[2]s' or 'sudo rm -r %[2]s' if that doesn’t work and rerun 'retro init %[2]s'\n", typ, rootDirectory)
			os.Exit(1)
		}

		if err := os.MkdirAll(rootDirectory, 0755); err != nil {
			stderr.Println(errs.MkdirAll(rootDirectory, err))
			os.Exit(1)
		} else if err := os.Chdir(rootDirectory); err != nil {
			stderr.Println(errs.Chdir(rootDirectory, err))
			os.Exit(1)
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
			srcbstr, err := ioutil.ReadAll(embed)
			if err != nil {
				return err
			}
			dstbstr, err := ioutil.ReadFile(path)
			if err != nil {
				return err
			}
			if !bytes.Equal(srcbstr, dstbstr) {
				badPaths = append(badPaths, path)
				return nil
			}
			embed.Close()
		}
		paths = append(paths, path)
		return nil
	}); err != nil {
		stderr.Println(errs.Walk("<embedded>", err))
		os.Exit(1)
	}

	if len(badPaths) > 0 {
		var ul string
		for x, each := range badPaths {
			var sep string
			if x > 0 {
				sep = "\n"
			}
			ul += sep + "- " + each
		}
		stderr.Printf("Aborted. "+
			"Try 'rm -r [path]' or 'sudo rm -r [path]' if that doesn’t work and rerun 'retro init %s'.\n\n"+
			"%s\n", rootDirectory, ul)
		os.Exit(1)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				stderr.Println(errs.MkdirAll(dir, err))
				os.Exit(1)
			}
		}
		src, err := embedded.FS.Open(each)
		if err != nil {
			stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		dst, err := os.Create(each)
		if err != nil {
			stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		if _, err := io.Copy(dst, src); err != nil {
			stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		src.Close()
		dst.Close()
	}

	name := rootDirectory
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
			var path string
			if rootDirectory == "." {
				path = "package.json"
			} else {
				path = pathpkg.Join(rootDirectory, "package.json")
			}
			stderr.Println(errs.WriteFile(path, err))
			os.Exit(1)
		}
	}

	if rootDirectory == "." {
		stdout.Print(color.Bold("Created a Retro app!") + `

` + color.BoldBlack("# npm") + `
npm
npm run watch

` + color.BoldBlack("# yarn") + `
yarn
yarn watch

Happy hacking.
`)
	} else {
		stdout.Printf(color.Boldf("Created '%s'!", rootDirectory)+`

`+color.BoldBlack("# npm")+`
cd %[1]s
npm
npm run watch

`+color.BoldBlack("# yarn")+`
cd %[1]s
yarn
yarn watch

Happy hacking.
`, rootDirectory)
	}
}
