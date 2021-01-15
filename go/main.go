package main

import (
	"fmt"
	"io/ioutil"
	"time"
)

var (
	config Configuration
	router PageBasedRouter
)

// Writes ... to disk.
func WritePageProps() {}

// Writes ... to disk.
func WritePages() {}

// Writes ... to disk.
func WriteApp() {}

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

	var clock time.Time
	var dur time.Duration

	// Page props (takes precedence)
	clock = time.Now()
	pagePropsBytes, err := ReadPageProps(config, router)
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile(config.CacheDir+"/pageProps.js", pagePropsBytes, 0644)
	if err != nil {
		panic(err)
	}
	dur = time.Since(clock)
	fmt.Printf("✅ %s (%0.3fs)\n", config.CacheDir+"/pageProps.js", dur.Seconds())

	// for _, page := range router {
	// 	pageBytes, err := ReadPage(config, page)
	// 	if err != nil {
	// 		panic(err)
	// 	}
	// 	fmt.Println(string(pageBytes))
	// }

	// // Pages
	// clock = time.Now()
	// appBytes, err := ReadPages(config, router)
	// if err != nil {
	// 	panic(err)
	// }
	// err = ioutil.WriteFile(config.CacheDir+"/app.js", appBytes, 0644)
	// if err != nil {
	// 	panic(err)
	// }
	// dur = time.Since(clock)
	// fmt.Printf("✅ %s (%0.3fs)\n", config.CacheDir+"/app.js", dur.Seconds())

	// // App
	// clock = time.Now()
	// appBytes, err := ReadApp(config, router)
	// if err != nil {
	// 	panic(err)
	// }
	// err = ioutil.WriteFile(config.CacheDir+"/app.js", appBytes, 0644)
	// if err != nil {
	// 	panic(err)
	// }
	// dur = time.Since(clock)
	// fmt.Printf("✅ %s (%0.3fs)\n", config.CacheDir+"/app.js", dur.Seconds())
}
