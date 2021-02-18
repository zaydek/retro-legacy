package run

import (
	"bytes"
	"errors"
	"os/exec"
)

// func Cmd(stdin []byte, arguments ...string) (stdout []byte, err error) {
func Cmd(arguments ...string) (stdout []byte, err error) {
	cmd := exec.Command(arguments[0], arguments[1:]...)
	// pipe, err := cmd.StdinPipe()
	// if err != nil {
	// 	return nil, err
	// }

	var stdout_ bytes.Buffer
	cmd.Stdout = &stdout_

	var stderr_ bytes.Buffer
	cmd.Stderr = &stderr_

	// if stdin != nil {
	// 	go func() {
	// 		defer pipe.Close()
	// 		pipe.Write(stdin)
	// 	}()
	// }

	if err := cmd.Run(); stderr_.Len() > 0 {
		// return nil, fmt.Errorf("stderr: %s", stderr_.String())
		return nil, errors.New(stderr_.String())
	} else if err != nil {
		return nil, err
	}
	return stdout_.Bytes(), nil
}
