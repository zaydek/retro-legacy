package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
)

// TODO: Revert to `[]byte(...)` for stderr and stdout.
func execcmd(cmdargs ...string) (stdout, stderr string, err error) {
	cmd := exec.Command(cmdargs[0], cmdargs[1:]...)

	// Prepare stdout and stderr:
	var stdoutBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf

	// Run the command:
	err = cmd.Run()
	stdout = stdoutBuf.String()
	stderr = stderrBuf.String()
	return stdout, stderr, err
}

// TODO: This should be inferred or read from the command-line.
const CONFIG_PATH = "config.json"

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

func main() {
	config, err := InitConfiguration(CONFIG_PATH)
	if err != nil {
		log.Fatal(err)
	}
	routes, err := config.GetPageBasedRoutes()
	if err != nil {
		log.Fatal(err)
	}
	err = config.WritePageProps(routes)
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
