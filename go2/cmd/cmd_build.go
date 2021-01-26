package main

func (r Runtime) Build() {
	must(copyAssetDirectoryToBuildDirectory(r.Config))
	must(r.prerenderPropsImpl())
	must(r.prerenderAppImpl())
	must(r.prerenderPagesImpl())
}
