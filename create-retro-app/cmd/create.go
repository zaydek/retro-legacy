package main

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	p "path"

	"github.com/zaydek/create-retro-app/cmd/errs"
	"github.com/zaydek/create-retro-app/embeds"
	"github.com/zaydek/create-retro-app/loggers"
	"github.com/zaydek/create-retro-app/perm"
	"github.com/zaydek/create-retro-app/term"
)

type copyPath struct{ src, dst string }

func (cmd Command) CreateRetroApp() {
	fsys := embeds.JavaScriptFS
	if cmd.Template == "ts" {
		fsys = embeds.TypeScriptFS
	}

	if cmd.Directory != "." {
		if info, err := os.Stat(cmd.Directory); !os.IsNotExist(err) {
			var typ string
			if !info.IsDir() {
				typ = "file"
			} else {
				typ = "directory"
			}
			loggers.Stderr.Fatalln("Aborted. A " + typ + " named " + term.Bold(cmd.Directory) + " already exists.\n\n" +
				"- " + term.Boldf("npx create-retro-app %s", cmd.Directory) + "\n\n" +
				"Or\n\n" +
				"- " + term.Boldf("rm -r %[1]s && npx create-retro-app %[1]s", cmd.Directory))
		}

		if err := os.MkdirAll(cmd.Directory, perm.Directory); err != nil {
			loggers.Stderr.Fatalln(errs.MkdirAll(cmd.Directory, err))
		}
	}

	var paths []copyPath
	if err := fs.WalkDir(fsys, ".", func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !dirEntry.IsDir() {
			src := path
			dst := p.Join(cmd.Directory, path)
			paths = append(paths, copyPath{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		path := fmt.Sprintf("<embed:%s>", cmd.Template)
		loggers.Stderr.Fatalln(errs.Walk(path, err))
	}

	for _, each := range paths {
		if dir := p.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				loggers.Stderr.Fatalln(errs.MkdirAll(dir, err))
			}
		}
		src, err := fsys.Open(each.src)
		if err != nil {
			loggers.Stderr.Fatalln(errs.Unexpected(err))
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			loggers.Stderr.Fatalln(errs.Unexpected(err))
		}
		if _, err := io.Copy(dst, src); err != nil {
			loggers.Stderr.Fatalln(errs.Unexpected(err))
		}
		src.Close()
		dst.Close()
	}

	appName := cmd.Directory
	if cmd.Directory == "." {
		appName = "retro-app"
	}

	dot := embeds.PackageDot{
		AppName:            appName,
		RetroVersion:       os.Getenv("RETRO_VERSION"),
		RetroRouterVersion: os.Getenv("RETRO_ROUTER_VERSION"),
		ReactVersion:       os.Getenv("REACT_VERSION"),
		ReactDOMVersion:    os.Getenv("REACT_DOM_VERSION"),
	}

	var buf bytes.Buffer
	if err := embeds.PackageTemplate.Execute(&buf, dot); err != nil {
		loggers.Stderr.Fatalln(errs.ExecuteTemplate(embeds.PackageTemplate.Name(), err))
	}

	path := p.Join(cmd.Directory, "package.json")
	if err := ioutil.WriteFile(path, buf.Bytes(), perm.File); err != nil {
		loggers.Stderr.Fatalln(errs.WriteFile(path, err))
	}

	fmt.Printf(successfmt+"\n", appName)
}
