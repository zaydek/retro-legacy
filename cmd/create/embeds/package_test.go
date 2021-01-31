package embeds

import (
	"bytes"
	"testing"
)

func TestJavaScriptTemplate(t *testing.T) {
	want := `{
	"name": "app-name",
	"scripts": {
		"watch": "retro watch",
		"build": "retro build",
		"serve": "retro serve"
	},
	"dependencies": {
		"@zaydek/retro": "^1.33.7",
		"@zaydek/retro-router": "^1.33.7",
		"react": "^1.33.7",
		"react-dom": "^1.33.7"
	}
}
`

	dot := PackageDot{
		AppName:      "app-name",
		RetroVersion: "^1.33.7",
		ReactVersion: "^1.33.7",
	}
	var buf bytes.Buffer
	if err := JavaScriptPackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got: %q want %q", got, want)
	}
}

func TestTypeScriptTemplate(t *testing.T) {
	want := `{
	"name": "app-name",
	"scripts": {
		"watch": "retro watch",
		"build": "retro build",
		"serve": "retro serve"
	},
	"dependencies": {
		"@zaydek/retro": "^1.33.7",
		"@zaydek/retro-router": "^1.33.7",
		"react": "^1.33.7",
		"react-dom": "^1.33.7"
	},
	"devDependencies": {
		"@types/react": "^1.33.7",
		"@types/react-dom": "^1.33.7"
	}
}
`

	dot := PackageDot{
		AppName:           "app-name",
		RetroVersion:      "^1.33.7",
		ReactVersion:      "^1.33.7",
		TypesReactVersion: "^1.33.7",
	}
	var buf bytes.Buffer
	if err := TypeScriptPackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got: %q want %q", got, want)
	}
}
