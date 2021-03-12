package cli

type DevCmd struct {
	Cached      bool `json:"cached"`
	FastRefresh bool `json:"fast_refresh"`
	Port        int  `json:"port"`
	Sourcemap   bool `json:"sourcemap"`
}

type ExportCmd struct {
	Cached    bool `json:"cached"`
	Sourcemap bool `json:"sourcemap"`
}

type ServeCmd struct {
	Port int `json:"port"`
}
