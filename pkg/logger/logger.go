package logger

import (
	"fmt"
	"os"
	"regexp"
	"strings"
	"sync"

	"github.com/zaydek/retro/pkg/terminal"
)

var accentRegex = regexp.MustCompile(`('[^']+')`)

func Transform(str string, accent func(...interface{}) string) string {
	arr := strings.Split(str, "\n")
	for x := range arr {
		if arr[x] == "" {
			continue
		}
		arr[x] = strings.ReplaceAll(arr[x], "\t", "  ")
		arr[x] = accentRegex.ReplaceAllString(arr[x], accent("$1"))
		arr[x] = " " + arr[x]
	}
	return strings.Join(arr, "\n")
}

var mu sync.Mutex

var (
	boldf   = terminal.Bold.Sprintf
	green   = terminal.Green.Sprint
	magenta = terminal.Magenta.Sprint
	red     = terminal.Red.Sprint
	yellow  = terminal.Yellow.Sprint
)

func OK(str string) {
	mu.Lock()
	defer mu.Unlock()
	str = boldf(" > %s%s\n", green("ok:"), Transform(str, green))
	fmt.Fprintln(os.Stdout, str)
}

func Warning(err error) {
	mu.Lock()
	defer mu.Unlock()
	var str string
	str = boldf(" > %s%s\n", yellow("warning:"), Transform(err.Error(), magenta))
	fmt.Fprintln(os.Stderr, str)
}

func Error(err error) {
	mu.Lock()
	defer mu.Unlock()
	var str string
	str = boldf(" > %s%s\n", red("error:"), Transform(err.Error(), magenta))
	fmt.Fprintln(os.Stderr, str)
}
