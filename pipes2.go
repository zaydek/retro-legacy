package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
)

func must(err error) {
	if err == nil {
		return
	}
	// panic(err)
	os.Exit(1)
}

////////////////////////////////////////////////////////////////////////////////

type Message struct {
	Kind string                 `json:"kind"`
	Data map[string]interface{} `json:"data"`
}

////////////////////////////////////////////////////////////////////////////////

var (
	dim      = terminal.New(terminal.DimCode).Sprint
	boldCyan = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldRed  = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
)

type Logger struct {
	Stdout func(...interface{})
	Stderr func(...interface{})
}

func newLogger() Logger {
	current := func() string {
		return time.Now().Format("Jan 02 15:04:05.000 PM")
	}
	logger := Logger{
		Stdout: func(args ...interface{}) {
			fmt.Fprintf(os.Stdout, " %s  %s ", dim(current()), boldCyan("stdout:"))
			fmt.Fprintln(os.Stderr, args...)
		},
		Stderr: func(args ...interface{}) {
			fmt.Fprintf(os.Stdout, " %s  %s ", dim(current()), boldRed("stderr:"))
			fmt.Fprintln(os.Stderr, args...)
		},
	}
	return logger
}

var logger = newLogger()

////////////////////////////////////////////////////////////////////////////////

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

func main() {
	stdin, stdout, stderr, err := runCmd("node", "pipes2.js")
	if err != nil {
		panic(err)
	}

	go func() {
		defer close(stdin)
		stdin <- Message{Kind: "foo"}
		stdin <- Message{Kind: "bar"}
	}()

	fmt.Println()
cmd:
	for {
		select {
		case msg, ok := <-stdout:
			if !ok {
				break cmd
			}
			bstr, _ := json.Marshal(msg)
			logger.Stdout(string(bstr))
		case str, ok := <-stderr:
			if !ok {
				break cmd
			}
			logger.Stderr(str)
		}
	}
	fmt.Println()
}
