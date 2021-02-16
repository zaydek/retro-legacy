package cli

type DevCommand struct {
	Cache     bool `json:"cache"`
	Purge     bool `json:"purge"`
	SourceMap bool `json:"source_map"`
	Port      int  `json:"port"`
}

type ExportCommand struct {
	Cache     bool `json:"cache"`
	Purge     bool `json:"purge"`
	SourceMap bool `json:"source_map"`
}

type ServeCommand struct {
	Port int `json:"port"`
}
