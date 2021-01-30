package main

func (r Runtime) Build() {
	check(copyAssetDirectoryToBuildDirectory(r.Config))
	check(r.prerenderProps())
	check(r.prerenderApp())
	check(r.prerenderPages())
}
