package run

import (
	"bytes"
	"errors"
	"os/exec"
)

func Cmd(arguments ...string) (stdout []byte, err error) {
	cmd := exec.Command(arguments[0], arguments[1:]...)

	var stdout_ bytes.Buffer
	cmd.Stdout = &stdout_

	var stderr_ bytes.Buffer
	cmd.Stderr = &stderr_

	if err := cmd.Run(); stderr_.Len() > 0 {
		// return nil, fmt.Errorf("stderr: %s", stderr_.String())
		return nil, errors.New(stderr_.String())
	} else if err != nil {
		return nil, err
	}
	return stdout_.Bytes(), nil
}
