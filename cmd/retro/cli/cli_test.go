package cli

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestWatch(t *testing.T) {
	var cmd StartCommand

	cmd = parseStartArguments()
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8000,
		SourceMap: false,
	})

	cmd = parseStartArguments("--cached")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    true,
		Port:      8000,
		SourceMap: false,
	})

	cmd = parseStartArguments("--port=8080")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8080,
		SourceMap: false,
	})

	cmd = parseStartArguments("--source-map")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8000,
		SourceMap: true,
	})

	cmd = parseStartArguments("--cached", "--port=8080", "--source-map")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    true,
		Port:      8080,
		SourceMap: true,
	})
}

func TestBuild(t *testing.T) {
	var cmd BuildCommand

	cmd = parseBuildArguments()
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: false,
	})

	cmd = parseBuildArguments("--cached")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    true,
		SourceMap: false,
	})

	cmd = parseBuildArguments("--source-map")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--cached", "--source-map")
	expect.DeepEqual(t, cmd, BuildCommand{
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
