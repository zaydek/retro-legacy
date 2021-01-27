package main

import (
	"bytes"
	"errors"
	"os/exec"

	"github.com/zaydek/retro/errs"
)

func runNode(stdin []byte) (bytes.Buffer, error) {
	var (
		stdoutBuf bytes.Buffer
		stderrBuf bytes.Buffer
	)

	cmd := exec.Command("node")
	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return bytes.Buffer{}, errs.RunNode(err)
	}

	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	go func() {
		defer stdinPipe.Close()
		stdinPipe.Write(stdin)
	}()

	if err := cmd.Run(); err != nil {
		return bytes.Buffer{}, errs.RunNode(err)
	} else if stderr := stderrBuf.String(); stderr != "" {
		return bytes.Buffer{}, errs.RunNode(errors.New(stderr))
	}
	return stdoutBuf, nil
}
