package loggers

import (
	"fmt"
	"io"
	"sync"
)

type Logger struct {
	mu        sync.Mutex
	w         io.Writer
	transform func(string) string
}

func NoopTransform(str string) string { return str }

func New(w io.Writer, transform func(string) string) *Logger {
	return &Logger{transform: transform, w: w}
}

func (l *Logger) Println(args ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprintln(args...))
	fmt.Fprint(l.w, transformed)
}
