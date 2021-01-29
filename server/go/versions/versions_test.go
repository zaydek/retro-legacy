package versions

import (
	_ "embed"

	"os"
	"testing"
)

type TestStruct struct {
	Pkg string
	V   string
}

func TestEmbed(t *testing.T) {
	//go:embed versions.txt
	var text string
	SetPackageVars(text)

	tests := []TestStruct{
		{Pkg: "REACT_VERSION", V: "v17.0.1"},
		{Pkg: "REACT_DOM_VERSION", V: "v17.0.1"},
		{Pkg: "RETRO_CLIENT_VERSION", V: "v0.1.0"},
		{Pkg: "RETRO_SERVER_VERSION", V: "v0.1.0"},
	}
	for _, test := range tests {
		if got := os.Getenv(test.Pkg); got != test.V {
			t.Fatalf("got %s want %s", got, test.V)
		}
	}
}

func Test17(t *testing.T) {
	text := `
+--------------------------------+
| REACT_VERSION        | v17.0.1 |
| REACT_DOM_VERSION    | v17.0.1 |
| RETRO_CLIENT_VERSION | v0.1.0  |
| RETRO_SERVER_VERSION | v0.1.0  |
+--------------------------------+
`

	SetPackageVars(text)

	tests := []TestStruct{
		{Pkg: "REACT_VERSION", V: "v17.0.1"},
		{Pkg: "REACT_DOM_VERSION", V: "v17.0.1"},
		{Pkg: "RETRO_CLIENT_VERSION", V: "v0.1.0"},
		{Pkg: "RETRO_SERVER_VERSION", V: "v0.1.0"},
	}
	for _, test := range tests {
		if got := os.Getenv(test.Pkg); got != test.V {
			t.Fatalf("got %s want %s", got, test.V)
		}
	}
}

func TestLatest(t *testing.T) {
	text := `
+-------------------------------+
| REACT_VERSION        | latest |
| REACT_DOM_VERSION    | latest |
| RETRO_CLIENT_VERSION | latest |
| RETRO_SERVER_VERSION | latest |
+-------------------------------+
`

	SetPackageVars(text)

	tests := []TestStruct{
		{Pkg: "REACT_VERSION", V: "latest"},
		{Pkg: "REACT_DOM_VERSION", V: "latest"},
		{Pkg: "RETRO_CLIENT_VERSION", V: "latest"},
		{Pkg: "RETRO_SERVER_VERSION", V: "latest"},
	}
	for _, test := range tests {
		if got := os.Getenv(test.Pkg); got != test.V {
			t.Fatalf("got %s want %s", got, test.V)
		}
	}
}
