package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"
)

func main() {
	config, err := InitConfiguration("config.json")
	if err != nil {
		log.Fatal(err)
	}
	routes, err := config.GetPageBasedRoutes()
	if err != nil {
		log.Fatal(err)
	}
	start := time.Now()
	b, err := PagePropsService(routes)
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile(config.CacheDir+"/pageProps.js", b, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}
	dur := time.Since(start)

	// TODO: Change to a `bytes.Buffer` implementation.
	fmt.Printf("✅ %s (%0.1fs)\n", config.CacheDir+"/pageProps.js", dur.Seconds())
	for _, r := range routes {
		fmt.Printf("\t- %s\n", r.Path)
	}

	// TODO: Write sub-routes below.
	// TODO: Write sub-routes at the same time or progressively?
}
