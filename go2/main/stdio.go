package main

import (
	"os"
	"strings"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/logger"
)

var spaces = strings.Repeat(" ", 2)

// raw is for raw output to stdout.
var raw = logger.New(os.Stdout, logger.NoopTransform)

// stdout is for decorated output to stdout.
var stdout = logger.New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.BoldGreen("stdout:") + " " + arr[x]
				continue
			}
			arr[x] = spaces + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
})

// stderr is for decorated output to stderr.
var stderr = logger.New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.BoldRed("stderr:") + " " + arr[x]
				continue
			}
			arr[x] = spaces + spaces + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
})
