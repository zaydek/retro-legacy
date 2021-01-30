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

// func TestCreate(t *testing.T) {
// 	var cmd CreateCommand
//
// 	cmd = parseCreateCommandArgs(".")
// 	expect(t, cmd, CreateCommand{Template: "js", Directory: "."})
//
// 	cmd = parseCreateCommandArgs("--template=js", ".")
// 	expect(t, cmd, CreateCommand{Template: "js", Directory: "."})
//
// 	cmd = parseCreateCommandArgs("retro-app")
// 	expect(t, cmd, CreateCommand{Template: "js", Directory: "retro-app"})
//
// 	cmd = parseCreateCommandArgs("--template=js", "retro-app")
// 	expect(t, cmd, CreateCommand{Template: "js", Directory: "retro-app"})
// }

func TestWatch(t *testing.T) {
	var cmd WatchCommand

	cmd = parseWatchArguments()
	expect(t, cmd, WatchCommand{
		Cached:    false,
		Poll:      250 * time.Millisecond,
		Port:      8000,
		SourceMap: false,
		Paths:     []string{"pages"},
	})

	cmd = parseWatchArguments("src", "components", "pages")
	expect(t, cmd, WatchCommand{
		Cached:    false,
		Poll:      250 * time.Millisecond,
		Port:      8000,
		SourceMap: false,
		Paths:     []string{"src", "components", "pages"},
	})

	cmd = parseWatchArguments("--cached")
	expect(t, cmd, WatchCommand{
		Cached:    true,
		Poll:      250 * time.Millisecond,
		Port:      8000,
		SourceMap: false,
		Paths:     []string{"pages"},
	})

	cmd = parseWatchArguments("--poll=500ms")
	expect(t, cmd, WatchCommand{
		Cached:    false,
		Poll:      500 * time.Millisecond,
		Port:      8000,
		SourceMap: false,
		Paths:     []string{"pages"},
	})

	cmd = parseWatchArguments("--port=8080")
	expect(t, cmd, WatchCommand{
		Cached:    false,
		Poll:      250 * time.Millisecond,
		Port:      8080,
		SourceMap: false,
		Paths:     []string{"pages"},
	})

	cmd = parseWatchArguments("--source-map")
	expect(t, cmd, WatchCommand{
		Cached:    false,
		Poll:      250 * time.Millisecond,
		Port:      8000,
		SourceMap: true,
		Paths:     []string{"pages"},
	})

	cmd = parseWatchArguments("--cached", "--poll=500ms", "--port=8080", "--source-map", "src", "components", "pages")
	expect(t, cmd, WatchCommand{
		Cached:    true,
		Poll:      500 * time.Millisecond,
		Port:      8080,
		SourceMap: true,
		Paths:     []string{"src", "components", "pages"},
	})
}

func TestBuild(t *testing.T) {
	var cmd BuildCommand

	cmd = parseBuildArguments()
	expect(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: false,
	})

	cmd = parseBuildArguments("--cached")
	expect(t, cmd, BuildCommand{
		Cached:    true,
		SourceMap: false,
	})

	cmd = parseBuildArguments("--source-map")
	expect(t, cmd, BuildCommand{
		Cached:    false,
		SourceMap: true,
	})

	cmd = parseBuildArguments("--cached", "--source-map")
	expect(t, cmd, BuildCommand{
		Cached:    true,
		SourceMap: true,
	})
}

func TestServe(t *testing.T) {
	var cmd ServeCommand

	cmd = parseServeArguments()
	expect(t, cmd, ServeCommand{Port: 8000})

	cmd = parseServeArguments("--port=8080")
	expect(t, cmd, ServeCommand{Port: 8080})
}
