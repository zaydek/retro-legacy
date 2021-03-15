package main

import (
	"path/filepath"
	"strings"
)

const MAX_LEN = 40

// <source> --- <target>
func prettyServerRoute(srvRoute ServerRoute) string {
	ext := filepath.Ext(srvRoute.Route.Source)

	primary := normal
	if srvRoute.Route.Type == "dynamic" {
		primary = cyan
	}

	secondary := dim
	if srvRoute.Route.Type == "dynamic" {
		secondary = dimCyan
	}

	var str string
	str += secondary("/")
	str += primary(srvRoute.Route.Pathname[1:])
	str += secondary(ext)
	str += " "
	str += secondary(
		strings.Repeat(
			"-",
			MAX_LEN-len(srvRoute.Route.Pathname+ext),
		),
	)
	str += " "
	str += secondary("/")
	str += primary(srvRoute.Route.Pathname[1:])
	str += secondary(".html")
	return str
}
