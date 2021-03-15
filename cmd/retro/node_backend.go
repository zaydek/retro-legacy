package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

type LoggerOptions struct {
	Datetime bool
	Date     bool
	Time     bool
}

type Logger struct {
	format string
}

var logger2 = newLogger(LoggerOptions{Time: true})

func newLogger(args ...LoggerOptions) *Logger {
	opt := LoggerOptions{Datetime: true}
	if len(args) == 1 {
		opt = args[0]
	}

	var format string
	if opt.Datetime {
		format += "Jan 02 03:04:05.000 PM"
	} else {
		if opt.Date {
			format += "Jan 02"
		}
		if opt.Time {
			if format != "" {
				format += " "
			}
			format += "03:04:05.000 PM"
		}
	}

	logger := &Logger{format: format}
	return logger
}

func (l *Logger) Stdout(args ...interface{}) {
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		lines[x] = fmt.Sprintf(" %s  %s", dim(time.Now().Format(l.format)), line)
	}
	fmt.Fprintln(os.Stdout, strings.Join(lines, "\n"))
}

func (l *Logger) Stderr(args ...interface{}) {
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		lines[x] = fmt.Sprintf(" %s  %s %s", dim(time.Now().Format(l.format)), boldRed("stderr"), line)
	}
	fmt.Fprintln(os.Stderr, strings.Join(lines, "\n"))
}

////////////////////////////////////////////////////////////////////////////////

type StdinMessage struct {
	Kind string
	Data interface{}
}

type StdoutMessage struct {
	Kind string
	Data json.RawMessage
}

func runNodeBackend(args ...string) (stdin chan StdinMessage, stdout chan StdoutMessage, stderr chan string, err error) {
	stdin, stdout = make(chan StdinMessage), make(chan StdoutMessage)
	stderr = make(chan string)

	cmd := exec.Command("node", args...)

	//////////////////////////////////////////////////////////////////////////////
	// cmd.StdinPipe()

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, nil, nil, err
	}
	go func() {
		defer stdinPipe.Close()
		for msg := range stdin {
			bstr, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}
			// Add '\n' for EOF
			stdinPipe.Write(append(bstr, '\n'))
		}
	}()

	//////////////////////////////////////////////////////////////////////////////
	// cmd.StdoutPipe()

	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, nil, err
	}
	go func() {
		defer func() {
			stdoutPipe.Close()
			close(stdout)
		}()

		// Increase the buffer
		scanner := bufio.NewScanner(stdoutPipe)
		buf := make([]byte, 1024*1024)
		scanner.Buffer(buf, len(buf))
		for scanner.Scan() {
			var msg StdoutMessage
			if err := json.Unmarshal(scanner.Bytes(), &msg); err != nil {
				panic(err)
			}
			stdout <- msg
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	//////////////////////////////////////////////////////////////////////////////
	// cmd.StderrPipe()

	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, nil, err
	}
	go func() {
		defer func() {
			stderrPipe.Close()
			close(stderr)
		}()

		// Read from start-to-end
		// https://golang.org/pkg/bufio/#SplitFunc
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) { return len(data), data, nil })
		for scanner.Scan() {
			stderr <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	//////////////////////////////////////////////////////////////////////////////

	if err := cmd.Start(); err != nil {
		return nil, nil, nil, err
	}
	return stdin, stdout, stderr, nil
}
