package main

import (
	"os"

	"github.com/zaydek/retro/loggers"
)

func check(err error) {
	if err == nil {
		// No-op
		return
	}
	loggers.Stderr.Println(err)
	os.Exit(1)
}
