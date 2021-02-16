package cli

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestDev(t *testing.T) {
	var cmd DevCommand

	cmd = parseDevArguments()
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    false,
		Cached:    false,
		Port:      8000,
		SourceMap: true,
	})

	cmd = parseDevArguments("--cached")
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    true,
		Cached:    true,
		Port:      8000,
		SourceMap: true,
	})

	cmd = parseDevArguments("--port=8080")
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    false,
		Cached:    false,
		Port:      8080,
		SourceMap: true,
	})

	cmd = parseDevArguments("--prettier")
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    false,
		Cached:    false,
		Port:      8000,
		SourceMap: true,
	})

	cmd = parseDevArguments("--source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    false,
		Cached:    false,
		Port:      8000,
		SourceMap: true,
	})

	cmd = parseDevArguments("--cached", "--port=8080", "--prettier", "source-map")
	expect.DeepEqual(t, cmd, DevCommand{
		Purged:    true,
		Cached:    true,
		Port:      8080,
		SourceMap: true,
	})
}

func TestExport(t *testing.T) {
	var cmd ExportCommand

	cmd = parseExportArguments()
	expect.DeepEqual(t, cmd, ExportCommand{
		Purged:    false,
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--cached")
	expect.DeepEqual(t, cmd, ExportCommand{
		Purged:    true,
		Cached:    true,
		SourceMap: true,
	})

	cmd = parseExportArguments("--prettier")
	expect.DeepEqual(t, cmd, ExportCommand{
		Purged:    false,
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Purged:    false,
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseExportArguments("--cached", "--prettier", "--source-map")
	expect.DeepEqual(t, cmd, ExportCommand{
		Purged:    true,
		Cached:    true,
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
