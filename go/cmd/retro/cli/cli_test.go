package cli

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestDev(t *testing.T) {
	var cmd DevCommand

	cmd = parseDevArguments()
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
		Port:      8000,
	})

	cmd = parseDevArguments("--cache")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     true,
		Purge:     false,
		SourceMap: true,
		Port:      8000,
	})

	cmd = parseDevArguments("--purge")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
		Port:      8000,
	})

	// // This should error.
	// cmd = parseDevArguments("--cache", "--purge")
	// expect.DeepEqual(t, cmd, DevCommand{
	// 	Cache: true,
	// 	Purge: true,
	// 	SourceMap: true,
	// 	Port:  8000,
	// })

	cmd = parseDevArguments("--source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
		Port:      8000,
	})

	cmd = parseDevArguments("--port=8080")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
		Port:      8080,
	})

	cmd = parseDevArguments("--cache", "--source-map", "--port=8080")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     true,
		Purge:     false,
		SourceMap: true,
		Port:      8080,
	})

	cmd = parseDevArguments("--purge", "--source-map", "--port=8080")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
		Port:      8080,
	})
}

func TestExport(t *testing.T) {
	var cmd ExportCommand

	cmd = parseExportArguments()
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
	})

	cmd = parseExportArguments("--cache")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     true,
		Purge:     false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--purge")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
	})

	// // This should error.
	// cmd = parseExportArguments("--cache", "--purge")
	// expect.DeepEqual(t, cmd, ExportCommand{
	// 	Cache:     true,
	// 	Purge:     true,
	// 	SourceMap: true,
	// })

	cmd = parseExportArguments("--source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
	})

	cmd = parseExportArguments("--cache", "--source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     true,
		Purge:     false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--purge", "source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
	})
}

func TestServe(t *testing.T) {
	var cmd ServeCommand

	cmd = parseServeArguments()
	expect.DeepEqual(t, cmd, ServeCommand{Port: 8000})

	cmd = parseServeArguments("--port=8080")
	expect.DeepEqual(t, cmd, ServeCommand{Port: 8080})
}
