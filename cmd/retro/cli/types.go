package cli

type DevCmd struct {
	Cached      bool
	FastRefresh bool
	Port        int
	Sourcemap   bool
}

type ExportCmd struct {
	Cached    bool
	Sourcemap bool
}

type ServeCmd struct {
	Port int
}
