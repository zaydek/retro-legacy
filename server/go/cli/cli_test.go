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
// 	// retro create .
// 	cmd1 := parseCreateCommandArgs(".")
// 	expect(t, cmd1.Directory, ".")
//
// 	// retro create dir
// 	cmd2 := parseCreateCommandArgs("dir")
// 	expect(t, cmd2.Directory, "dir")
//
// 	// retro create --template=ts .
// 	cmd3 := parseCreateCommandArgs("--template=ts", ".")
// 	expect(t, cmd3.Template, "ts")
// 	expect(t, cmd3.Directory, ".")
//
// 	// retro create --template=ts dir
// 	cmd4 := parseCreateCommandArgs("--template=js", "dir")
// 	expect(t, cmd4.Template, "js")
// 	expect(t, cmd4.Directory, "dir")
// }

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

// Cached    bool
// Poll      time.Duration
// Port      int
// SourceMap bool

// func TestWatch(t *testing.T) {
// 	// retro watch
// 	cmd1 := parseWatchCommandArgs()
// 	expect(t, cmd1.Directories, []string{"pages"})
//
// 	//	// retro watch x
// 	//	cmd2 := parseWatchCommandArgs("x")
// 	//	expect(t, cmd2.Directories, []string{"x"})
// 	//
// 	//	// retro watch x y
// 	//	cmd3 := parseWatchCommandArgs("x", "y")
// 	//	expect(t, cmd3.Directories, []string{"x", "y"})
// 	//
// 	//	// retro watch x y z
// 	//	cmd4 := parseWatchCommandArgs("x", "y", "z")
// 	//	expect(t, cmd4.Directories, []string{"x", "y", "z"})
// }
