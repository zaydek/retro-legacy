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

// func (l *Logger) Stdout(args ...interface{}) {
// 	logger.mu.Lock()
// 	defer logger.mu.Unlock()
// 	fmt.Fprintf(os.Stdout, "%s  %s %s\n", dim(time.Now().Format(l.format)), outcolor("stdout"),
// 		fmt.Sprint(args...))
// }
//
// func (l *Logger) Stderr(args ...interface{}) {
// 	logger.mu.Lock()
// 	defer logger.mu.Unlock()
// 	fmt.Fprintf(os.Stderr, "%s  %s %s\n", dim(time.Now().Format(l.format)), errcolor("stderr"),
// 		fmt.Sprint(args...))
// }

// func (l *Logger) Stdout(args ...interface{}) {
// 	logger.mu.Lock()
// 	defer logger.mu.Unlock()
// 	fmt.Fprintf(os.Stdout, "%s  %s %s\n", dim(time.Now().Format(l.format)), outcolor("stdout"),
// 		fmt.Sprint(args...))
// }

func (l *Logger) Stdout(args ...interface{}) {
	logger.mu.Lock()
	defer logger.mu.Unlock()

	// Remove extraneous ws at the end
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		tstr := time.Now().Format(l.format)
		lines[x] = fmt.Sprintf("%s  %s %s", dim(tstr), outcolor("stdout"), line)
	}
	fmt.Fprintln(os.Stdout, strings.Join(lines, "\n"))
}

func (l *Logger) Stderr(args ...interface{}) {
	logger.mu.Lock()
	defer logger.mu.Unlock()

	// Remove extraneous ws at the end
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		tstr := time.Now().Format(l.format)
		lines[x] = fmt.Sprintf("%s  %s %s", dim(tstr), errcolor("stderr"), line)
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

var logger = newLogger(LoggerOptions{Time: true})

////////////////////////////////////////////////////////////////////////////////

type JSON map[string]interface{}

type IncomingMessage struct {
	Kind string
	Data JSON
}

type OutgoingMessage JSON

func runCmd(args ...string) (stdin chan IncomingMessage, stdout chan OutgoingMessage, stderr chan string, err error) {
	cmd := exec.Command(args[0], args[1:]...)

	stdin = make(chan IncomingMessage)
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

	stdout = make(chan OutgoingMessage)
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
			msg := OutgoingMessage{} // Must use {} syntax here
			json.Unmarshal(scanner.Bytes(), &msg)
			stdout <- msg
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	stderr = make(chan string)
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer func() {
			stderrPipe.Close()
			close(stderr)
		}()
		// Scan start-to-end
		scanner := bufio.NewScanner(stderrPipe)
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

////////////////////////////////////////////////////////////////////////////////

func main() {
	stdin, stdout, stderr, err := runCmd("node", "pipes2.js")
	if err != nil {
		panic(err)
	}

	defer func() {
		stdin <- IncomingMessage{Kind: "done"}
		close(stdin)
	}()

	stdin <- IncomingMessage{Kind: "foo", Data: JSON{"foo": "bar"}}
	select {
	case msg := <-stdout:
		bstr, _ := json.Marshal(msg)
		logger.Stdout(string(bstr))
	case str := <-stderr:
		logger.Stderr(str)
		os.Exit(1)
	}

	stdin <- IncomingMessage{Kind: "bar", Data: JSON{"foo": "bar"}}
	select {
	case msg := <-stdout:
		bstr, _ := json.Marshal(msg)
		logger.Stdout(string(bstr))
	case str := <-stderr:
		logger.Stderr(str)
		os.Exit(1)
	}

	stdin <- IncomingMessage{Kind: "baz", Data: JSON{"foo": "bar"}}
	select {
	case msg := <-stdout:
		bstr, _ := json.Marshal(msg)
		logger.Stdout(string(bstr))
	case str := <-stderr:
		logger.Stderr(str)
		os.Exit(1)
	}
}
