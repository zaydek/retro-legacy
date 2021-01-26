package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
	"github.com/zaydek/retro/loggers"
)

var (
	reactVersion        = "latest"
	reactDOMVersion     = "latest"
	retroVersion        = "latest"
	retroScriptsVersion = "latest"
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
			loggers.Stderr.Println("Aborted. A " + typ + " named " + color.Boldf("'%s'", r.CreateCommand.Directory) + " already exists.\n\n" +
				"- Try " + color.Bold("'retro create [dir]'") + "\n\n" +
				"Or\n\n" +
				"- Try " + color.Boldf("'rm -r %[1]s && retro create %[1]s'", r.CreateCommand.Directory))
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

	namespace := fmt.Sprintf("<embedded:%s>", r.CreateCommand.Language)
	if err := copyFSToDirectory(languageFS, namespace, r.CreateCommand.Directory); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}

	repoName := r.CreateCommand.Directory
	if repoName == "." {
		repoName = "retro-app"
	}

	dot := embedded.PkgStruct{
		RepoName:            repoName,
		ReactVersion:        reactVersion,
		ReactDOMVersion:     reactDOMVersion,
		RetroVersion:        retroVersion,
		RetroScriptsVersion: retroScriptsVersion,
	}

	var buf bytes.Buffer
	if err := embedded.PkgTemplate.Execute(&buf, dot); err != nil {
		loggers.Stderr.Println(errs.ExecuteTemplate("package.json", err))
		os.Exit(1)
	}

	if err := ioutil.WriteFile("package.json", buf.Bytes(), 0644); err != nil {
		loggers.Stderr.Println(errs.WriteFile("package.json", err))
		os.Exit(1)
	}

	if r.CreateCommand.Directory == "." {
		loggers.Stdout.Println(color.Bold("Successfully created a new Retro app.") + `

` + color.BoldBlack("# npm") + `
npm
npm run watch

` + color.BoldBlack("# yarn") + `
yarn
yarn watch

Happy hacking!`)
	} else {
		loggers.Stdout.Println(color.Bold("Successfully created a new Retro app.") + `

` + color.BoldBlack("# npm") + `
cd ` + r.CreateCommand.Directory + `
npm
npm run watch

` + color.BoldBlack("# yarn") + `
cd ` + r.CreateCommand.Directory + `
yarn
yarn watch

Happy hacking!`)
	}
}
