package ipc

import (
	"bufio"
	"encoding/json"
	"errors"
	"os/exec"
	"strings"
)

type Message struct {
	Kind string
	Data interface{}
}

// NewCommand starts a new IPC command. NewCommand returns a send function that
// sends messages to the subprocess.
func NewCommand(cmdStr string) (func(Message) (string, error), error) {
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
