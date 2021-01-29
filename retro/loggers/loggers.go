package loggers

import (
	"os"
	"strings"

	"github.com/zaydek/retro/term"
)

var Stderr = NewTransform(os.Stdout, func(msg string) string {
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
})
