package logger

import (
	"fmt"
	"io"
	"sync"
)

type Logger struct {
	mu        sync.Mutex          // guards concurrent writes
	w         io.Writer           // writer
	transform func(string) string // transforms messages per write
}

func NoopTransform(str string) string { return str }

// New creates a new logger.
func New(w io.Writer, transform func(string) string) *Logger {
	return &Logger{transform: transform, w: w}
}

// Printf performs a transformation and logs.
func (l *Logger) Printf(format string, args ...interface{}) {
	l.mu.Lock()
	transformed := l.transform(fmt.Sprintf(format, args...))
	fmt.Fprint(l.w, transformed)
	l.mu.Unlock()
}

// Println performs a transformation and logs.
func (l *Logger) Println(args ...interface{}) {
	l.mu.Lock()
	transformed := l.transform(fmt.Sprintln(args...))
	fmt.Fprint(l.w, transformed)
	l.mu.Unlock()
}
