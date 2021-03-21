package main

import (
	"fmt"
	"regexp"
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

var greedyExtRe = regexp.MustCompile(`(\.).*$`)

func prettyFilepath(filepath string, primary, secondary func(args ...interface{}) string) string {
	var ext string
	if matches := greedyExtRe.FindAllString(filepath, -1); len(matches) == 1 {
		ext = matches[0]
		filepath = filepath[:len(filepath)-len(ext)] // Remove .ext
	}
	parts := strings.Split(filepath, "/")
	for x, part := range parts {
		parts[x] = primary(part)
	}
	var str string
	str += strings.Join(parts, secondary("/"))
	str += secondary(ext)
	return str
}

func prettyServerRoute(dirs DirConfiguration, srvRoute ServerRoute, dur time.Duration) string {
	primary := terminal.Bold
	if srvRoute.Route.Type == "dynamic" {
		primary = terminal.Bold
	}

	secondary := terminal.Dim
	if srvRoute.Route.Type == "dynamic" {
		secondary = terminal.Dim
	}

	// entry := srvRoute.Route.Source[len(dirs.SrcPagesDir):]
	pathname := indexify(srvRoute.Route.Pathname)

	var str string
	// str += primary("→")
	// str += " "
	// if srvRoute.Route.Type == "dynamic" {
	// 	// str += prettyFilepath(entry, primary, secondary)
	// 	// str += " "
	// 	str += primary("→")
	// 	str += " "
	// }
	// str += terminal.Dim(strings.Repeat("-", MAX_LEN-len(entry)))
	// str += " "
	str += prettyFilepath(pathname, primary, secondary)
	if dur > time.Millisecond {
		str += " "
		str += secondary(fmt.Sprintf("(%s)", prettyDuration(dur)))
	}
	return str
}

// Based on api.ServeOnRequestArgs
type ServeArgs struct {
	Path       string
	StatusCode int
	Duration   time.Duration
}

func prettyServeEvent(args ServeArgs) string {
	primary := terminal.Bold
	if args.StatusCode != 200 {
		primary = terminal.BoldRed
	}

	secondary := terminal.Dim
	if args.StatusCode != 200 {
		secondary = terminal.DimRed
	}

	var str string
	// str += secondary(fmt.Sprintf("http://localhost:8000"))
	str += prettyFilepath(args.Path, primary, secondary)
	if args.StatusCode != 200 {
		str += " "
		// str += terminal.Dim(strings.Repeat("-", MAX_LEN-len(args.Path)))
		// str += " "
		str += primary(args.StatusCode)
	}
	if args.Duration > time.Millisecond {
		str += " "
		str += secondary(fmt.Sprintf("(%s)", prettyDuration(args.Duration)))
	}
	return str
}
