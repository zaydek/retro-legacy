package dev

import "fmt"

type rendererdPage struct {
	PageBasedRoute

	Head string `json:"head"`
	Page string `json:"page"`
}

func requires(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`const %s = require("%s")`,
			each.Component, "../"+each.SrcPath))
	}
	return arr
}

func export(route PageBasedRoute) string {
	return fmt.Sprintf(`{ srcPath: %q, dstPath: %q, path: %q, component: %[4]q, exports: %[4]s }`,
		route.SrcPath, route.DstPath, route.Path, route.Component)
}

func exports(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, export(each))
	}
	return arr
}
