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

func TestCreate(t *testing.T) {
	var cmd CreateRetroApp

	cmd = parseCreateCommandArgs(".")
	expect(t, cmd, CreateRetroApp{Template: "js", Directory: "."})

	cmd = parseCreateCommandArgs("--template=js", ".")
	expect(t, cmd, CreateRetroApp{Template: "js", Directory: "."})

	cmd = parseCreateCommandArgs("retro-app")
	expect(t, cmd, CreateRetroApp{Template: "js", Directory: "retro-app"})

	cmd = parseCreateCommandArgs("--template=js", "retro-app")
	expect(t, cmd, CreateRetroApp{Template: "js", Directory: "retro-app"})
}
