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
+-------------------------+
| RETRO_VERSION |  v0.0.1 |
| REACT_VERSION | v17.0.1 |
+-------------------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO_VERSION"), want: "v0.0.1"},
		{got: os.Getenv("REACT_VERSION"), want: "v17.0.1"},
	}
	for _, test := range tests {
		expect.DeepEqual(t, test.got, test.want)
	}
}

func TestLatest(t *testing.T) {
	text := `
+------------------------+
| RETRO_VERSION | latest |
| REACT_VERSION | latest |
+------------------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO_VERSION"), want: "latest"},
		{got: os.Getenv("REACT_VERSION"), want: "latest"},
	}
	for _, test := range tests {
		expect.DeepEqual(t, test.got, test.want)
	}
}
