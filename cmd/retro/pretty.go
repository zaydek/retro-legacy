package main

import (
	"path/filepath"
	"strings"
)

const MAX_LEN = 40

func wIndex(pathname string) string {
	if strings.HasSuffix(pathname, "/") {
		return pathname + "index"
	}
	return pathname
}

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

	pathname := wIndex(srvRoute.Route.Pathname)

	var str string
	str += secondary("/")
	str += primary(pathname[1:])
	str += secondary(ext)
	str += " "
	str += secondary(strings.Repeat("-", MAX_LEN-len(pathname+ext)))
	str += " "
	str += secondary("/")
	str += primary(pathname[1:])
	str += secondary(".html")
	return str
}
