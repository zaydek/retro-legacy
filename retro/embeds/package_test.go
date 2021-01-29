package embeds

import (
	"bytes"
	"testing"
)

const want = `{
	"name": "hello-world",
	"scripts": {
		"watch": "retro-server watch",
		"build": "retro-server build",
		"serve": "retro-server serve"
	},
	"dependencies": {
		"react": "^1.33.7",
		"react-dom": "^1.33.7",
		"retro-client": "^1.33.7",
		"retro-server": "^1.33.7"
	}
}
`

func TestTemplate(t *testing.T) {
	dot := PackageDot{
		RepoName:           "hello-world",
		ReactVersion:       "^1.33.7",
		ReactDOMVersion:    "^1.33.7",
		RetroClientVersion: "^1.33.7",
		RetroServerVersion: "^1.33.7",
	}
	var buf bytes.Buffer
	if err := PackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got: %q want %q", got, want)
	}
}
