package main

import (
	"os"
	"strings"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/logger"
)

var spaces = strings.Repeat(" ", 2)

var stdout = logger.New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.Bold(arr[x])
				continue
			}
			arr[x] = spaces + arr[x]
		}
	}
	out := "\n" + strings.Join(arr, "\n") + "\n"
	return out
})

var stderr = logger.New(os.Stdout, func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.BoldRed("error: ") + color.Bold(arr[x])
				continue
			}
			arr[x] = spaces + spaces + arr[x]
		}
	}
	out := "\n" + strings.Join(arr, "\n") + "\n"
	return out
})
