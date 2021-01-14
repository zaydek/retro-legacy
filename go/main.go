package main

import (
	"fmt"
	"log"
)

const CONF_PATH = "go/config.json"

func main() {
	config, err := InitConfigurationFile(CONF_PATH)
	if err != nil {
		log.Fatal(err)
	}
	routes, err := config.GetPageBasedRoutes()
	if err != nil {
		log.Fatal(err)
	}
	for _, route := range routes {
		fmt.Printf("pageName=%s\n", route.pageName)
	}
}
