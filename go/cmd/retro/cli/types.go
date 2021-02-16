package cli

type DevCommand struct {
	Cached    bool `json:"cached"`
	Purged    bool `json:"purged"`
	Port      int  `json:"port"`
	SourceMap bool `json:"source_map"`
}

type ExportCommand struct {
	Cached    bool `json:"cached"`
	Purged    bool `json:"purged"`
	SourceMap bool `json:"source_map"`
}

type ServeCommand struct {
	Port int `json:"port"`
}
