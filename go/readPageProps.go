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
// TODO: Need to guard `null` error case for `json.MarshalIndent` which
// currently passes.
func ReadPageProps(config Configuration, router PageBasedRouter) ([]byte, error) {
	var buf bytes.Buffer

	dot := struct {
		Config Configuration   `json:"config"`
		Router PageBasedRouter `json:"router"`
	}{Config: config, Router: router}

	dotBytes, err := json.MarshalIndent(dot, "", "\t")
	if err != nil {
		return nil, err
	}

	stdout, stderr, err := execcmd("yarn", "-s", "ts-node", "-T", "go/services/pageProps.ts", string(dotBytes))
	if stderr != nil { // Takes precedence
		return nil, errors.New(string(stderr))
	} else if err != nil {
		return nil, err
	}

	buf.Write([]byte(`
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

module.exports = `))
	buf.Write(stdout)

	contents := buf.Bytes()
	contents = bytes.TrimLeft(contents, "\n") // Remove BOF

	return contents, nil
}
