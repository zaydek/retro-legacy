package stubs

import "testing"

func TestApp(t *testing.T) {
	testStrs := []string{
		`<script src="%RETRO_APP%"></script>`,
		`<script src="%RETRO_APP%" />`,
		`<script src="%RETRO_APP%"/>`,
		`<script src="%RETRO_APP%">`,
	}
	for _, testStr := range testStrs {
		got := ReplaceRetroStubs(testStr)
		if got != `<script src="app.js"></script>` {
			t.Fatal("bad replacement")
		}
	}
}

func TestCSS(t *testing.T) {
	testStrs := []string{
		`<link rel="stylesheet" href="%RETRO_CSS%"></link>`,
		`<link rel="stylesheet" href="%RETRO_CSS%" />`,
		`<link rel="stylesheet" href="%RETRO_CSS%"/>`,
		`<link rel="stylesheet" href="%RETRO_CSS%">`,
	}
	for _, testStr := range testStrs {
		got := ReplaceRetroStubs(testStr)
		if got != `<link rel="stylesheet" href="app.css">` {
			t.Fatal("bad replacement")
		}
	}
}
