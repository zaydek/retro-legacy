package main

import (
	"bufio"
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
			fmt.Fprintf(os.Stdout, "%s  %s ", dim(current()), boldCyan("stdout:"))
			fmt.Fprintln(os.Stderr, args...)
		},
		Stderr: func(args ...interface{}) {
			fmt.Fprintf(os.Stdout, "%s  %s ", dim(current()), boldRed("stderr:"))
			fmt.Fprintln(os.Stderr, args...)
		},
	}
	return logger
}

var logger = newLogger()

////////////////////////////////////////////////////////////////////////////////

func runCmd(args ...string) (stdin, stdout, stderr chan string, err error) {
	stdin = make(chan string)
	stdout, stderr = make(chan string), make(chan string)

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
			stdinPipe.Write([]byte(msg + "\n"))
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
			stdout <- scanner.Text()
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

func main() {
	stdin, stdout, stderr, err := runCmd("node", "pipes2.js")
	if err != nil {
		panic(err)
	}

	go func() {
		defer close(stdin)
		for x := 0; x < 5; x++ {
			stdin <- "Hello, world!"
		}
	}()

cmd:
	for {
		select {
		case msg, ok := <-stdout:
			if !ok {
				break cmd
			}
			logger.Stdout(msg)
		case msg, ok := <-stderr:
			if !ok {
				break cmd
			}
			logger.Stderr(msg)
		}
	}
}

// type RunCommand struct {
// 	cmd *exec.Cmd
//
// 	Stdin  chan string
// 	Stdout chan string
// 	Stderr chan string
// }
//
// func (r RunCommand) Wait() error {
// 	if err := r.cmd.Start(); err != nil {
// 		return err
// 	}
// 	return r.cmd.Wait()
// }
//
// func run(args ...string) (RunCommand, error) {
// 	stdin := make(chan string)
// 	stdout, stderr := make(chan string), make(chan string)
//
// 	cmd := exec.Command(args[0], args[1:]...)
// 	stdinPipe, err := cmd.StdinPipe()
// 	if err != nil {
// 		return RunCommand{}, err
// 	}
// 	stdoutPipe, err := cmd.StdoutPipe()
// 	if err != nil {
// 		return RunCommand{}, err
// 	}
// 	stderrPipe, err := cmd.StderrPipe()
// 	if err != nil {
// 		return RunCommand{}, err
// 	}
//
// 	go func() {
// 		defer func() { stdinPipe.Close(); close(stdin) }()
// 		for msg := range stdin {
// 			fmt.Println("a")
// 			stdinPipe.Write([]byte(msg))
// 		}
// 	}()
//
// 	go func() {
// 		defer func() { stdoutPipe.Close(); close(stdout) }()
// 		scanner := bufio.NewScanner(stdoutPipe)
// 		for scanner.Scan() {
// 			msg := scanner.Text()
// 			stdout <- msg
// 		}
// 		if err := scanner.Err(); err != nil {
// 			panic(err)
// 		}
// 	}()
//
// 	go func() {
// 		defer func() { stderrPipe.Close(); close(stderr) }()
// 		scanner := bufio.NewScanner(stderrPipe)
// 		for scanner.Scan() {
// 			msg := scanner.Text()
// 			stderr <- msg
// 		}
// 		if err := scanner.Err(); err != nil {
// 			panic(err)
// 		}
// 	}()
//
// 	run := RunCommand{
// 		cmd:    cmd,
// 		Stdin:  stdin,
// 		Stdout: stdout,
// 		Stderr: stderr,
// 	}
// 	return run, nil
// }
//
// func main() {
// 	run, err := run("node", "pipes2.js")
// 	if err != nil {
// 		panic(err)
// 	}
//
// 	run.Stdin <- "Hello, world!"
//
// 	go func() {
// 		defer fmt.Println()
// 		for {
// 			select {
// 			case msg, ok := <-run.Stdout:
// 				if !ok {
// 					return
// 				}
// 				logStdout(msg)
// 			case msg, ok := <-run.Stderr:
// 				if !ok {
// 					return
// 				}
// 				logStderr(msg)
// 			}
// 		}
// 	}()
//
// 	if err := run.Wait(); err != nil {
// 		panic(err)
// 	}
// }
