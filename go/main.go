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

func main() {
	var err error
	config, err = InitConfiguration("config.json")
	if err != nil {
		panic(err)
	}
	router, err = config.InitPageBasedRouter()
	if err != nil {
		panic(err)
	}

	var clock time.Time
	var dur time.Duration

	// pageProps.js
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

	// app.js
	clock = time.Now()
	appBytes, err := ReadApp(config, router)
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile(config.CacheDir+"/app.js", appBytes, 0644)
	if err != nil {
		panic(err)
	}
	dur = time.Since(clock)
	fmt.Printf("✅ %s (%0.3fs)\n", config.CacheDir+"/app.js", dur.Seconds())
}
