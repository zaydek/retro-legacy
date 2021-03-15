package main

import (
	"fmt"
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
		str = strconv.Itoa(int(amount)) + "ns"
	} else if amount := dur.Microseconds(); amount < 1_000 {
		str = strconv.Itoa(int(amount)) + "µs"
	} else if amount := dur.Milliseconds(); amount < 1_000 {
		str = strconv.Itoa(int(amount)) + "ms"
	} else {
		str = strconv.Itoa(int(amount)) + "s"
	}
	return str
}

// <source> --- <target> (<n>ms)
func prettyServerRoute(dirs DirConfiguration, srvRoute ServerRoute, dur time.Duration) string {
	// primary := normal
	primary := bold
	if srvRoute.Route.Type == "dynamic" {
		// primary = cyan
		primary = boldCyan
	}

	secondary := dim
	if srvRoute.Route.Type == "dynamic" {
		secondary = dimCyan
	}

	entry := srvRoute.Route.Source[len(dirs.SrcPagesDir):]
	pathname := indexify(srvRoute.Route.Pathname)

	var str string
	str += secondary("/")
	str += primary(entry[1:])
	str += " "
	str += secondary(strings.Repeat("-", MAX_LEN-len(entry[1:])))
	str += " "
	str += secondary("/")
	str += primary(pathname[1:])
	str += " "
	str += secondary(fmt.Sprintf("(%s)", prettyDuration(dur)))
	return str
}
