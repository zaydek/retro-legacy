package stubs

import "regexp"

var retroCSSRe = regexp.MustCompile(`(` +
	`<link rel="stylesheet" href="%RETRO_CSS%"></link>` + `|` +
	`<link rel="stylesheet" href="%RETRO_CSS%" />` + `|` +
	`<link rel="stylesheet" href="%RETRO_CSS%"/>` + `|` +
	`<link rel="stylesheet" href="%RETRO_CSS%">` +
	`)`)

var retroAppRe = regexp.MustCompile(`(` +
	`<script src="%RETRO_APP%"></script>` + `|` +
	`<script src="%RETRO_APP%" />` + `|` +
	`<script src="%RETRO_APP%"/>` + `|` +
	`<script src="%RETRO_APP%">` +
	`)`)

// ReplaceRetroStubs replaces %RETRO_APP% and %RETRO_CSS% stubs.
func ReplaceRetroStubs(str string) string {
	str = retroCSSRe.ReplaceAllString(str, `<link rel="stylesheet" href="app.css">`)
	str = retroAppRe.ReplaceAllString(str, `<script src="app.js"></script>`)
	return str
}
