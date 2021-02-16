package cli

type StartCommand struct {
	Cached    bool `json:"cached"`
	Port      int  `json:"port"`
	Prettier  bool `json:"prettier"`
	SourceMap bool `json:"source_map"`
}

type BuildCommand struct {
	Cached    bool `json:"cached"`
	Prettier  bool `json:"prettier"`
	SourceMap bool `json:"source_map"`
}

type ServeCommand struct {
	Port int `json:"port"`
}
