package run

import (
	"bytes"
	"fmt"
	"os/exec"
)

func Cmd(stdin []byte, arguments ...string) (stdoutBytes []byte, err error) {
	// Create a new command:
	cmd := exec.Command(arguments[0], arguments[1:]...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}

	// Pipe stdin:
	if stdin != nil {
		go func() {
			defer stdinPipe.Close()
			stdinPipe.Write(stdin)
		}()
	}

	// Connect stdout and stderr:
	var stdout bytes.Buffer
	cmd.Stdout = &stdout

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	// Run the command:
	if err := cmd.Run(); stderr.Len() > 0 {
		return nil, fmt.Errorf("stderr: %s", stderr.String())
	} else if err != nil {
		return nil, err
	}
	return stdout.Bytes(), nil
}
