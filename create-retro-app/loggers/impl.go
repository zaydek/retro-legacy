package loggers

import (
	"fmt"
	"io"
	"os"
	"sync"
)

type Logger struct {
	mu        *sync.Mutex
	w         io.Writer
	transform func(string) string
}

func noopTransform(str string) string { return str }

func New(w io.Writer) Logger {
	logger := Logger{
		mu:        &sync.Mutex{},
		transform: noopTransform, w: w,
	}
	return logger
}

func NewTransform(w io.Writer, transform func(string) string) Logger {
	logger := Logger{
		mu:        &sync.Mutex{},
		transform: transform, w: w,
	}
	return logger
}

func (l Logger) Println(args ...interface{}) (n int, err error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprintln(args...))
	return fmt.Fprint(l.w, transformed)
}

func (l Logger) Fatalln(args ...interface{}) {
	l.mu.Lock()
	defer l.mu.Unlock()
	transformed := l.transform(fmt.Sprintln(args...))
	fmt.Fprint(l.w, transformed)
	os.Exit(1)
}
