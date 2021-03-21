package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/zaydek/retro/pkg/terminal"
)

// Error: oops
//     at Object.<anonymous> (/Users/zaydek/github/@zaydek/retro/__cache__/src/pages/index.esbuild.js:206:7)
//     at Module._compile (node:internal/modules/cjs/loader:1092:14)
//     at Object.Module._extensions..js (node:internal/modules/cjs/loader:1121:10)
//     at Module.load (node:internal/modules/cjs/loader:972:32)
//     at Function.Module._load (node:internal/modules/cjs/loader:813:14)
//     at Module.require (node:internal/modules/cjs/loader:996:19)
//     at require (node:internal/modules/cjs/helpers:92:18)
//     at resolveModule (/Users/zaydek/github/@zaydek/retro/scripts/backend.esbuild.js:88:11)
//     at processTicksAndRejections (node:internal/process/task_queues:94:5)
//     at async resolveStaticServerRoute (/Users/zaydek/github/@zaydek/retro/scripts/backend.esbuild.js:106:15)

type V8StackFrame struct {
	Caller string // E.g. Object.<anonymous>
	Source string // E.g. foo/bar/baz.ext
	Line   int    // E.g. 1
	Column int    // E.g. 2
}

type V8StackTrace struct {
	Error  string
	Frames []V8StackFrame
}

var frameRe = regexp.MustCompile(`^    at ([^(]+) \((.*):(\d+):(\d+)\)$`)

func parseV8StackFrame(frameStr string) V8StackFrame {
	matches := frameRe.FindAllStringSubmatch(frameStr, -1)
	if matches == nil || len(matches[0]) != 5 {
		panic("Internal error")
	}

	lno, err := strconv.Atoi(matches[0][3])
	if err != nil {
		panic(err)
	}

	cno, err := strconv.Atoi(matches[0][4])
	if err != nil {
		panic(err)
	}

	frame := V8StackFrame{
		Caller: matches[0][1],
		Source: matches[0][2],
		Line:   lno,
		Column: cno,
	}
	return frame
}

func NewV8StackTrace(stackStr string) V8StackTrace {
	var trace V8StackTrace

	if !strings.HasPrefix(stackStr, "Error: ") {
		panic("Internal error")
	}

	// Remove WS from the end of the stack
	arr := strings.Split(strings.TrimSpace(stackStr), "\n")
	for x, v := range arr {
		if x == 0 {
			trace.Error += v[len("Error: "):]
			continue
		}
		if !strings.HasPrefix(v, "    at ") {
			// trace.Error cannot be "" here so we add "\n"
			trace.Error += "\n" + v
		} else {
			trace.Frames = append(trace.Frames, parseV8StackFrame(v))
		}
	}
	return trace
}

func JSON(v interface{}) string {
	bstr, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		panic(err)
	}
	return string(bstr)
}

func main() {
	stack := `Error: oops
    at Object.<anonymous> (/Users/zaydek/github/@zaydek/retro/__cache__/src/pages/index.esbuild.js:206:7)
    at Module._compile (node:internal/modules/cjs/loader:1092:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1121:10)
    at Module.load (node:internal/modules/cjs/loader:972:32)
    at Function.Module._load (node:internal/modules/cjs/loader:813:14)
    at Module.require (node:internal/modules/cjs/loader:996:19)
    at require (node:internal/modules/cjs/helpers:92:18)
    at resolveModule (/Users/zaydek/github/@zaydek/retro/scripts/backend.esbuild.js:88:11)
    at processTicksAndRejections (node:internal/process/task_queues:94:5)
    at async resolveStaticServerRoute (/Users/zaydek/github/@zaydek/retro/scripts/backend.esbuild.js:106:15)
`

	// fmt.Println(stack)
	fmt.Println(prettyV8StackTrace(NewV8StackTrace(stack)))
}

func prettyV8StackTrace(trace V8StackTrace) string {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	var out string
	for _, frame := range trace.Frames {
		var caller string
		if frame.Caller == "Object.<anonymous>" {
			caller = "<anonymous>"
		} else {
			caller += fmt.Sprintf("%s(...)", frame.Caller)
		}

		// Step-over node:internal frames
		if strings.HasPrefix(frame.Source, "node:internal") {
			continue
		}

		var background bool

		// /Users/...
		source := frame.Source
		if strings.HasPrefix(source, string(filepath.Separator)) {
			source, err = filepath.Rel(cwd, source)
			if err != nil {
				panic(err)
			}
			// node_modules/...
			if strings.HasPrefix(source, "node_modules") {
				source, err = filepath.Rel(cwd, "node_modules")
				if err != nil {
					panic(err)
				}
				background = true
			}
		}

		sprintf := fmt.Sprintf
		if background {
			sprintf = terminal.Dimf
		}

		if out != "" {
			out += "\n"
		}
		out += sprintf("   %s\n     %s:%d:%d", caller, source, frame.Line, frame.Column)
	}

	source, err := filepath.Rel(cwd, trace.Frames[0].Source)
	if err != nil {
		panic(err)
	}

	pretty := fmt.Sprintf("%s\n\n%s\n",
		terminal.Boldf(" > %s: %s %s",
			fmt.Sprintf("%s:%d:%d", source, trace.Frames[0].Line, trace.Frames[0].Column),
			terminal.Red("error:"),
			trace.Error,
		),
		out,
	)
	return pretty
}
