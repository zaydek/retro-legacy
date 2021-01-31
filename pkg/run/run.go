package run

import (
	"bytes"
	"fmt"
	"os/exec"
)

func Cmd(arguments ...string) (stdout []byte, err error) {
	var (
		stdoutBuf bytes.Buffer
		stderrBuf bytes.Buffer
	)

	cmd := exec.Command(arguments[0], arguments[1:]...)
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	if err := cmd.Run(); err != nil {
		return nil, err
	} else if stderr := stderrBuf.String(); stderr != "" {
		return nil, fmt.Errorf("stderr: %s", stderrBuf.String())
	}
	return stdoutBuf.Bytes(), nil
}
