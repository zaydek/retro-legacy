package retro

type Cmd uint8

const (
	CmdDev Cmd = iota
	CmdExport
	CmdServe
)

type DirectoryConfiguration struct {
	AssetDirectory string `json:"asset_dir"`
	PagesDirectory string `json:"pages_dir"`
	CacheDirectory string `json:"cache_dir"`
	BuildDirectory string `json:"build_dir"`
}

type PageBasedRoute struct {
	SrcPath   string `json:"src_path"`  // pages/path/to/component.js
	DstPath   string `json:"dst_path"`  // build/path/to/component.html
	Path      string `json:"path"`      // path/to/component
	Component string `json:"component"` // Component
}

type Runtime struct {
	Command          interface{}            `json:"command"`
	DirConfiguration DirectoryConfiguration `json:"dir_config"`
	BasePage         string                 `json:"base_page"`
	PageBasedRouter  []PageBasedRoute       `json:"page_based_router"`
}
