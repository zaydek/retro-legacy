package main

import (
	"bytes"
	"os/exec"
)

func execcmd(cmdargs ...string) (stdout, stderr string, err error) {
	cmd := exec.Command(cmdargs[0], cmdargs[1:]...)

	// Prepare stdout and stderr:
	var stdoutBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf

	// Run the command:
	err = cmd.Run()
	stdout = stdoutBuf.String()
	stderr = stderrBuf.String()
	return stdout, stderr, err
}
