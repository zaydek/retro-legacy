package create_retro_app

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	p "path"

	"github.com/zaydek/retro/cmd/create_retro_app/embeds"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/term"
)

func (cmd Command) CreateRetroApp() {
	if cmd.Directory != "." {
		if _, err := os.Stat(cmd.Directory); !os.IsNotExist(err) {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Found `%[1]s`. You can:\n\n"+
				"- create-retro-app %[1]s\n\n"+
				"Or\n\n"+
				"- rm -r %[1]s && create-retro-app %[1]s",
				cmd.Directory))
		}
		if err := os.MkdirAll(cmd.Directory, perm.Directory); err != nil {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Error: %s.", err))
		}
		if err := os.Chdir(cmd.Directory); err != nil {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Error: %s.", err))
		}
		defer os.Chdir("..")
	}

	fsys := embeds.JavaScriptFS
	if cmd.Template == "ts" {
		fsys = embeds.TypeScriptFS
	}

	var paths []string
	if err := fs.WalkDir(fsys, ".", func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !dirEntry.IsDir() {
			paths = append(paths, path)
		}
		return nil
	}); err != nil {
		loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
			"Error: %s.", err))
	}

	var badPaths []string
	for _, each := range paths {
		if _, err := os.Stat(each); !os.IsNotExist(err) {
			badPaths = append(badPaths, each)
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
		loggers.ErrorAndEnd("Aborted. " +
			"These paths must be removed or renamed. " +
			"Use `rm -r [paths]` to remove them or `mv [src] [dst]` to rename them.\n\n" +
			badPathsStr)
	}

	for _, each := range paths {
		if dir := p.Dir(each); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
					"Error: %s.", err))
			}
		}
		src, err := fsys.Open(each)
		if err != nil {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Error: %s.", err))
		}
		dst, err := os.Create(each)
		if err != nil {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Error: %s.", err))
		}
		if _, err := io.Copy(dst, src); err != nil {
			loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
				"Error: %s.", err))
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
		AppName:      appName,
		RetroVersion: os.Getenv("RETRO_VERSION"),
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, dot); err != nil {
		loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
			"Error: %s.", err))
	}

	if err := ioutil.WriteFile("package.json", buf.Bytes(), perm.File); err != nil {
		loggers.ErrorAndEnd(fmt.Sprintf("Aborted. "+
			"Error: %s", err))
	}

	if cmd.Directory == "." {
		loggers.OK(fmt.Sprintf(successFormat, appName))
	} else {
		loggers.OK(fmt.Sprintf(successDirectoryFormat, appName))
	}
}
