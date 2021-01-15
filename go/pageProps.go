package main

import (
	"bytes"
	"encoding/json"
	"errors"
)

// Resolves page props. Uses `ts-node` to so Node.js can asynchronously resolve
// exported `props`.
//
// TODO: All service-based functions should use a timeout or a contextual
// timeout.
// TODO: Change this to use channels so we can report resolving props as they
// happen.
func PagePropsService(routes []*PageBasedRoute) ([]byte, error) {
	// TODO: Stat service before invoking in.
	// TODO: Should services be a data structure?
	b, err := json.MarshalIndent(routes, "", "\t")
	if err != nil {
		return nil, err
	}
	// '[ { "path": "pages/page-a.tsx", "pageName": "/pages/page-a", "componentName": "PageA" } ]'
	stdout, stderr, _ := execcmd("yarn", "-s", "ts-node", "-T", "go/services/pageProps.ts", string(b))
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
