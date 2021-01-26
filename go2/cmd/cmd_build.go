package main

// if err := copyAssetDirectoryToBuildDirectory(r.Config); err != nil {
// 	loggers.Stderr.Println(errs.Walk(r.Config.AssetDirectory, err))
// 	os.Exit(1)
// }

func (r Runtime) Build() {
	must(copyAssetDirectoryToBuildDirectory(r.Config))
	must(r.prerenderPropsImpl())
	must(r.prerenderAppImpl())
	must(r.prerenderPagesImpl())
}
