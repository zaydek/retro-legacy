package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

func (c *Configuration) WritePageProps(routes []*PageBasedRoute) error {
	b, err := json.MarshalIndent(routes, "", "")
	if err != nil {
		log.Fatal(err)
	}
	stdout, stderr, err := execcmd("yarn", "--silent", "ts-node", "-T", "go/pageProps.ts", string(b))
	if stderr != "" { // Takes precedence
		log.Fatal(stderr)
	} else if err != nil {
		log.Fatal(err)
	}
	contents := []byte(`
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

module.exports = ` + stdout)
	contents = bytes.TrimLeft(contents, "\n")
	err = ioutil.WriteFile(c.CacheDir+"/pageProps.js", contents, os.ModePerm)
	if err != nil {
		return fmt.Errorf("attempted to write %s/pageProps.js to disk but failed; %w", c.CacheDir, err)
	}
	return nil
}
