package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/color"
)

func formatEsbuildMessagesAsTermString(msgs []api.Message) string {
	msg := msgs[0] // TODO

	gutter := len(strconv.Itoa(msg.Location.Line))
	gap := strings.Repeat(" ", msg.Location.Column)

	return fmt.Sprintf("%s:%d:%d: %s", msg.Location.File, msg.Location.Line, msg.Location.Column, msg.Text) + `

` + color.Boldf("%-*d | %s", gutter, msg.Location.Line+0, msg.Location.LineText) + `
` + fmt.Sprintf("%-*d | %s^", gutter, msg.Location.Line+1, gap) + `
` + fmt.Sprintf("%-*d | %s%s", gutter, msg.Location.Line+2, gap, msg.Text)
}

func formatEsbuildMessagesAsHTMLString(msgs []api.Message) string {
	msg := msgs[0] // TODO

	gutter := len(strconv.Itoa(msg.Location.Line))
	gap := strings.Repeat(" ", msg.Location.Column)

	return fmt.Sprintf("%s:%d:%d: %s", msg.Location.File, msg.Location.Line, msg.Location.Column, msg.Text) + `

` + fmt.Sprintf("<strong>%-*d | %s</strong>", gutter, msg.Location.Line+0, msg.Location.LineText) + `
` + fmt.Sprintf("%-*d | %s^", gutter, msg.Location.Line+1, gap) + `
` + fmt.Sprintf("%-*d | %s%s", gutter, msg.Location.Line+2, gap, msg.Text)
}

func esbuildMessagesAsHTMLDocument(msgs []api.Message) string {
	msg := msgs[0] // TODO
	cwd, _ := os.Getwd()

	return `<!DOCTYPE html>
<html>
	<head>
		<title>
			` + fmt.Sprintf("Error: %s", msg.Text) + `
		</title>
		<style>

a {
	color: unset;
	text-decoration: unset;
}

body {
	color: hsla(0, 0%, 0%, 0.95);
	background-color: #fff;
}

@media (prefers-color-scheme: dark) {
	body {
		color: hsla(0, 0%, 100%, 0.95);
		background-color: rgb(36, 36, 36);
	}
}

		</style>
	</head>
	<body>
		<a href="` + fmt.Sprintf("vscode://file%s/%s:%d:%d", cwd, msg.Location.File, msg.Location.Line, msg.Location.Column) + `">
			<pre><code>` + formatEsbuildMessagesAsHTMLString(msgs) + `</code></pre>
		</a>
		<script>
			const source = new EventSource("/sse")
			source.addEventListener("reload", e => {
				window.location.reload()
			})
			source.addEventListener("warning", e => {
				console.warn(JSON.parse(e.data))
			})
		</script>
	</body>
</html>
`
}
