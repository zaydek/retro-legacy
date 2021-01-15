package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"time"
)

func main() {
	config, err := InitConfiguration("config.json")
	if err != nil {
		panic(err)
	}
	routes, err := config.GetPageBasedRoutes()
	if err != nil {
		panic(err)
	}
	start := time.Now()
	pagePropsBytes, err := PagePropsService(routes)
	if err != nil {
		panic(err)
	}
	err = ioutil.WriteFile(config.CacheDir+"/pageProps.js", pagePropsBytes, os.ModePerm)
	if err != nil {
		panic(err)
	}
	dur := time.Since(start)

	// TODO: Change to a `bytes.Buffer` implementation.
	fmt.Printf("✅ %s (%0.1fs)\n", config.CacheDir+"/pageProps.js", dur.Seconds())
	for _, r := range routes {
		fmt.Printf("\t- %s\n", r.Path)
	}

	start = time.Now()
	appBytes, err := AppService(routes)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(appBytes))

	// fmt.Printf("✅ %s (%0.1fs)\n", config.CacheDir+"/pageProps.js", dur.Seconds())
	// for _, r := range routes {
	// 	fmt.Printf("\t- %s\n", r.Path)
	// }
}
