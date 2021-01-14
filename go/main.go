package main

import (
	"io/ioutil"
	"log"
	"os"
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
	b, err := ResolvePageProps(routes)
	if err != nil {
		log.Fatal(err)
	}
	err = ioutil.WriteFile(config.CacheDir+"/pageProps.js", b, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	// fmt.Printf("stdout=%s stderr=%s err=%s\n", stdout, stderr, err)

	// stdout, stderr, err := execcmd("echo hi")
	// fmt.Printf("stdout=%s stderr=%s err=%s\n", stdout, stderr, err)

	// for _, route := range routes {
	// 	fmt.Printf("pageName=%s\n", route.pageName)
	// }
	// fmt.Printf("%+v\n", routes)
}
