package retro

type CmdType uint8

const (
	CmdDev CmdType = iota
	CmdExport
	CmdServe
)

type DirectoryConfiguration struct {
	PublicDir string `json:"publicDir"` // e.g. "public"
	PagesDir  string `json:"pagesDir"`  // e.g. "src/pages"
	CacheDir  string `json:"cacheDir"`  // e.g. "__cache__"
	ExportDir string `json:"exportDir"` // e.g. "__export__"
}

// TODO: Expand FilesystemRoute to support <Layout> components and CSS assets.
// TODO: Add support for dynamic routes.
type FilesystemRoute struct {
	InputPath  string `json:"inputPath"`  // e.g. "src/pages/index.js"
	OutputPath string `json:"outputPath"` // e.g. "__export__/index.html"
	Path       string `json:"path"`       // e.g. "/"
	Component  string `json:"component"`  // e.g. "PageComponent"
}

type Runtime struct {
	Command                interface{}            `json:"command"`
	DirectoryConfiguration DirectoryConfiguration `json:"directoryConfiguration"`
	FilesystemRouter       []FilesystemRoute      `json:"filesystemRouter"`
	BaseHTML               string                 `json:"baseHTML"`
}
