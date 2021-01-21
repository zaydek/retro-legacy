package main

import (
	"io/ioutil"
	"os"
	"path"
)

func (r Retro) build() {
	// port := resolvePort() TODO
	if _, err := os.Stat("retro.config.jsonc"); os.IsNotExist(err) {
		stderr.Fatalln("no such retro.config.jsonc; try retro init .")
	}

	var err error
	if r.Config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.Routes, err = loadRoutes(r.Config); err != nil {
		stderr.Fatalln(err)
	}

	{
		// Passthrough:
		contents, err := resolvePageProps(r)
		if err != nil {
			stderr.Fatalln(err)
		}
		if err := ioutil.WriteFile(path.Join(r.Config.CacheDir, "pageProps.js"), contents, 0644); err != nil {
			stderr.Fatalf("failed to write %s/pageProps.js; %w\n", r.Config.CacheDir, err)
		}
	}

	{
		// Passthrough:
		contents, err := resolveApp(r)
		if err != nil {
			stderr.Fatalln(err)
		}
		// TODO
		if err := ioutil.WriteFile(path.Join(r.Config.CacheDir, "app.js"), contents, 0644); err != nil {
			stderr.Fatalf("failed to write %s/app.js; %w\n", r.Config.CacheDir, err)
		}
	}

	{
		// Passthrough:
		contents, err := resolveIndexHTML(r)
		if err != nil {
			stderr.Fatalln(err)
		}
		if err := ioutil.WriteFile(path.Join(r.Config.BuildDir, "index.html"), contents, 0644); err != nil {
			stderr.Fatalf("failed to write %s/index.html; %w\n", r.Config.BuildDir, err)
		}
	}
}
