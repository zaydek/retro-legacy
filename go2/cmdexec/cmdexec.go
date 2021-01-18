package cmdexec

import (
	"bytes"
	"os/exec"
)

// Run runs a command and returns the []byte for stdout and stderr.
func Run(args ...string) (stdout, stderr []byte, err error) {
	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer

	cmd := exec.Command(args[0], args[1:]...)
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	// Use `buf.Len() > 0` to prevent `[]byte("")`.
	err = cmd.Run()
	if stdoutBuf.Len() > 0 {
		stdout = stdoutBuf.Bytes()
	}
	if stderrBuf.Len() > 0 {
		stderr = stderrBuf.Bytes()
	}

	return stdout, stderr, err
}
