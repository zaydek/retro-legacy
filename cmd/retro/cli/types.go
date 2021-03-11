package cli

type DevCommand struct {
	Cached      bool `json:"cached"`
	FastRefresh bool `json:"fast_refresh"`
	Port        int  `json:"port"`
	Sourcemap   bool `json:"sourcemap"`
}

type ExportCommand struct {
	Cached    bool `json:"cached"`
	Sourcemap bool `json:"sourcemap"`
}

type ServeCommand struct {
	Port int `json:"port"`
}
