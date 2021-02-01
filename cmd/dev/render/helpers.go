package render

import (
	"fmt"

	"github.com/zaydek/retro/cmd/dev"
)

func requires(routes []dev.PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`const %s = require("%s")`,
			each.Component, "../"+each.SrcPath))
	}
	return arr
}

func exports(routes []dev.PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`{ srcPath: %q, dstPath: %q, path: %q, exports: %s }`,
			each.SrcPath, each.DstPath, each.Path, each.Component))
	}
	return arr
}
