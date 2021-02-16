package env

import (
	_ "embed"
	"os"
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

type Test struct {
	got  string
	want string
}

func TestVersion(t *testing.T) {
	text := `
+-----------------+
| RETRO |  v0.0.1 |
| REACT | v17.0.1 |
+-----------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO"), want: "v0.0.1"},
		{got: os.Getenv("REACT"), want: "v17.0.1"},
	}
	for _, test := range tests {
		expect.DeepEqual(t, test.got, test.want)
	}
}

func TestLatest(t *testing.T) {
	text := `
+----------------+
| RETRO | latest |
| REACT | latest |
+----------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO"), want: "latest"},
		{got: os.Getenv("REACT"), want: "latest"},
	}
	for _, test := range tests {
		expect.DeepEqual(t, test.got, test.want)
	}
}
