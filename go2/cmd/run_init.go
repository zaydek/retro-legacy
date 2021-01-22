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
func (r Retro) init(rootdir string) {
	if rootdir != "." {
		// if _, err := os.Stat(rootdir); !os.IsNotExist(err) {
		// 	stderr.Fatalf("Aborted. Stat '%s'.\n", rootdir)
		// }

		if err := os.MkdirAll(rootdir, 0755); err != nil {
			stderr.Fatalln(errs.MkdirAll(rootdir, err))
		} else if err := os.Chdir(rootdir); err != nil {
			stderr.Fatalln(errs.Chdir(rootdir, err))
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
		stderr.Fatalln(errs.Walk("<embedded>", err))
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
		stderr.Fatalf("Aborted. "+
			"Try rm -r [path] or sudo rm -r [path] and rerun retro init %s.\n\n"+
			"%s\n", rootdir, ul,
		)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				stderr.Fatalln(errs.MkdirAll(dir, err))
			}
		}
		src, err := embedded.FS.Open(each)
		if err != nil {
			stderr.Fatalln(errs.Unexpected(err))
		}
		dst, err := os.Create(each)
		if err != nil {
			stderr.Fatalln(errs.Unexpected(err))
		}
		if _, err := io.Copy(dst, src); err != nil {
			if err != nil {
				stderr.Fatalln(errs.Unexpected(err))
			}
		}
		src.Close()
		dst.Close()
	}

	name := rootdir
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
			if rootdir == "." {
				path = "package.json"
			} else {
				path = pathpkg.Join(rootdir, "package.json")
			}
			stderr.Fatalln(errs.WriteFile(path, err))
		}
	}

	if rootdir == "." {
		stdout.Print(color.Bold("Created Retro app! 🥳") + `

` + color.BoldBlack("# npm") + `
npm
npm run watch

` + color.BoldBlack("# yarn") + `
yarn
yarn watch
`)
	} else {
		stdout.Printf(color.Boldf("Created '%s'! 🥳", rootdir)+`

`+color.BoldBlack("# npm")+`
cd %[1]s
npm
npm run watch

`+color.BoldBlack("# yarn")+`
cd %[1]s
yarn
yarn watch
`, rootdir)
	}
}
