package logger

import (
	"fmt"
	"io"
	"os"
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

// Print performs a transformation and logs.
func (l *Logger) Print(args ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprint(args...))
	fmt.Fprint(l.w, transformed)
}

// Printf performs a transformation and logs.
func (l *Logger) Printf(format string, args ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprintf(format, args...))
	fmt.Fprint(l.w, transformed)
}

// Println performs a transformation and logs.
func (l *Logger) Println(args ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprintln(args...))
	fmt.Fprint(l.w, transformed)
}

// Fatal performs a transformation, logs, and exits (status code 1).
func (l *Logger) Fatal(args ...interface{}) {
	l.Print(args...)
	os.Exit(1)
}

// Fatalf performs a transformation, logs, and exits (status code 1).
func (l *Logger) Fatalf(format string, args ...interface{}) {
	l.Printf(format, args...)
	os.Exit(1)
}

// Fatalln performs a transformation, logs, and exits (status code 1).
func (l *Logger) Fatalln(args ...interface{}) {
	l.Println(args...)
	os.Exit(1)
}
