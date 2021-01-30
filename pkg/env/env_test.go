package env

import (
	_ "embed"
	"os"
	"testing"
)

type Test struct{ got, want string }

func TestEmbed(t *testing.T) {
	//go:embed version_copy.txt
	var text string

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO_VERSION"), want: "v0.0.1"},
		{got: os.Getenv("RETRO_ROUTER_VERSION"), want: "v0.0.1"},
		{got: os.Getenv("REACT_VERSION"), want: "v17.0.1"},
		{got: os.Getenv("REACT_DOM_VERSION"), want: "v17.0.1"},
	}
	for _, test := range tests {
		if test.got != test.want {
			t.Fatalf("got %s want %s", test.got, test.want)
		}
	}
}

func Test17(t *testing.T) {
	text := `
+--------------------------------+
| RETRO_VERSION        |  v0.0.1 |
| RETRO_ROUTER_VERSION |  v0.0.1 |
| REACT_VERSION        | v17.0.1 |
| REACT_DOM_VERSION    | v17.0.1 |
+--------------------------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO_VERSION"), want: "v0.0.1"},
		{got: os.Getenv("RETRO_ROUTER_VERSION"), want: "v0.0.1"},
		{got: os.Getenv("REACT_VERSION"), want: "v17.0.1"},
		{got: os.Getenv("REACT_DOM_VERSION"), want: "v17.0.1"},
	}
	for _, test := range tests {
		if test.got != test.want {
			t.Fatalf("got %s want %s", test.got, test.want)
		}
	}
}

func TestLatest(t *testing.T) {
	text := `
+-------------------------------+
| RETRO_VERSION        | latest |
| RETRO_ROUTER_VERSION | latest |
| REACT_VERSION        | latest |
| REACT_DOM_VERSION    | latest |
+-------------------------------+
`

	SetEnvVars(text)

	tests := []Test{
		{got: os.Getenv("RETRO_VERSION"), want: "latest"},
		{got: os.Getenv("RETRO_ROUTER_VERSION"), want: "latest"},
		{got: os.Getenv("REACT_VERSION"), want: "latest"},
		{got: os.Getenv("REACT_DOM_VERSION"), want: "latest"},
	}
	for _, test := range tests {
		if test.got != test.want {
			t.Fatalf("got %s want %s", test.got, test.want)
		}
	}
}
