package main

import (
	"bytes"
	"os/exec"
)

func execcmd(cmdargs ...string) (stdout, stderr []byte, err error) {
	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer

	cmd := exec.Command(cmdargs[0], cmdargs[1:]...)
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	// NOTE: Use `buf.Len() > 0` to prevent `[]byte("")`.
	err = cmd.Run()
	if stdoutBuf.Len() > 0 {
		stdout = stdoutBuf.Bytes()
	}
	if stderrBuf.Len() > 0 {
		stderr = stderrBuf.Bytes()
	}

	return stdout, stderr, err
}
