package main

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	stderr.Fatalln(err)
}

func (r Retro) build() {
	// port := resolvePort() TODO

	var err error
	if r.Config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.Routes, err = loadRoutes(r.Config); err != nil {
		stderr.Fatalln(err)
	}

	must(prerenderPageProps(r))
	must(prerenderApp(r))
	must(prerenderPages(r))
}
