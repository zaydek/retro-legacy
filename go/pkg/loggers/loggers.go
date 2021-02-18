package loggers

import (
	"fmt"
	"os"
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
				arr[x] = term.BoldGreen("ok:") + " " + /* term.Bold( */ arr[x] /* ) */
				continue
			}
			arr[x] = /* term.Bold( */ arr[x] /* ) */
		}
	}
	transformed := strings.Join(arr, "\n")
	return transformed
}

var transformWarning = func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = term.BoldYellow("warning:") + " " + /* term.Bold( */ arr[x] /* ) */
				continue
			}
			arr[x] = /* term.Bold( */ arr[x] /* ) */
		}
	}
	// out := "\n" + strings.Join(arr, "\n") + "\n"
	// if mode := os.Getenv("DEBUG_MODE"); mode == "true" {
	// 	out += "\n" + string(debug.Stack())
	// }
	transformed := strings.Join(arr, "\n")
	return transformed
}

var transformError = func(msg string) string {
	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = term.BoldRed("error:") + " " + /* term.Bold( */ arr[x] /* ) */
				continue
			}
			arr[x] = /* term.Bold( */ arr[x] /* ) */
		}
	}
	// out := "\n" + strings.Join(arr, "\n") + "\n"
	// if mode := os.Getenv("DEBUG_MODE"); mode == "true" { // TODO: Test output.
	// 	out += "\n" + string(debug.Stack())
	// }
	transformed := strings.Join(arr, "\n")
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

func ErrorAndEnd(args ...interface{}) {
	mu.Lock()
	defer mu.Unlock()
	out := transformError(fmt.Sprint(args...))
	fmt.Fprintln(os.Stderr, out)
	os.Exit(1)
}
