package main

import (
	"bufio"
	"bytes"
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

var (
	dim      = terminal.New(terminal.DimCode).Sprint
	boldCyan = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldRed  = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
)

type Logger func(...interface{})

func newLoggers() (stdout, stderr Logger) {
	current := func() string {
		return time.Now().Format("Jan 02 15:04:05.000 PM")
	}
	stdout = func(args ...interface{}) {
		fmt.Fprintf(os.Stdout, "%s  %s ", dim(current()), boldCyan("stdout:"))
		fmt.Fprintln(os.Stderr, args...)
	}
	stderr = func(args ...interface{}) {
		fmt.Fprintf(os.Stdout, "%s  %s ", dim(current()), boldRed("stderr:"))
		fmt.Fprintln(os.Stderr, args...)
	}
	return stdout, stderr
}

var stdout, stderr = newLoggers()

func main() {
	cmd := exec.Command("node", "pipes2.js")

	var buf bytes.Buffer
	cmd.Stdin = &buf
	buf.Write([]byte("Hello, world!\n"))

	time.Sleep(1 * time.Second)
	buf.Write([]byte("Hello, world!\n"))

	stdoutPipe, err := cmd.StdoutPipe()
	must(err)

	stderrPipe, err := cmd.StderrPipe()
	must(err)

	go func() {
		defer stdoutPipe.Close()
		scanner := bufio.NewScanner(stdoutPipe)
		for scanner.Scan() {
			msg := scanner.Text()
			stdout(msg)
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	go func() {
		defer stderrPipe.Close()
		scanner := bufio.NewScanner(stderrPipe)
		for scanner.Scan() {
			msg := scanner.Text()
			stderr(msg)
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	err = cmd.Start()
	must(err)
	err = cmd.Wait()
	must(err)
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
