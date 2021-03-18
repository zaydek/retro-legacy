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

	// Create a standard-input in-channel
	stdin := make(chan Message)
	go func() {
		defer stdinPipe.Close()
		for msg := range stdin {
			bstr, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}
			// Add an EOF for 'await stdin()' (Node.js)
			stdinPipe.Write(append(bstr, '\n'))
		}
	}()

	// Create a standard-output out-channel
	stdout := make(chan string)
	go func() {
		defer func() {
			stdoutPipe.Close()
			close(stdout)
		}()
		scanner := bufio.NewScanner(stdoutPipe)
		for scanner.Scan() {
			stdout <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	// Create a standard-error out-channel
	stderr := make(chan string)
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

	out1, err := input(Message{Kind: "run"})
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out1)

	out2, err := input(Message{Kind: "rerun"})
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out2)
}
