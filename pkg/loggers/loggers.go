package loggers

import (
	"fmt"
	"os"
	"runtime/debug"
	"strings"
	"sync"

	"github.com/zaydek/retro/pkg/term"
)

var mu sync.Mutex

var transformOK = func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = strings.Repeat(" ", 2) + term.BoldGreen("ok:") + " " + arr[x]
				continue
			}
			arr[x] = strings.Repeat(" ", 4) + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
}

var transformWarning = func(msg string) string {
	if mode := os.Getenv("DEBUG_MODE"); mode == "true" {
		msg += "\n" + string(debug.Stack())
	}
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = strings.Repeat(" ", 2) + term.BoldYellow("warning:") + " " + arr[x]
				continue
			}
			arr[x] = strings.Repeat(" ", 4) + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
}

var transformError = func(msg string) string {
	if mode := os.Getenv("DEBUG_MODE"); mode == "true" {
		msg += "\n" + string(debug.Stack())
	}
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = strings.Repeat(" ", 2) + term.BoldRed("error:") + " " + arr[x]
				continue
			}
			arr[x] = strings.Repeat(" ", 4) + arr[x]
		}
	}
	transformed := "\n" + strings.Join(arr, "\n") + "\n"
	return transformed
}

func OK(args ...interface{}) (n int, err error) {
	mu.Lock()
	defer mu.Unlock()
	out := transformOK(fmt.Sprint(args...))
	return fmt.Fprintln(os.Stdout, out)
}

func Warning(args ...interface{}) (n int, err error) {
	mu.Lock()
	defer mu.Unlock()
	out := transformWarning(fmt.Sprint(args...))
	return fmt.Fprintln(os.Stderr, out)
}

func Error(args ...interface{}) (n int, err error) {
	mu.Lock()
	defer mu.Unlock()
	out := transformError(fmt.Sprint(args...))
	return fmt.Fprintln(os.Stderr, out)
}

func FatalError(args ...interface{}) {
	mu.Lock()
	defer mu.Unlock()
	out := transformError(fmt.Sprint(args...))
	fmt.Fprintln(os.Stderr, out)
	os.Exit(1)
}
