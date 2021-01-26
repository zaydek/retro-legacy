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
	"github.com/zaydek/retro/loggers"
)

// TODO: npx create-retro-app is functionally equivalent to retro create [dir].
func (r Runtime) Create() {
	languageFS := embedded.JavaScriptFS
	if r.CreateCommand.Language == "ts" {
		languageFS = embedded.TypeScriptFS
	}

	if r.CreateCommand.Directory != "." {
		if info, err := os.Stat(r.CreateCommand.Directory); !os.IsNotExist(err) {
			var typ string
			if info.IsDir() {
				typ = "file"
			} else {
				typ = "directory"
			}
			loggers.Stderr.Printf("Aborted. A %s named '%[2]s' already exists.\n\n"+
				"- Try 'retro create [dir]' where '[dir]' is not '%[2]s'\n\n"+
				"Or\n\n"+
				"- Try 'rm %[2]s' or 'sudo rm -r %[2]s' if that doesn’t work and rerun 'retro create %[2]s'\n", typ, r.CreateCommand.Directory)
			os.Exit(1)
		}

		if err := os.MkdirAll(r.CreateCommand.Directory, 0755); err != nil {
			loggers.Stderr.Println(errs.MkdirAll(r.CreateCommand.Directory, err))
			os.Exit(1)
		} else if err := os.Chdir(r.CreateCommand.Directory); err != nil {
			loggers.Stderr.Println(errs.Chdir(r.CreateCommand.Directory, err))
			os.Exit(1)
		}
		defer os.Chdir("..")
	}

	var (
		paths    []string
		badPaths []string
	)

	if err := fs.WalkDir(languageFS, ".", func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if dirEntry.IsDir() {
			return nil
		}
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			embed, err := languageFS.Open(path)
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
		loggers.Stderr.Println(errs.Walk(fmt.Sprintf("<embedded:%s>", r.CreateCommand.Language), err))
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
		loggers.Stderr.Printf("Aborted. "+
			"Try 'rm -r [path]' or 'sudo rm -r [path]' if that doesn’t work and rerun 'retro create %s'.\n\n"+
			"%s\n", r.CreateCommand.Directory, ul)
		os.Exit(1)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				loggers.Stderr.Println(errs.MkdirAll(dir, err))
				os.Exit(1)
			}
		}
		src, err := languageFS.Open(each)
		if err != nil {
			loggers.Stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		dst, err := os.Create(each)
		if err != nil {
			loggers.Stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		if _, err := io.Copy(dst, src); err != nil {
			loggers.Stderr.Println(errs.Unexpected(err))
			os.Exit(1)
		}
		src.Close()
		dst.Close()
	}

	repo := r.CreateCommand.Directory
	if repo == "." {
		repo = "retro-app"
	}

	// TODO
	pkg := `{
	"name": ` + fmt.Sprintf("%q", repo) + `,
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
			if r.CreateCommand.Directory == "." {
				path = "package.json"
			} else {
				path = pathpkg.Join(r.CreateCommand.Directory, "package.json")
			}
			loggers.Stderr.Println(errs.WriteFile(path, err))
			os.Exit(1)
		}
	}

	if r.CreateCommand.Directory == "." {
		loggers.Stdout.Print(color.Bold("Created a Retro app!") + `

` + color.BoldBlack("# npm") + `
npm
npm run watch

` + color.BoldBlack("# yarn") + `
yarn
yarn watch

Happy hacking!
`)
	} else {
		loggers.Stdout.Printf(color.Boldf("Created '%s'!", r.CreateCommand.Directory)+`

`+color.BoldBlack("# npm")+`
cd %[1]s
npm
npm run watch

`+color.BoldBlack("# yarn")+`
cd %[1]s
yarn
yarn watch

Happy hacking!
`, r.CreateCommand.Directory)
	}
}
