package ipc

import (
	"bufio"
	"encoding/json"
	"errors"
	"os/exec"
)

type RequestMessage struct {
	Kind string
	Data interface{}
}

type ResponseMessage struct {
	Kind string
	Data json.RawMessage
}

// NewCommand starts a new IPC command.
func NewCommand(args ...string) (stdin chan RequestMessage, stdout chan ResponseMessage, stderr chan string, err error) {
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

	stdin = make(chan RequestMessage)
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

	stdout = make(chan ResponseMessage)
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
			var res ResponseMessage
			if err := json.Unmarshal(scanner.Bytes(), &res); err != nil {
				panic(err)
			}
			stdout <- res
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	stderr = make(chan string)
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
		return nil, nil, nil, err
	}
	return stdin, stdout, stderr, nil
}

type Service struct {
	Stdin  chan RequestMessage
	Stdout chan ResponseMessage
	Stderr chan string
}

func (s Service) Send(msg RequestMessage, ptr interface{}) error {
	s.Stdin <- msg
	select {
	case msg := <-s.Stdout:
		if err := json.Unmarshal(msg.Data, ptr); err != nil {
			panic(err)
		}
		return nil
	case bstr := <-s.Stderr:
		return errors.New(string(bstr))
	}
}
