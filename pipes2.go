package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
)

func run(args ...string) (stdin, stdout, stderr chan string, err error) {
	stdin = make(chan string)
	stdout, stderr = make(chan string), make(chan string)

	cmd := exec.Command(args[0], args[1:]...)
	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, nil, nil, err
	}
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, nil, err
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, nil, nil, err
	}

	go func() {
		defer func() { stdinPipe.Close(); close(stdin) }()
		for msg := range stdin {
			stdinPipe.Write([]byte(msg))
		}
	}()

	go func() {
		defer func() { stdoutPipe.Close(); close(stdout) }()
		scanner := bufio.NewScanner(stdoutPipe)
		for scanner.Scan() {
			msg := scanner.Text()
			stdout <- msg
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	go func() {
		defer func() { stderrPipe.Close(); close(stderr) }()
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			msg := scanner.Text()
			stderr <- msg
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

var (
	dim      = terminal.New(terminal.DimCode).Sprint
	boldCyan = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldRed  = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
)

func main() {
	_, stdout, stderr, err := run("node", "pipes2.js")
	if err != nil {
		panic(err)
	}

	now := func() string {
		return time.Now().Format("Jan 02 15:04:05.000 PM")
	}

	var once bool
	logStdout := func(args ...interface{}) {
		if !once {
			fmt.Fprintln(os.Stderr)
			once = true
		}
		fmt.Fprintf(os.Stdout, " %s  %s ", dim(now()), boldCyan("stdout"))
		fmt.Fprintln(os.Stderr, args...)
	}

	logStderr := func(args ...interface{}) {
		if !once {
			fmt.Fprintln(os.Stderr)
			once = true
		}
		fmt.Fprintf(os.Stdout, " %s  %s ", dim(now()), boldRed("stderr"))
		fmt.Fprintln(os.Stderr, args...)
	}

for_:
	for {
		select {
		case msg, ok := <-stdout:
			if !ok {
				stdout = nil
				break for_
			}
			logStdout(msg)
		case msg, ok := <-stderr:
			if !ok {
				stderr = nil
				break for_
			}
			logStderr(msg)
		}
	}
	fmt.Println()

}
