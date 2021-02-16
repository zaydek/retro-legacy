package cli

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestDev(t *testing.T) {
	var cmd DevCommand

	cmd = parseDevArguments()
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: false,
		Purge: true,
		Port:  8000,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--cache")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: true,
		Purge: false,
		Port:  8000,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--purge")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: false,
		Purge: true,
		Port:  8000,
		// SourceMap: true,
	})

	// TODO: This should error.
	cmd = parseDevArguments("--cache", "--purge")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: true,
		Purge: true,
		Port:  8000,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--port=8080")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: false,
		Purge: true,
		Port:  8080,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: false,
		Purge: true,
		Port:  8000,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--cache", "--port=8080", "source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: true,
		Purge: false,
		Port:  8080,
		// SourceMap: true,
	})

	cmd = parseDevArguments("--purge", "--port=8080", "source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Cache: false,
		Purge: true,
		Port:  8080,
		// SourceMap: true,
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

	// TODO: This should error.
	cmd = parseExportArguments("--cache", "--purge")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     true,
		Purge:     true,
		SourceMap: true,
	})

	cmd = parseExportArguments("--source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     false,
		Purge:     true,
		SourceMap: true,
	})

	cmd = parseExportArguments("--cache", "--port=8080", "source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Cache:     true,
		Purge:     false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--purge", "--port=8080", "source-map")
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
