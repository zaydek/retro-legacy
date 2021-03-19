package main

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
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

func prettyServerRoute(dirs DirConfiguration, srvRoute ServerRoute, dur time.Duration) string {
	main := terminal.Normal
	if srvRoute.Route.Type == "dynamic" {
		main = terminal.Green
	}

	alt := terminal.Dim
	if srvRoute.Route.Type == "dynamic" {
		alt = terminal.DimGreen
	}

	ext := filepath.Ext(srvRoute.Route.Source)

	var entry string
	entry = srvRoute.Route.Source[len(dirs.SrcPagesDir):]
	entry = entry[:len(entry)-len(ext)]

	pathname := indexify(srvRoute.Route.Pathname)

	var str string
	str += alt("/")
	str += main(entry[1:])
	str += alt(ext)
	str += " "
	str += alt(strings.Repeat("-", MAX_LEN-len(entry+ext)))
	str += " "
	str += alt("/")
	str += main(pathname[1:])
	str += " "
	str += alt(fmt.Sprintf("(%s)", prettyDuration(dur)))
	return str
}

// Based on api.ServeOnRequestArgs
type ServeArgs struct {
	Path       string
	StatusCode int
	Duration   time.Duration
}

func prettyServeEvent(args ServeArgs) string {
	main := terminal.Normal
	if args.StatusCode != 200 {
		main = terminal.Red
	}

	alt := terminal.Dim
	if args.StatusCode != 200 {
		alt = terminal.DimRed
	}

	// TODO: Cover ".js.map" case
	ext := filepath.Ext(args.Path)

	var entry string
	entry = args.Path
	entry = entry[:len(entry)-len(ext)]

	var str string
	str += alt("/")
	str += main(entry[1:])
	str += alt(ext)
	str += " "
	str += alt(strings.Repeat("-", MAX_LEN-len(entry+ext)))
	str += " "
	str += main(args.StatusCode)
	str += " "
	str += alt(fmt.Sprintf("(%s)", prettyDuration(args.Duration)))
	return str
}
