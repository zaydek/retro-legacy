package retro

import (
	"errors"
	"io/ioutil"
	"os"
	p "path"
	"strings"
	"text/template"

	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/perm"
)

// parseBaseTemplate parses public/index.html.
func parseBaseTemplate(config DirectoryConfiguration) (*template.Template, error) {
	bstr, err := ioutil.ReadFile(p.Join(config.AssetDirectory, "index.html"))
	if err != nil {
		return nil, err
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return nil, errors.New("No such template tag `{{ .Head }}`. " +
			"This is the entry point for the `<Head>` component in your page components. " +
			"Add `{{ .Head }}` to `<head>`.")
	}

	if !strings.Contains(text, "{{ .Page }}") {
		return nil, errors.New("No such template tag `{{ .Page }}`. " +
			"This is the entry point for the `<Page>` component in your page components. " +
			"Add `{{ .Page }}` to `<body>`.")
	}

	base, err := template.New(p.Join(config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return nil, err
	}
	return base, nil
}

// statOrCreateDir stats for the presence of a directory or creates one.
func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, perm.Directory); err != nil {
			return err
		}
	}
	return nil
}

// runServerGuards runs server guards on the configuration.
func runServerGuards(config DirectoryConfiguration) error {
	dirs := []string{config.AssetDirectory, config.PagesDirectory, config.CacheDirectory, config.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	return nil
}

func newRuntime() (Runtime, error) {
	var err error

	runtime := Runtime{
		Command: cli.ParseCLIArguments(),
		DirConfiguration: DirectoryConfiguration{
			AssetDirectory: "public",
			PagesDirectory: "pages",
			CacheDirectory: "__cache__",
			BuildDirectory: "build",
		},
	}

	cmd := runtime.getCmd()
	if cmd == CmdStart || cmd == CmdBuild {
		if runtime.PageBasedRouter, err = newRouter(runtime.DirConfiguration); err != nil {
			return Runtime{}, err
		}
	}

	if runtime.baseTemplate, err = parseBaseTemplate(runtime.DirConfiguration); err != nil {
		return Runtime{}, err
	}

	// Do not run server guards on serve:
	if cmd == CmdStart || cmd == CmdBuild {
		if err := runServerGuards(runtime.DirConfiguration); err != nil {
			return Runtime{}, err
		}
	}
	return runtime, nil
}
