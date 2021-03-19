package main

import (
	"path/filepath"
	"strings"
	"time"

	"github.com/zaydek/retro/pkg/stdio_logger"
)

func getPathname(url string) string {
	pathname := url
	if strings.HasSuffix(url, "/index.html") {
		pathname = pathname[:len(pathname)-len("index.html")]
	} else if ext := filepath.Ext(url); ext == ".html" {
		pathname = pathname[:len(pathname)-len(".html")]
	}
	return pathname
}

func getSystemPathname(url string) string {
	sys_pathname := url
	if strings.HasSuffix(url, "/") {
		sys_pathname += "index.html"
	} else if ext := filepath.Ext(url); ext == "" {
		sys_pathname += ".html"
	}
	return sys_pathname
}

func logServeEvent200(pathname string, start time.Time) {
	dur := time.Since(start)
	stdio_logger.Stdout(prettyServeEvent(ServeArgs{Path: pathname, StatusCode: 200, Duration: dur}))
}

func logServeEvent404(pathname string, start time.Time) {
	dur := time.Since(start)
	stdio_logger.Stdout(prettyServeEvent(ServeArgs{Path: pathname, StatusCode: 404, Duration: dur}))
}

func logServeEvent500(pathname string, start time.Time) {
	dur := time.Since(start)
	stdio_logger.Stdout(prettyServeEvent(ServeArgs{Path: pathname, StatusCode: 500, Duration: dur}))
}
