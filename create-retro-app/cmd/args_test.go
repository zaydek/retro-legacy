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

func TestParseArgs(t *testing.T) {
	var cmd Command

	cmd = parseArgs(".")
	expect(t, cmd, Command{Template: "js", Directory: "."})

	cmd = parseArgs("--template=js", ".")
	expect(t, cmd, Command{Template: "js", Directory: "."})

	cmd = parseArgs("app-name")
	expect(t, cmd, Command{Template: "js", Directory: "app-name"})

	cmd = parseArgs("--template=js", "app-name")
	expect(t, cmd, Command{Template: "js", Directory: "app-name"})
}
