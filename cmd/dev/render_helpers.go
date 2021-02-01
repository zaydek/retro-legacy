package dev

import "fmt"

// TODO
type prerenderedPage struct {
	SrcPath string `json:"srcPath"`
	DstPath string `json:"dstPath"`
	Path    string `json:"path"`

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
		arr = append(arr, fmt.Sprintf(`{ srcPath: %q, dstPath: %q, path: %q, exports: %s }`,
			each.SrcPath, each.DstPath, each.Path, each.Component))
	}
	return arr
}
