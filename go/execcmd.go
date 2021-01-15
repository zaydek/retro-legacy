package main

import (
	"bytes"
	"os/exec"
)

func execcmd(cmdargs ...string) (stdout, stderr string, err error) {
	cmd := exec.Command(cmdargs[0], cmdargs[1:]...)

	// Connect stdout and stderr to buffers:
	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	// Run the command and read from the buffers:
	err = cmd.Run()
	stdout = stdoutBuf.String()
	stderr = stderrBuf.String()
	return stdout, stderr, err
}
