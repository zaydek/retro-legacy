package cli

// import (
// 	"testing"
//
// 	"github.com/zaydek/retro/pkg/expect"
// )
//
// func TestDev(t *testing.T) {
// 	var cmd DevCommand
//
// 	cmd = parseDevArguments()
// 	expect.DeepEqual(t, cmd, DevCommand{
// 		Cached:    false,
// 		Sourcemap: true,
// 		Port:      8000,
// 	})
//
// 	cmd = parseDevArguments("--cache")
// 	expect.DeepEqual(t, cmd, DevCommand{
// 		Cached:    true,
// 		Sourcemap: true,
// 		Port:      8000,
// 	})
//
// 	cmd = parseDevArguments("--source-map")
// 	expect.DeepEqual(t, cmd, DevCommand{
// 		Cached:    false,
// 		Sourcemap: true,
// 		Port:      8000,
// 	})
//
// 	cmd = parseDevArguments("--port=8080")
// 	expect.DeepEqual(t, cmd, DevCommand{
// 		Cached:    false,
// 		Sourcemap: true,
// 		Port:      8080,
// 	})
//
// 	cmd = parseDevArguments("--cache", "--source-map", "--port=8080")
// 	expect.DeepEqual(t, cmd, DevCommand{
// 		Cached:    true,
// 		Sourcemap: true,
// 		Port:      8080,
// 	})
// }
//
// func TestExport(t *testing.T) {
// 	var cmd ExportCommand
//
// 	cmd = parseExportArguments()
// 	expect.DeepEqual(t, cmd, ExportCommand{
// 		Cached:    false,
// 		SourceMap: true,
// 	})
//
// 	cmd = parseExportArguments("--cache")
// 	expect.DeepEqual(t, cmd, ExportCommand{
// 		Cached:    true,
// 		SourceMap: true,
// 	})
//
// 	cmd = parseExportArguments("--source-map")
// 	expect.DeepEqual(t, cmd, ExportCommand{
// 		Cached:    false,
// 		SourceMap: true,
// 	})
//
// 	cmd = parseExportArguments("--cache", "--source-map")
// 	expect.DeepEqual(t, cmd, ExportCommand{
// 		Cached:    true,
// 		SourceMap: true,
// 	})
// }
//
// func TestServe(t *testing.T) {
// 	var cmd ServeCommand
//
// 	cmd = parseServeArguments()
// 	expect.DeepEqual(t, cmd, ServeCommand{Port: 8000})
//
// 	cmd = parseServeArguments("--port=8080")
// 	expect.DeepEqual(t, cmd, ServeCommand{Port: 8080})
// }
