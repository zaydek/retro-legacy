package main

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/color"
)

func FormatTerminalString(msgs []api.Message) string {
	msg := msgs[0] // TODO
	// cwd, _ := os.Getwd()

	return fmt.Sprintf("%s:%d:%d: %s", msg.Location.File, msg.Location.Line, msg.Location.Column, msg.Text) + `

` + color.Boldf("%-*d | %s", len(strconv.Itoa(msg.Location.Line)), msg.Location.Line+0, msg.Location.LineText) + `
` + fmt.Sprintf("%-*d | %s^", len(strconv.Itoa(msg.Location.Line)), msg.Location.Line+1, strings.Repeat(" ", msg.Location.Column)) + `
` + fmt.Sprintf("%-*d | %s%s", len(strconv.Itoa(msg.Location.Line)), msg.Location.Line+2, strings.Repeat(" ", msg.Location.Column), color.BoldRed(msg.Text)) + `
`
}
