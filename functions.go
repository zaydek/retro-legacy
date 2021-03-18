package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type Message struct {
	Kind string
	Data interface{}
}

func newCmd(cmdStr string) (func(Message) (string, error), error) {
	cmdArgs := strings.Split(cmdStr, " ")
	cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}

	stdin := make(chan Message)
	go func() {
		defer stdinPipe.Close()
		for msg := range stdin {
			bstr, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}
			// Add an EOF so 'await stdin()' can process
			stdinPipe.Write(append(bstr, '\n'))
		}
	}()

	stdout := make(chan string)
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
			stdout <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	stderr := make(chan string)
	go func() {
		defer func() {
			stderrPipe.Close()
			close(stderr)
		}()
		// Read from start-to-end
		// https://golang.org/pkg/bufio/#SplitFunc
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
			return len(data), data, nil
		})
		for scanner.Scan() {
			stderr <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	// Start the command
	if err := cmd.Start(); err != nil {
		return nil, err
	}

	return func(msg Message) (string, error) {
		stdin <- msg
		var out string
		select {
		case str := <-stdout:
			out = str
		case errstr := <-stderr:
			return "", errors.New(errstr)
		}
		return out, nil
	}, nil
}

func main() {
	input, err := newCmd("node functions-node.esbuild.js")
	if err != nil {
		panic(err)
	}

	run := func() (string, error) { return input(Message{Kind: "run"}) }
	rerun := func() (string, error) { return input(Message{Kind: "rerun"}) }

	s1, err := run()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(s1)

	s2, err := rerun()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(s2)
}
