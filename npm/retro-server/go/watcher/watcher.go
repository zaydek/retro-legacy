package watcher

import (
	"os"
	"path/filepath"
	"time"
)

// New returns a read-only channel that sends on recursive file and or directory
// changes to dir.
func New(dir string, poll time.Duration) <-chan struct{} {
	var (
		ch = make(chan struct{})

		// Maps paths to (file.FileInfo).ModTime().
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
						ch <- struct{}{}
					}
				}
				return nil
			}); err != nil {
				panic(err)
			}
		}
	}()
	return ch
}
