package create

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	p "path"

	"github.com/zaydek/retro/cmd/create/embeds"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/term"
)

type copyPath struct{ src, dst string }

func (cmd Command) CreateRetroApp() {
	if cmd.Directory != "." {
		if info, err := os.Stat(cmd.Directory); !os.IsNotExist(err) {
			var typ string
			if !info.IsDir() {
				typ = "file"
			} else {
				typ = "directory"
			}
			loggers.Stderr.Fatalln("Aborted. " +
				"A " + typ + " named " + term.Bold(cmd.Directory) + " already exists.\n\n" +
				"- " + term.Boldf("create-retro-app %s", increment(cmd.Directory)) + "\n\n" +
				"Or\n\n" +
				"- " + term.Boldf("rm -r %[1]s && create-retro-app %[1]s", cmd.Directory))
		}

		if err := os.MkdirAll(cmd.Directory, perm.Directory); err != nil {
			loggers.Stderr.Fatalln(errs.MkdirAll(cmd.Directory, err))
		}

		if cmd.Directory != "." {
			if err := os.Chdir(cmd.Directory); err != nil {
				loggers.Stderr.Fatalln(errs.Chdir(cmd.Directory, err))
			}
			defer os.Chdir("..")
		}
	}

	fsys := embeds.JavaScriptFS
	if cmd.Template == "ts" {
		fsys = embeds.TypeScriptFS
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

	var badPaths []string
	for _, each := range paths {
		if _, err := os.Stat(each.dst); !os.IsNotExist(err) {
			badPaths = append(badPaths, each.dst)
		}
	}

	if len(badPaths) > 0 {
		var badPathsStr string
		for x, each := range badPaths {
			var sep string
			if x > 0 {
				sep = "\n"
			}
			badPathsStr += sep + "- " + term.Bold(each)
		}
		loggers.Stderr.Fatalln("Aborted. " +
			"These paths must be removed and or renamed. " +
			"Use " + term.Bold("rm -r paths") + " to remove them or " + term.Bold("mv src dst") + " to rename them.\n\n" +
			badPathsStr)
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
		cwd, _ := os.Getwd()
		appName = p.Base(cwd)
	}

	tmpl := embeds.JavaScriptPackageTemplate
	if cmd.Template == "typescript" {
		tmpl = embeds.TypeScriptPackageTemplate
	}

	dot := embeds.PackageDot{
		AppName:           appName,
		RetroVersion:      os.Getenv("RETRO_VERSION"),
		ReactVersion:      os.Getenv("REACT_VERSION"),
		TypesReactVersion: os.Getenv("TYPES_REACT_VERSION"),
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, dot); err != nil {
		loggers.Stderr.Fatalln(errs.ExecuteTemplate(tmpl.Name(), err))
	}

	path := p.Join(cmd.Directory, "package.json")
	if err := ioutil.WriteFile(path, buf.Bytes(), perm.File); err != nil {
		loggers.Stderr.Fatalln(errs.WriteFile(path, err))
	}

	if cmd.Directory == "." {
		fmt.Printf(successFormat+"\n", appName)
	} else {
		fmt.Printf(successDirectoryFormat+"\n", appName)
	}
}
