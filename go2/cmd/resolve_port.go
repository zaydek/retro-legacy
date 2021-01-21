package main

import (
	"os"
	"strconv"
)

var defaultPort = 8000

// Resolves a port number.
func resolvePort() int {
	if env := os.Getenv("PORT"); env != "" {
		portFromEnv, err := strconv.Atoi(env)
		if err != nil {
			stderr.Fatalln("bad port; try PORT=<number> retro serve")
		}
		return portFromEnv
	}
	return defaultPort
}
