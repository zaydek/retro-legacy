package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
)

type Message struct {
	Kind string
	Data interface{}
}

func newRunCmd() (func() (func() (string, error), string, error), error) {
	cmd := exec.Command("node", "functions-node.esbuild.js")

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
			// Add an EOF so 'await stdin()' can process
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

	return func() (func() (string, error), string, error) {
		stdin <- Message{Kind: "run"}
		var out string
		select {
		case msg := <-stdout:
			out = msg
		case errmsg := <-stderr:
			return nil, "", errors.New(errmsg)
		}
		return func() (string, error) {
			stdin <- Message{Kind: "rerun"}
			var out string
			select {
			case msg := <-stdout:
				out = msg
			case errmsg := <-stderr:
				return "", errors.New(errmsg)
			}
			return out, nil
		}, out, nil
	}, nil
}

func main() {
	run, err := newRunCmd()
	if err != nil {
		panic(fmt.Errorf("stderr: %w", err))
	}

	// Run
	rerun, out1, err := run()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out1)

	// Rerun
	var out2 string
	out2, err = rerun()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out2)

	out2, err = rerun()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out2)

	out2, err = rerun()
	if err != nil {
		fmt.Fprintln(os.Stderr, fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	fmt.Println(out2)
}
