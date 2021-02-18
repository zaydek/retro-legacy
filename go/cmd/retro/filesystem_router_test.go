package retro

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

var config = DirectoryConfiguration{
	PublicDir: "public",
	PagesDir:  "src/pages",
	CacheDir:  "__cache__",
	ExportDir: "__export__",
}

func TestSvelte(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "src/pages/index.js"), FilesystemRoute{
		InputPath:  "src/pages/index.js",
		OutputPath: "__export__/index.html",
		Path:       "/",
		Component:  "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "src/pages/path/index.js"), FilesystemRoute{
		InputPath:  "src/pages/path/index.js",
		OutputPath: "__export__/path/index.html",
		Path:       "/path/",
		Component:  "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "src/pages/path/to/index.js"), FilesystemRoute{
		InputPath:  "pages/path/to/index.js",
		OutputPath: "__export__/path/to/index.html",
		Path:       "/path/to/",
		Component:  "PagePathToIndex",
	})
}
