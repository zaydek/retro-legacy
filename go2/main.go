package main

import (
	"fmt"

	"github.com/zaydek/retro/static"
)

// Usage:
//
//   # writes retro.config.json and pages directory with starter components
//   retro init
//
//   # watches and rebuilds the development server
//   retro watch
//
//   # builds the production build
//   retro build
//
//   # serves development server or production builds; serves build
//   retro serve
//
// retro help or retro --help

func main() {
	// config, err := config.LoadOrCreateConfiguration()
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Printf("%+v\n", config)

	for _, asset := range static.Assets {
		fmt.Println(asset)
	}
}
