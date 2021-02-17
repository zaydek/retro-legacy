package retro

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

var config = DirectoryConfiguration{
	AssetDirectory: "public",
	PagesDirectory: "pages",
	CacheDirectory: "__cache__",
	BuildDirectory: "build",
}

func TestSvelte(t *testing.T) {
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
