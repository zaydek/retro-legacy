package main

import (
	"os"
	"strings"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/logger"
)

var spaces = strings.Repeat(" ", 2)

// TODO: Add support for duration; how can a logger know a duration? It would
// need some kind of mechanism for starting and stopping a timer. Maybe we queue
// tasks with an ID? This seems over-complicated. Alternatively, this is handled
// separately from the logging mechanisms.
var stdout = logger.New(os.Stdout, func(msg string) string {
	// t := time.Now()

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

	// dur := time.Since(t) // FIXME
	transformed := "\n" +
		strings.Join(arr, "\n") +
		// "\n" + fmt.Sprintf("⚡️ %0.3fs", dur.Seconds()) +
		"\n"
	return transformed
})

// TODO: Add support for duration; how can a logger know a duration? It would
// need some kind of mechanism for starting and stopping a timer. Maybe we queue
// tasks with an ID? This seems over-complicated. Alternatively, this is handled
// separately from the logging mechanisms.
var stderr = logger.New(os.Stdout, func(msg string) string {
	// t := time.Now()

	arr := strings.Split(msg, "\n")
	for x := range arr {
		if arr[x] != "" {
			if x == 0 {
				arr[x] = spaces + color.BoldRed("error: ") + color.Bold(arr[x])
				continue
			}
			arr[x] = spaces + strings.Repeat(" ", len("error: ")) + arr[x]
		}
	}

	// dur := time.Since(t)
	transformed := "\n" +
		strings.Join(arr, "\n") +
		// "\n" + fmt.Sprintf("⚡️ %0.3fs", dur.Seconds()) +
		"\n"
	return transformed
})
