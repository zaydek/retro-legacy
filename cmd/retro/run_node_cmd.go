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

func runNodeCmd(args ...string) (stdin, stdout chan Message, stderr chan string, err error) {
	stdin, stdout = make(chan Message), make(chan Message)
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
			bstr, _ := json.Marshal(msg)
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
		// Upgrade the buffer
		scanner := bufio.NewScanner(stdoutPipe)
		buf := make([]byte, 1024*1024)
		scanner.Buffer(buf, len(buf))
		for scanner.Scan() {
			var msg Message
			json.Unmarshal(scanner.Bytes(), &msg)
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
