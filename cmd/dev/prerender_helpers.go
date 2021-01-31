package dev

import "fmt"

func requires(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`const %s = require("%s")`,
			each.Component, "../"+each.SrcPath))
	}
	return arr
}

func exports(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`{ path: %q, exports: %s }`,
			each.Path, each.Component))
	}
	return arr
}
