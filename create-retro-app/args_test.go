package main

import (
	"reflect"
	"testing"
)

func expect(t *testing.T, x, y interface{}) {
	if reflect.DeepEqual(x, y) {
		// No-op
		return
	}
	t.Fatalf("got %+v want %+v", x, y)
}

func TestParseArguments(t *testing.T) {
	var cmd Command

	cmd = parseArguments(".")
	expect(t, cmd, Command{Template: "javascript", Directory: "."})

	cmd = parseArguments("--template=javascript", ".")
	expect(t, cmd, Command{Template: "javascript", Directory: "."})

	cmd = parseArguments("--template=typescript", ".")
	expect(t, cmd, Command{Template: "typescript", Directory: "."})

	cmd = parseArguments("app-name")
	expect(t, cmd, Command{Template: "javascript", Directory: "app-name"})

	cmd = parseArguments("--template=javascript", "app-name")
	expect(t, cmd, Command{Template: "javascript", Directory: "app-name"})

	cmd = parseArguments("--template=typescript", "app-name")
	expect(t, cmd, Command{Template: "typescript", Directory: "app-name"})
}
