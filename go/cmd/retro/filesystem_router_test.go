package retro

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

var config = DirectoryConfiguration{
	PublicDir: "public",
	PagesDir:  "pages",
	CacheDir:  "__cache__",
	ExportDir: "__export__",
}

func TestSvelte(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "pages/index.js"), FilesystemRoute{
		InputPath:  "pages/index.js",
		OutputPath: "build/index.html",
		Path:       "/",
		Component:  "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/index.js"), FilesystemRoute{
		InputPath:  "pages/path/index.js",
		OutputPath: "build/path/index.html",
		Path:       "/path/",
		Component:  "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/to/index.js"), FilesystemRoute{
		InputPath:  "pages/path/to/index.js",
		OutputPath: "build/path/to/index.html",
		Path:       "/path/to/",
		Component:  "PagePathToIndex",
	})
}
