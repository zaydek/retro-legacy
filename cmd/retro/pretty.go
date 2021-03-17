package main

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

const MAX_LEN = 40

func indexify(pathname string) string {
	if strings.HasSuffix(pathname, "/") {
		return pathname + "index"
	}
	return pathname
}

func prettyDuration(dur time.Duration) string {
	var str string
	if amount := dur.Nanoseconds(); amount < 1_000 {
		// str = strconv.Itoa(int(amount)) + "ns"
		str = "0ms"
	} else if amount := dur.Microseconds(); amount < 1_000 {
		// str = strconv.Itoa(int(amount)) + "µs"
		str = "0ms"
	} else if amount := dur.Milliseconds(); amount < 1_000 {
		str = strconv.Itoa(int(amount)) + "ms"
	} else {
		str = strconv.Itoa(int(dur.Seconds())) + "s"
	}
	return str
}

// <source> --- <target> (<n>ms)
func prettyServerRoute(dirs DirConfiguration, srvRoute ServerRoute, dur time.Duration) string {
	primary := normal
	if srvRoute.Route.Type == "dynamic" {
		primary = cyan
	}

	secondary := dim
	if srvRoute.Route.Type == "dynamic" {
		secondary = dimCyan
	}

	ext := filepath.Ext(srvRoute.Route.Source)

	var entry string
	entry = srvRoute.Route.Source[len(dirs.SrcPagesDir):]
	entry = entry[:len(entry)-len(ext)]

	pathname := indexify(srvRoute.Route.Pathname)

	var str string
	str += secondary("/")
	str += primary(entry[1:])
	str += secondary(ext)
	str += " "
	str += secondary(strings.Repeat("-", MAX_LEN-len(entry[1:])))
	str += " "
	str += secondary("/")
	str += primary(pathname[1:])
	str += " "
	str += secondary(fmt.Sprintf("(%s)", prettyDuration(dur)))
	return str
}
