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
	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "pageProps.js"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/pageProps.js; %w", retro.Config.CacheDir, err)
	}
	return nil
}

// prerenderPages prerenders build/*.html.
func prerenderPages(retro Retro) error {
	// Passthrough:
	contents, err := resolveIndexHTML(retro)
	if err != nil {
		return err
	}
	if err := ioutil.WriteFile(path.Join(retro.Config.BuildDir, "index.html"), contents, 0644); err != nil {
		return fmt.Errorf("failed to write %s/index.html; %w", retro.Config.BuildDir, err)
	}
	return nil
}

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
	fmt.Printf("%+v\n", retro.Routes)

	// output, err := resolveApp(retro)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Print(string(output))

	// if err := prerenderPageProps(r); err != nil {
	// 	stderr.Fatalln(err)
	// } else if err := prerenderPages(r); err != nil {
	// 	stderr.Fatalln(err)
	// } else if err := prerenderApp(r); err != nil {
	// 	stderr.Fatalln(err)
	// }
}
