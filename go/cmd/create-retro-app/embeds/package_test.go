package embeds

import (
	"bytes"
	"testing"
)

func TestJavaScriptTemplate(t *testing.T) {
	want := `{
	"name": "app-name",
	"scripts": {
		"dev": "retro dev",
		"export": "retro export",
		"serve": "retro serve"
	},
	"dependencies": {
		"@zaydek/retro": "^1.33.7",
		"react": "^17.0.1",
		"react-dom": "^17.0.1"
	}
}
`

	dot := PackageDot{
		APP_NAME:      "app-name",
		RETRO_VERSION: "1.33.7",
	}
	var buf bytes.Buffer
	if err := JavaScriptPackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestTypeScriptTemplate(t *testing.T) {
	want := `{
	"name": "app-name",
	"scripts": {
		"dev": "retro dev",
		"export": "retro export",
		"serve": "retro serve"
	},
	"dependencies": {
		"@zaydek/retro": "^1.33.7",
		"react": "^17.0.1",
		"react-dom": "^17.0.1"
	},
	"devDependencies": {
		"@types/react": "^17.0.0",
		"@types/react-dom": "^17.0.0"
	}
}
`

	dot := PackageDot{
		APP_NAME:      "app-name",
		RETRO_VERSION: "1.33.7",
	}
	var buf bytes.Buffer
	if err := TypeScriptPackageTemplate.Execute(&buf, dot); err != nil {
		t.Fatal(err)
	}
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}
