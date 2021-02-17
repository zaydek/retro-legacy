package retro

import (
	"errors"
	"io/ioutil"
	"os"
	p "path"
	"strings"

	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/perm"
)

func readBaseHTML(config DirectoryConfiguration) (string, error) {
	bstr, err := ioutil.ReadFile(p.Join(config.AssetDirectory, "index.html"))
	if err != nil {
		return "", err
	}

	base := string(bstr)
	if !strings.Contains(base, "%head%") {
		return "", errors.New("No such template tag %head%. " +
			"This is the entry point for the <Head> component in your page components. " +
			"Add %head% to <head>.")
	}

	if !strings.Contains(base, "%page%") {
		return "", errors.New("No such template tag %page%. " +
			"This is the entry point for the <Page> component in your page components. " +
			"Add %page% to <body>.")
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
	// TODO: Assert the presence of config.PagesDirectory/index.js.
	return nil
}

func newRuntime() (Runtime, error) {
	var err error

	runtime := Runtime{
		Version: os.Getenv("RETRO_VERSION"),
		Command: cli.ParseCLIArguments(),
		DirConfiguration: DirectoryConfiguration{
			AssetDirectory: "public",
			PagesDirectory: "src/pages",
			CacheDirectory: "__cache__",
			BuildDirectory: "__export__",
		},
	}

	// Do not run server guards on serve:
	cmd := runtime.getCmd()
	if cmd == CmdDev || cmd == CmdExport {
		if err := runServerGuards(runtime.DirConfiguration); err != nil {
			return Runtime{}, err
		}
	}

	if runtime.BasePage, err = readBaseHTML(runtime.DirConfiguration); err != nil {
		return Runtime{}, err
	}

	if cmd == CmdDev || cmd == CmdExport {
		if runtime.PageBasedRouter, err = newRouter(runtime.DirConfiguration); err != nil {
			return Runtime{}, err
		}
	}
	return runtime, nil
}
