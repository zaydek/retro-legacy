package main

import (
	"fmt"
	"io/ioutil"
)

// React-rendered page.
type RenderedPage struct {
	Page string
	Data []byte
}

var (
	config Configuration
	router PageBasedRouter
)

// This service is responsible for resolving bytes for `cache/pageProps.js`.
func HandlePageProps(config Configuration, router PageBasedRouter) error {
	pagePropsBytes, err := ReadPageProps(config, router)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(config.CacheDir+"/pageProps.js", pagePropsBytes, 0644)
	if err != nil {
		return err
	}
	fmt.Printf("✅ %s\n", config.CacheDir+"/pageProps.js")
	return nil
}

// This service is responsible for resolving bytes for `build/*.html`.
func HandleWritePages(config Configuration, router PageBasedRouter) error {
	rendered, err := ReadRenderedPages(config, router)
	if err != nil {
		return err
	}
	for _, render := range rendered {
		err = ioutil.WriteFile(config.BuildDir+"/"+render.Page+".html", render.Data, 0644)
		if err != nil {
			// No-op
			break
		}
		fmt.Printf("✅ %s\n", config.BuildDir+"/"+render.Page+".html")
	}
	return err
}

// This service is responsible for resolving bytes for `cache/app.js`.
func HandleApp(config Configuration, router PageBasedRouter) error {
	appBytes, err := ReadApp(config, router)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(config.CacheDir+"/app.js", appBytes, 0644)
	if err != nil {
		return err
	}
	fmt.Printf("✅ %s\n", config.CacheDir+"/app.js")
	return nil
}

// TODO: Add support for `appProps`; `appProps` should colocate all page
// locations to start. We can possibly add support for things like timestamps,
// etc. so metadata is included (creation date, last updated at, filetype: ...).

// TODO: It would be nice if we can generate starter pages for the user if no
// pages directory exists and they don’t have a configuration folder. Then we
// just need to know whether the user intends to use React or TypeScript.
//
// Maybe we do something like:
//
// - yarn ... --init
// - yarn ... --init --template=typescript
//
// That should be enough information for us. That being said, it would be easier
// for us to just copy a folder rather than to generate them imperatively.
//
// TODO: Can add support for preamble HTML comment header. This would most
// likely be a configuration field or passable as an environmental variable.
func main() {
	// TODO: This can be combined into an initialization function (not `init`) and
	// return both config and router at the same time.
	var err error
	config, err = InitConfiguration("config.json")
	if err != nil {
		panic(err)
	}
	router, err = InitPageBasedRouter(config)
	if err != nil {
		panic(err)
	}

	err = HandlePageProps(config, router)
	if err != nil {
		panic(err)
	}
	err = HandleWritePages(config, router)
	if err != nil {
		panic(err)
	}
	err = HandleApp(config, router)
	if err != nil {
		panic(err)
	}

	// Done.
}

// var clock time.Time
// var dur time.Duration
// clock = time.Now()
// dur = time.Since(clock)
// fmt.Printf("✅ %s (%0.3fs)\n", config.BuildDir+"/"+render.Page+".html", dur.Seconds())
