package ipc

import (
	"bufio"
	"encoding/json"
	"os/exec"
)

type Request struct {
	Kind string
	Data interface{}
}

type Response struct {
	Kind string
	Data json.RawMessage
}

// NewCommand starts a new IPC command.
func NewCommand(args ...string) (stdin chan Request, stdout chan Response, stderr chan string, err error) {
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

	stdin = make(chan Request)
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

	stdout = make(chan Response)
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
			var res Response
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

// type Messenger struct {
// 	Stdin          chan Message
// 	Stdout, Stderr chan []byte
// }
//
// func (m Messenger) Send(msg Message) (Message, error) {
// 	m.Stdin <- msg
//
// 	var res Message
// 	select {
// 	case bstr := <-m.Stdout:
// 		if err := json.Unmarshal(bstr, &res); err != nil {
// 			return Message{}, err
// 		}
// 	case bstr := <-m.Stderr:
// 		return Message{}, errors.New(string(bstr))
// 	}
// 	return res, nil
// }