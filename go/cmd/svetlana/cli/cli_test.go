package cli

import (
	"testing"

	"github.com/zaydek/svetlana/pkg/expect"
)

func TestStart(t *testing.T) {
	var cmd StartCommand

	cmd = parseStartArguments()
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8000,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseStartArguments("--cached")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    true,
		Port:      8000,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseStartArguments("--port=8080")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8080,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseStartArguments("--prettier")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8000,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseStartArguments("--source-map")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    false,
		Port:      8000,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseStartArguments("--cached", "--port=8080", "--prettier", "source-map")
	expect.DeepEqual(t, cmd, StartCommand{
		Cached:    true,
		Port:      8080,
		Prettier:  true,
		SourceMap: true,
	})
}

func TestBuild(t *testing.T) {
	var cmd BuildCommand

	cmd = parseBuildArguments()
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    false,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--cached")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    true,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--prettier")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    false,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--source-map")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    false,
		Prettier:  true,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--cached", "--prettier", "--source-map")
	expect.DeepEqual(t, cmd, BuildCommand{
		Cached:    true,
		Prettier:  true,
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
