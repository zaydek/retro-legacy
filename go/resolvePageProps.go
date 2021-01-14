package main

import (
	"bytes"
	"encoding/json"
	"errors"
)

// Resolves page props. Uses `ts-node` to so Node.js can asynchronously resolve
// exported `props`.
func ResolvePageProps(routes []*PageBasedRoute) ([]byte, error) {
	b, err := json.MarshalIndent(routes, "", "")
	if err != nil {
		return nil, err
	}
	stdout, stderr, _ := execcmd("yarn", "--silent", "ts-node", "-T", "go/resolvePageProps.service.ts", string(b))
	if stderr != "" { // Takes precedence
		return nil, errors.New("resolvePageProps.service.ts: " + stderr)
	} else if err != nil {
		return nil, err
	}
	contents := []byte(`
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

module.exports = ` + stdout)
	contents = bytes.TrimLeft(contents, "\n")
	return contents, nil
}
