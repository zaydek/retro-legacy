package main

import (
	"bytes"
	"encoding/json"
	"errors"
)

// This service is responsible for resolving bytes for `cache/pageProps.js`.
//
// TODO: All service-based functions should use a timeout or a contextual
// timeout. If a service takes longer than, for example, 10 seconds, we may want
// to warn the user that there props takes longer than expected. Then we could
// add some kind of setting to configuration to suppress this warning message.
//
// TODO: Change this to use channels so we can report resolving props as they
// happen.
func PagePropsService(routes []*PageBasedRoute) ([]byte, error) {
	// TODO: If we want to have some kind of stopwatch profiling for services, we
	// probably need to do this in JavaScript because the only JavaScript is aware
	// of when and for how long async functions are running. Therefore we can log
	// stopwatch metadata to stdout for now and unmarshal. If this pattern is
	// common we can document these ideas in a service data structure. Maybe a
	// service is composed of tasks and every task is profiled.
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
	contents = bytes.TrimLeft(contents, "\n") // Remove BOF
	return contents, nil
}
