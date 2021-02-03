package loggers

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
	"github.com/zaydek/retro/pkg/term"
)

func TestTransformers(t *testing.T) {
	var out string

	out = transformOK("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldGreen("ok:")+` Description

    - List item
    - List item
`)

	out = transformWarning("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldYellow("warning:")+` Description

    - List item
    - List item
`)

	out = transformError("Description\n\n- List item\n- List item")
	expect.DeepEqual(t, out, `
  `+term.BoldRed("error:")+` Description

    - List item
    - List item
`)
}
