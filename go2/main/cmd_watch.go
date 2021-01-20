package main

import (
	"fmt"
	"os"
)

func (r Retro) cmdWatch() {
	// port := resolvePort() TODO

	if _, err := os.Stat("retro.config.jsonc"); os.IsNotExist(err) {
		stderr.Fatalln("no such retro.config.jsonc; try retro init .")
	}

	var err error
	if r.config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	}

	if r.router, err = loadRouter(r.config); err != nil {
		stderr.Fatalln(err)
	}

	fmt.Printf("%+v\n", r.router)

}

//	bstr, err := renderPageProps(r.config, srcs)
//	if err != nil {
//		stderr.Fatalln(err)
//	}
//
//	filename := path.Join(r.config.CacheDir, "pageProps.js")
//	data := []byte(`// THIS FILE IS AUTO-GENERATED.
//// MOVE ALONG.
//
//module.exports = ` + string(bstr))
//	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
//		stderr.Fatalln(err)
//	}
