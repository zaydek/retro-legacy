package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
)

////////////////////////////////////////////////////////////////////////////////

var (
	dim  = terminal.New(terminal.DimCode).Sprint
	cyan = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	red  = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
)

type LoggerOptions struct {
	Datetime bool
	Date     bool
	Time     bool
}

type Logger struct {
	format string
	mu     sync.Mutex
}

func (l *Logger) Stdout(args ...interface{}) {
	logger2.mu.Lock()
	defer logger2.mu.Unlock()

	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		tstr := time.Now().Format(l.format)
		lines[x] = fmt.Sprintf("%s  %s %s", dim(tstr), cyan("stdout"), line)
	}
	fmt.Fprintln(os.Stdout, strings.Join(lines, "\n"))
}

func (l *Logger) Stderr(args ...interface{}) {
	logger2.mu.Lock()
	defer logger2.mu.Unlock()

	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		tstr := time.Now().Format(l.format)
		lines[x] = fmt.Sprintf("%s  %s %s", dim(tstr), red("stderr"), line)
	}
	fmt.Fprintln(os.Stderr, strings.Join(lines, "\n"))
}

func newLogger(args ...LoggerOptions) *Logger {
	opt := LoggerOptions{Datetime: true}
	if len(args) == 1 {
		opt = args[0]
	}

	var format string
	if opt.Datetime {
		format += "Jan 02 15:04:05.000 PM"
	} else {
		if opt.Date {
			format += "Jan 02"
		}
		if opt.Time {
			if format != "" {
				format += " "
			}
			format += "15:04:05.000 PM"
		}
	}

	logger := &Logger{format: format}
	return logger
}

var logger2 = newLogger(LoggerOptions{Time: true})

////////////////////////////////////////////////////////////////////////////////

type JSON map[string]interface{}

type Message struct {
	Kind string
	Data interface{}
}

type OutgoingMessage JSON

func node(args ...string) (chan Message, chan string, chan string, error) {
	var (
		stdin = make(chan Message)

		stdout = make(chan string)
		stderr = make(chan string)
	)

	cmd := exec.Command("node", args...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer stdinPipe.Close()
		for msg := range stdin {
			bstr, _ := json.Marshal(msg)
			stdinPipe.Write(append(bstr, '\n'))
		}
	}()

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer func() {
			stdoutPipe.Close()
			close(stdout)
		}()

		// Increase the buffer from 64K to 512K; https://stackoverflow.com/a/39864391
		scanner := bufio.NewScanner(stdoutPipe)
		buf := make([]byte, 512*1024)
		scanner.Buffer(buf, len(buf))

		// Read start-to-end
		scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) { return len(data), data, nil })
		for scanner.Scan() {
			stdout <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer func() {
			stderrPipe.Close()
			close(stderr)
		}()

		// Increase the buffer from 64K to 512K; https://stackoverflow.com/a/39864391
		scanner := bufio.NewScanner(stderrPipe)
		buf := make([]byte, 512*1024)
		scanner.Buffer(buf, len(buf))

		// Read start-to-end
		scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) { return len(data), data, nil })
		for scanner.Scan() {
			stderr <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	if err := cmd.Start(); err != nil {
		return nil, nil, nil, err
	}
	return stdin, stdout, stderr, nil
}
