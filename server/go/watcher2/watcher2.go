package watcher2

import (
	"os"
	"path/filepath"
	"time"
)

type WatchResult struct{ Err error }

// Creates a new watcher for directory dir. Directory dir is walked recursively.
func New(dir string, poll time.Duration) <-chan WatchResult {
	var (
		ch     = make(chan WatchResult)
		modMap = map[string]time.Time{}
	)

	go func() {
		defer close(ch)
		for range time.Tick(poll) {
			if err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}

				if prev, ok := modMap[path]; !ok {
					modMap[path] = info.ModTime()
				} else {
					if next := info.ModTime(); prev != next {
						modMap[path] = next
						ch <- WatchResult{nil}
					}
				}
				return nil
			}); err != nil {
				ch <- WatchResult{err}
			}
		}
	}()
	return ch
}
