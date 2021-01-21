package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
)

// prerenderPageProps prerenders cache/pageProps.js.
func prerenderPageProps(retro Retro) error {
	// Passthrough:
	contents, err := resolvePageProps(retro)
	if err != nil {
		return err
	}
	if err := ioutil.WriteFile(path.Join(retro.config.CacheDir, "pageProps.js"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/pageProps.js; %w", retro.config.CacheDir, err)
	}
	return nil
}

// prerenderIndexHTML prerenders build/index.html.
func prerenderIndexHTML(retro Retro) error {
	// Passthrough:
	contents, err := resolveIndexHTML(retro)
	if err != nil {
		return err
	}
	if err := ioutil.WriteFile(path.Join(retro.config.BuildDir, "index.html"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/index.html; %w", retro.config.BuildDir, err)
	}
	return nil
}

func (r Retro) cmdWatch() {
	// port := resolvePort() TODO

	if _, err := os.Stat("retro.config.jsonc"); os.IsNotExist(err) {
		stderr.Fatalln("no such retro.config.jsonc; try retro init .")
	}

	var err error
	if r.config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.router, err = loadRouter(r.config); err != nil {
		stderr.Fatalln(err)
	}

	if err := prerenderIndexHTML(r); err != nil {
		stderr.Fatalln(err)
	}
	if err := prerenderPageProps(r); err != nil {
		stderr.Fatalln(err)
	}
}
