package cli

type DevCommand struct {
	Cached    bool `json:"cached"`
	SourceMap bool `json:"source_map"`
	Port      int  `json:"port"`
}

type ExportCommand struct {
	Cached    bool `json:"cached"`
	SourceMap bool `json:"source_map"`
}

type ServeCommand struct {
	Port int `json:"port"`
}
