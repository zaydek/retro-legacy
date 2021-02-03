package loggers

import (
	"os"
	"testing"

	"github.com/zaydek/retro/pkg/expect"
	"github.com/zaydek/retro/pkg/term"
)

func TestTransformers(t *testing.T) {
	var out string

	out = transformOK("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldGreen("ok:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)

	out = transformWarning("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldYellow("warning:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)

	out = transformError("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldRed("error:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)
}

func TestTransformersAndStackTrace(t *testing.T) {
	os.Setenv("DEBUG_MODE", "true")

	var out string

	out = transformOK("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldGreen("ok:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)

	out = transformWarning("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldYellow("warning:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)

	out = transformError("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldRed("error:")+` `+term.Bold("Description")+`

    `+term.Bold("- List item")+`
    `+term.Bold("- List item")+`
`)
}
