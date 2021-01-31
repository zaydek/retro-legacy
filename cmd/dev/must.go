package dev

import (
	"github.com/zaydek/retro/pkg/loggers"
)

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	loggers.Stderr.Fatalln(err)
}
