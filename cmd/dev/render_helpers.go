package dev

import "fmt"

type prerenderedPage struct {
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

func exports(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`{ srcPath: %q, dstPath: %q, path: %q, component: %[4]q, exports: %[4]s }`,
			each.SrcPath, each.DstPath, each.Path, each.Component))
	}
	return arr
}
