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
	arr := strings.Split(strings.TrimRight(str, "\n"), "\n")
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

func OK(str string) {
	mu.Lock()
	defer mu.Unlock()
	str = terminal.Boldf(" > %s%s\n", terminal.Green("ok:"), Transform(str, terminal.Green))
	fmt.Fprintln(os.Stdout, str)
}

func Warning(err error) {
	mu.Lock()
	defer mu.Unlock()
	var str string
	str = terminal.Boldf(" > %s%s\n", terminal.Yellow("warning:"), Transform(err.Error(), terminal.Magenta))
	fmt.Fprintln(os.Stderr, str)
}

func FatalError(err error) {
	mu.Lock()
	defer mu.Unlock()
	var str string
	str = terminal.Boldf(" > %s%s\n", terminal.Red("error:"), Transform(err.Error(), terminal.Magenta))
	fmt.Fprintln(os.Stderr, str)
	os.Exit(1)
}
