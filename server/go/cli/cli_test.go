package cli

import (
	"reflect"
	"testing"
	"time"
)

func expect(t *testing.T, x, y interface{}) {
	if reflect.DeepEqual(x, y) {
		// No-op
		return
	}
	t.Fatalf("got %+v want %+v", x, y)
}

func TestCreate(t *testing.T) {
	var cmd CreateCommand

	cmd = parseCreateCommandArgs(".")
	expect(t, cmd, CreateCommand{Template: "js", Directory: "."})

	cmd = parseCreateCommandArgs("--template=js", ".")
	expect(t, cmd, CreateCommand{Template: "js", Directory: "."})

	cmd = parseCreateCommandArgs("retro-app")
	expect(t, cmd, CreateCommand{Template: "js", Directory: "retro-app"})

	cmd = parseCreateCommandArgs("--template=js", "retro-app")
	expect(t, cmd, CreateCommand{Template: "js", Directory: "retro-app"})
}

func TestWatch(t *testing.T) {
	var cmd WatchCommand

	cmd = parseWatchCommandArgs()
	expect(t, cmd, WatchCommand{
		Cached:      false,
		Poll:        250 * time.Millisecond,
		Port:        8000,
		SourceMap:   false,
		Directories: []string{"pages"},
	})

	cmd = parseWatchCommandArgs("src", "components", "pages")
	expect(t, cmd, WatchCommand{
		Cached:      false,
		Poll:        250 * time.Millisecond,
		Port:        8000,
		SourceMap:   false,
		Directories: []string{"src", "components", "pages"},
	})

	cmd = parseWatchCommandArgs("--cached")
	expect(t, cmd, WatchCommand{
		Cached:      true,
		Poll:        250 * time.Millisecond,
		Port:        8000,
		SourceMap:   false,
		Directories: []string{"pages"},
	})

	cmd = parseWatchCommandArgs("--poll=500ms")
	expect(t, cmd, WatchCommand{
		Cached:      false,
		Poll:        500 * time.Millisecond,
		Port:        8000,
		SourceMap:   false,
		Directories: []string{"pages"},
	})

	cmd = parseWatchCommandArgs("--port=8080")
	expect(t, cmd, WatchCommand{
		Cached:      false,
		Poll:        250 * time.Millisecond,
		Port:        8080,
		SourceMap:   false,
		Directories: []string{"pages"},
	})

	cmd = parseWatchCommandArgs("--source-map")
	expect(t, cmd, WatchCommand{
		Cached:      false,
		Poll:        250 * time.Millisecond,
		Port:        8000,
		SourceMap:   true,
		Directories: []string{"pages"},
	})

	cmd = parseWatchCommandArgs("--cached", "--poll=500ms", "--port=8080", "--source-map", "src", "components", "pages")
	expect(t, cmd, WatchCommand{
		Cached:      true,
		Poll:        500 * time.Millisecond,
		Port:        8080,
		SourceMap:   true,
		Directories: []string{"src", "components", "pages"},
	})
}

func TestBuild(t *testing.T) {
	var cmd BuildCommand

	cmd = parseBuildCommandArgs()
	expect(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: false,
	})

	cmd = parseBuildCommandArgs("--cached")
	expect(t, cmd, BuildCommand{
		Cached:    true,
		SourceMap: false,
	})

	cmd = parseBuildCommandArgs("--source-map")
	expect(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseBuildCommandArgs("--cached", "--source-map")
	expect(t, cmd, BuildCommand{
		Cached:    true,
		SourceMap: true,
	})
}

func TestServe(t *testing.T) {
	var cmd ServeCommand

	cmd = parseServeCommandArgs()
	expect(t, cmd, ServeCommand{Port: 8000})

	cmd = parseServeCommandArgs("--port=8080")
	expect(t, cmd, ServeCommand{Port: 8080})
}
