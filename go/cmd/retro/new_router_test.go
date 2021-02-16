package retro

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

var config = DirectoryConfiguration{
	AssetDirectory: "asset",
	PagesDirectory: "pages",
	CacheDirectory: "cache",
	BuildDirectory: "build",
}

func TestJavaScript(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "pages/index.js"), PageBasedRoute{
		SrcPath:   "pages/index.js",
		DstPath:   "build/index.html",
		Path:      "/",
		Component: "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/index.js"), PageBasedRoute{
		SrcPath:   "pages/path/index.js",
		DstPath:   "build/path/index.html",
		Path:      "/path/",
		Component: "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/to/index.js"), PageBasedRoute{
		SrcPath:   "pages/path/to/index.js",
		DstPath:   "build/path/to/index.html",
		Path:      "/path/to/",
		Component: "PagePathToIndex",
	})
}

func TestTypeScript(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "pages/index.ts"), PageBasedRoute{
		SrcPath:   "pages/index.ts",
		DstPath:   "build/index.html",
		Path:      "/",
		Component: "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/index.ts"), PageBasedRoute{
		SrcPath:   "pages/path/index.ts",
		DstPath:   "build/path/index.html",
		Path:      "/path/",
		Component: "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/to/index.ts"), PageBasedRoute{
		SrcPath:   "pages/path/to/index.ts",
		DstPath:   "build/path/to/index.html",
		Path:      "/path/to/",
		Component: "PagePathToIndex",
	})
}

func TestMarkdown(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "pages/index.md"), PageBasedRoute{
		SrcPath:   "pages/index.md",
		DstPath:   "build/index.html",
		Path:      "/",
		Component: "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/index.md"), PageBasedRoute{
		SrcPath:   "pages/path/index.md",
		DstPath:   "build/path/index.html",
		Path:      "/path/",
		Component: "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/to/index.md"), PageBasedRoute{
		SrcPath:   "pages/path/to/index.md",
		DstPath:   "build/path/to/index.html",
		Path:      "/path/to/",
		Component: "PagePathToIndex",
	})
}
