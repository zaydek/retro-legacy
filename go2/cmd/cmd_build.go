package main

import (
	"os"
)

func (app *RetroApp) build() {
	var err error
	if app.Configuration, err = initConfiguration(); err != nil {
		stderr.Println(err)
		os.Exit(1)
	} else if app.PageBasedRouter, err = initPageBasedRouter(app.Configuration); err != nil {
		stderr.Println(err)
		os.Exit(1)
	}

	must(copyAssetDirectoryToBuildDirectory(app))
	must(prerenderProps(app))
	must(prerenderApp(app))
	must(prerenderPages(app))
}
