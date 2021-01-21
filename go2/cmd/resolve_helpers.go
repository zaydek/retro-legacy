package main

import (
	"fmt"
	"strings"
)

func buildRequiresAndImports(retro Retro) (requires string, imports string) {
	// Build an array for require(x):
	for x, each := range retro.router {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requires += sep + fmt.Sprintf("const %s = require(\"../%s\")",
			each.Component, each.Path)
	}

	// Build an array for import { x as y } from "z":
	for x, each := range retro.router {
		var sep string
		if x > 0 {
			sep = ", "
		}
		imports += sep + fmt.Sprintf("{ name: %[1]q, imports: %[1]s }",
			each.Component)
	}
	imports = "[" + strings.Join(strings.Split(imports, "{ "), "\n\t\t{ ") + ",\n\t]"

	return requires, imports
}
