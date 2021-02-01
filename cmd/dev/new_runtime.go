package dev

import (
	"errors"
	"io/ioutil"
	"os"
	p "path"
	"strings"
	"text/template"

	"github.com/google/uuid"
	"github.com/zaydek/retro/cmd/dev/cli"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/term"
)

// parseIndexHTMLTemplate parses public/index.html.
func parseIndexHTMLTemplate(config DirectoryConfiguration) (*template.Template, error) {
	bstr, err := ioutil.ReadFile(p.Join(config.AssetDirectory, "index.html"))
	if err != nil {
		return nil, errs.ReadFile(p.Join(config.AssetDirectory, "index.html"), err)
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return nil, errors.New("No such template tag " + term.Bold("{{ .Head }}") + ". " +
			"This is the entry point for the " + term.Bold("<Head>") + " component in your page components. " +
			"Add " + term.Bold("{{ .Head }}") + " to " + term.Bold("<head>") + ".")
	}

	if !strings.Contains(text, "{{ .Page }}") {
		return nil, errors.New("No such template tag " + term.Bold("{{ .Page }}") + ". " +
			"This is the entry point for the " + term.Bold("<Page>") + " component in your page components. " +
			"Add " + term.Bold("{{ .Page }}") + " to " + term.Bold("<body>") + ".")
	}

	base, err := template.New(p.Join(config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return nil, errs.ParseTemplate(base.Name(), err)
	}
	return base, nil
}

// statOrCreateDir stats for the presence of a directory or creates one.
func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, perm.Directory); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

// runServerGuards runs server guards on the configuration.
func runServerGuards(config DirectoryConfiguration) error {
	dirs := []string{config.AssetDirectory, config.PagesDirectory, config.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	return nil
}

func newRuntime() Runtime {
	var err error

	cmd := cli.ParseCLIArguments()
	runtime := Runtime{
		EpochUUID: uuid.NewString(),
		Command:   cmd,
		DirConfiguration: DirectoryConfiguration{
			AssetDirectory: "public",
			PagesDirectory: "pages",
			CacheDirectory: "__cache__",
			BuildDirectory: "build",
		},
	}

	// Get the current command:
	cmdstr := runtime.getCmd()
	if cmdstr == "watch" || cmdstr == "build" {
		if runtime.PageBasedRouter, err = newRouter(runtime.DirConfiguration); err != nil {
			loggers.Stderr.Fatalln(err)
		}
	}

	if runtime.IndexHTMLTemplate, err = parseIndexHTMLTemplate(runtime.DirConfiguration); err != nil {
		loggers.Stderr.Fatalln(err)
	}

	// Do not run server guards for "serve":
	if cmdstr == "watch" || cmdstr == "build" {
		if err := runServerGuards(runtime.DirConfiguration); err != nil {
			loggers.Stderr.Fatalln(err)
		}
	}
	return runtime
}
