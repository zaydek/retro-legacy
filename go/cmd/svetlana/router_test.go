package svetlana

import (
	"testing"

	"github.com/zaydek/svetlana/pkg/expect"
)

var config = DirectoryConfiguration{
	AssetDirectory: "public",
	PagesDirectory: "pages",
	CacheDirectory: "__cache__",
	BuildDirectory: "build",
}

func TestSvelte(t *testing.T) {
	expect.DeepEqual(t, newPageBasedRoute(config, "pages/index.svelte"), PageBasedRoute{
		SrcPath:   "pages/index.svelte",
		DstPath:   "build/index.html",
		Path:      "/",
		Component: "PageIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/index.svelte"), PageBasedRoute{
		SrcPath:   "pages/path/index.svelte",
		DstPath:   "build/path/index.html",
		Path:      "/path/",
		Component: "PagePathIndex",
	})

	expect.DeepEqual(t, newPageBasedRoute(config, "pages/path/to/index.svelte"), PageBasedRoute{
		SrcPath:   "pages/path/to/index.svelte",
		DstPath:   "build/path/to/index.html",
		Path:      "/path/to/",
		Component: "PagePathToIndex",
	})
}
