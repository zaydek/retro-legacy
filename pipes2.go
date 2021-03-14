package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"sync"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
)

func must(err error) {
	if err == nil {
		return
	}
	panic(err)
}

////////////////////////////////////////////////////////////////////////////////

var (
	dim      = terminal.New(terminal.DimCode).Sprint
	outcolor = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	errcolor = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
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
	logger.mu.Lock()
	defer logger.mu.Unlock()
	fmt.Fprintf(os.Stdout, "%s  %s %s\n", dim(time.Now().Format(l.format)), outcolor("stdout"),
		fmt.Sprint(args...))
}

func (l *Logger) Stderr(args ...interface{}) {
	logger.mu.Lock()
	defer logger.mu.Unlock()
	fmt.Fprintf(os.Stderr, "%s  %s %s\n", dim(time.Now().Format(l.format)), errcolor("stderr"),
		fmt.Sprint(args...))
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

var logger = newLogger(LoggerOptions{Time: true})

////////////////////////////////////////////////////////////////////////////////

type Message struct {
	Kind string                 `json:"kind"`
	Data map[string]interface{} `json:"data"`
}

func runCmd(args ...string) (stdin, stdout chan Message, stderr chan string, err error) {
	stdin = make(chan Message)
	stdout, stderr = make(chan Message), make(chan string)

	cmd := exec.Command(args[0], args[1:]...)

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
		scanner := bufio.NewScanner(stdoutPipe)
		for scanner.Scan() {
			var msg Message
			json.Unmarshal(scanner.Bytes(), &msg)
			stdout <- msg
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
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			str := scanner.Text()
			stderr <- str
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

////////////////////////////////////////////////////////////////////////////////

func main() {
	stdin, stdout, stderr, err := runCmd("node", "pipes2.js")
	if err != nil {
		panic(err)
	}

cmd:
	for _, kind := range []string{"foo", "bar", "baz"} {
		stdin <- Message{Kind: kind}
		select {
		// stdout messages are structured
		case msg, ok := <-stdout:
			if !ok {
				break cmd
			}
			bstr, _ := json.Marshal(msg)
			logger.Stdout(string(bstr))
		// stderr messages are unstructured
		case str, ok := <-stderr:
			if !ok {
				break cmd
			}
			logger.Stderr(str)
		}
	}
	close(stdin)
}
