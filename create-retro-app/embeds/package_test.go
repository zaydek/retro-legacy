package embeds

import (
	"bytes"
	"testing"
)

const want = `{
	"name": "app-name",
	"scripts": {
		"watch": "retro watch",
		"build": "retro build",
		"serve": "retro serve"
	},
	"dependencies": {
		"@zaydek/retro-router": "^1.33.7",
		"react": "^1.33.7",
		"react-dom": "^1.33.7"
	},
	"devDependencies": {
		"@zaydek/retro": "^1.33.7"
	}
}
`

func TestTemplate(t *testing.T) {
	dot := PackageDot{
		AppName:            "app-name",
		RetroVersion:       "^1.33.7",
		RetroRouterVersion: "^1.33.7",
		ReactVersion:       "^1.33.7",
		ReactDOMVersion:    "^1.33.7",
	}
	var buf bytes.Buffer
	if err := PackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got: %q want %q", got, want)
	}
}
