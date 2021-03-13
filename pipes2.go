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

type JSON map[string]interface{}

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

func runCmd(args ...string) (stdin, stdout, stderr chan JSON, err error) {
	stdin = make(chan JSON)
	stdout, stderr = make(chan JSON), make(chan JSON)

	cmd := exec.Command(args[0], args[1:]...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer func() {
			stdinPipe.Close()
			// Do not close(stdin) here
		}()
		for msg := range stdin {
			bstr, _ := json.Marshal(msg)
			stdinPipe.Write(bstr)
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
			var data JSON
			json.Unmarshal(scanner.Bytes(), &data)
			stdout <- data
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
			var data JSON
			json.Unmarshal(scanner.Bytes(), &data)
			stderr <- data
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
		// for x := 0; x < 5; x++ {
		stdin <- JSON{"hello": "world"}
		// }
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
		case msg, ok := <-stderr:
			if !ok {
				break cmd
			}
			bstr, _ := json.Marshal(msg)
			logger.Stderr(string(bstr))
		}
	}
	fmt.Println()
}
