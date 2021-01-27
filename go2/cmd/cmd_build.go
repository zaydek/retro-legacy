package main

func (r Runtime) Build() {
	must(copyAssetDirectoryToBuildDirectory(r.Config))
	must(r.prerenderProps())
	must(r.prerenderApp())
	must(r.prerenderPages())
}
