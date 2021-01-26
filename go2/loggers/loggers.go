package loggers

import (
	"os"
	"strings"

	"github.com/zaydek/retro/color"
)

var (
	RawStdout = New(os.Stdout, NoopTransform)
	RawStderr = New(os.Stderr, NoopTransform)
)

var spaces = strings.Repeat(" ", 2)

var Stdout = New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + arr[x]
				continue
			}
			arr[x] = spaces + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
})

var Stderr = New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.BoldRed("error:") + " " + arr[x]
				continue
			}
			arr[x] = spaces + spaces + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
})
