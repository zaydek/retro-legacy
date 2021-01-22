package main

// TODO: Copy r.Config.AssetDir to r.Config.BuildDir.
func (r Retro) build() {
	var err error
	if r.Config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.Routes, err = loadRoutes(r.Config); err != nil {
		stderr.Fatalln(err)
	}

	must(prerenderProps(r))
	must(prerenderApp(r))
	must(prerenderPages(r))
}
