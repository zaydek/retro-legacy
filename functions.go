package main

import (
	"fmt"
	"os"

	"github.com/zaydek/retro/pkg/ipc"
	"github.com/zaydek/retro/pkg/stdio_logger"
)

<<<<<<< Updated upstream
=======
////////////////////////////////////////////////////////////////////////////////

var (
	normal = terminal.Normal.Sprint

	bold      = terminal.Bold.Sprint
	dim       = terminal.Dim.Sprint
	underline = terminal.Underline.Sprint
	black     = terminal.Black.Sprint
	red       = terminal.Red.Sprint
	green     = terminal.Green.Sprint
	yellow    = terminal.Yellow.Sprint
	blue      = terminal.Blue.Sprint
	magenta   = terminal.Magenta.Sprint
	cyan      = terminal.Cyan.Sprint
	white     = terminal.White.Sprint
	bgBlack   = terminal.BgBlack.Sprint
	bgRed     = terminal.BgRed.Sprint
	bgGreen   = terminal.BgGreen.Sprint
	bgYellow  = terminal.BgYellow.Sprint
	bgBlue    = terminal.BgBlue.Sprint
	bgMagenta = terminal.BgMagenta.Sprint
	bgCyan    = terminal.BgCyan.Sprint
	bgWhite   = terminal.BgWhite.Sprint

	dimUnderline = terminal.New(terminal.DimCode, terminal.UnderlineCode).Sprint
	dimBlack     = terminal.New(terminal.DimCode, terminal.BlackCode).Sprint
	dimRed       = terminal.New(terminal.DimCode, terminal.RedCode).Sprint
	dimGreen     = terminal.New(terminal.DimCode, terminal.GreenCode).Sprint
	dimYellow    = terminal.New(terminal.DimCode, terminal.YellowCode).Sprint
	dimBlue      = terminal.New(terminal.DimCode, terminal.BlueCode).Sprint
	dimMagenta   = terminal.New(terminal.DimCode, terminal.MagentaCode).Sprint
	dimCyan      = terminal.New(terminal.DimCode, terminal.CyanCode).Sprint
	dimWhite     = terminal.New(terminal.DimCode, terminal.WhiteCode).Sprint
	dimBgBlack   = terminal.New(terminal.DimCode, terminal.BgBlackCode).Sprint
	dimBgRed     = terminal.New(terminal.DimCode, terminal.BgRedCode).Sprint
	dimBgGreen   = terminal.New(terminal.DimCode, terminal.BgGreenCode).Sprint
	dimBgYellow  = terminal.New(terminal.DimCode, terminal.BgYellowCode).Sprint
	dimBgBlue    = terminal.New(terminal.DimCode, terminal.BgBlueCode).Sprint
	dimBgMagenta = terminal.New(terminal.DimCode, terminal.BgMagentaCode).Sprint
	dimBgCyan    = terminal.New(terminal.DimCode, terminal.BgCyanCode).Sprint
	dimBgWhite   = terminal.New(terminal.DimCode, terminal.BgWhiteCode).Sprint

	boldUnderline = terminal.New(terminal.BoldCode, terminal.UnderlineCode).Sprint
	boldBlack     = terminal.New(terminal.BoldCode, terminal.BlackCode).Sprint
	boldRed       = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
	boldGreen     = terminal.New(terminal.BoldCode, terminal.GreenCode).Sprint
	boldYellow    = terminal.New(terminal.BoldCode, terminal.YellowCode).Sprint
	boldBlue      = terminal.New(terminal.BoldCode, terminal.BlueCode).Sprint
	boldMagenta   = terminal.New(terminal.BoldCode, terminal.MagentaCode).Sprint
	boldCyan      = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldWhite     = terminal.New(terminal.BoldCode, terminal.WhiteCode).Sprint
	boldBgBlack   = terminal.New(terminal.BoldCode, terminal.BgBlackCode).Sprint
	boldBgRed     = terminal.New(terminal.BoldCode, terminal.BgRedCode).Sprint
	boldBgGreen   = terminal.New(terminal.BoldCode, terminal.BgGreenCode).Sprint
	boldBgYellow  = terminal.New(terminal.BoldCode, terminal.BgYellowCode).Sprint
	boldBgBlue    = terminal.New(terminal.BoldCode, terminal.BgBlueCode).Sprint
	boldBgMagenta = terminal.New(terminal.BoldCode, terminal.BgMagentaCode).Sprint
	boldBgCyan    = terminal.New(terminal.BoldCode, terminal.BgCyanCode).Sprint
	boldBgWhite   = terminal.New(terminal.BoldCode, terminal.BgWhiteCode).Sprint
)

////////////////////////////////////////////////////////////////////////////////

type LoggerOptions struct {
	Datetime bool
	Date     bool
	Time     bool
}

type StdioLogger struct {
	format string
}

var stdio = newLogger(LoggerOptions{Datetime: true})

func newLogger(args ...LoggerOptions) *StdioLogger {
	opt := LoggerOptions{}
	if len(args) == 1 {
		opt = args[0]
	}

	var format string
	if opt.Datetime {
		format += "Jan 02 03:04:05.000 PM"
	} else {
		if opt.Date {
			format += "Jan 02"
		}
		if opt.Time {
			if format != "" {
				format += " "
			}
			format += "03:04:05.000 PM"
		}
	}

	logger := &StdioLogger{format: format}
	return logger
}

func (l *StdioLogger) Stdout(args ...interface{}) {
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		var tstr string
		if l.format != "" {
			tstr += dim(time.Now().Format(l.format))
			tstr += "  "
		}
		// lines[x] = fmt.Sprintf("%s%s\x1b[0m", tstr, line)
		lines[x] = fmt.Sprintf("%s%s %s\x1b[0m", tstr, boldCyan("stdout"), line)
	}
	fmt.Fprintln(os.Stdout, strings.Join(lines, "\n"))
}

func (l *StdioLogger) Stderr(args ...interface{}) {
	str := strings.TrimRight(fmt.Sprint(args...), "\n")
	lines := strings.Split(str, "\n")
	for x, line := range lines {
		var tstr string
		if l.format != "" {
			tstr += dim(time.Now().Format(l.format))
			tstr += "  "
		}
		lines[x] = fmt.Sprintf("%s%s %s\x1b[0m", tstr, boldRed("stderr"), line)
	}
	fmt.Fprintln(os.Stderr, strings.Join(lines, "\n"))
}

////////////////////////////////////////////////////////////////////////////////

type Message struct {
	Kind string
	Data interface{}
}

func newCmd(cmdStr string) (func(Message) (string, error), error) {
	cmdArgs := strings.Split(cmdStr, " ")
	cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)

	stdinPipe, err := cmd.StdinPipe()
	if err != nil {
		return nil, err
	}
	stdoutPipe, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	stderrPipe, err := cmd.StderrPipe()
	if err != nil {
		return nil, err
	}

	stdin := make(chan Message)
	go func() {
		defer stdinPipe.Close()
		for msg := range stdin {
			bstr, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}
			// Add an EOF so 'await stdin()' can process
			stdinPipe.Write(append(bstr, '\n'))
		}
	}()

	stdout := make(chan string)
	go func() {
		defer func() {
			stdoutPipe.Close()
			close(stdout)
		}()
		// Increase the buffer
		scanner := bufio.NewScanner(stdoutPipe)
		buf := make([]byte, 1024*1024)
		scanner.Buffer(buf, len(buf))
		for scanner.Scan() {
			stdout <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	stderr := make(chan string)
	go func() {
		defer func() {
			stderrPipe.Close()
			close(stderr)
		}()
		// Read from start-to-end
		// https://golang.org/pkg/bufio/#SplitFunc
		scanner := bufio.NewScanner(stderrPipe)
		scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
			return len(data), data, nil
		})
		for scanner.Scan() {
			stderr <- scanner.Text()
		}
		if err := scanner.Err(); err != nil {
			panic(err)
		}
	}()

	// Start the command
	if err := cmd.Start(); err != nil {
		return nil, err
	}

	return func(msg Message) (string, error) {
		stdin <- msg
		var out string
		select {
		case str := <-stdout:
			out = str
		case errstr := <-stderr:
			return "", errors.New(errstr)
		}
		return out, nil
	}, nil
}

>>>>>>> Stashed changes
func main() {
	send, err := ipc.NewCommand("node functions-node.esbuild.js")
	if err != nil {
		panic(err)
	}

	run := func() (string, error) { return send(ipc.Message{Kind: "run"}) }
	rerun := func() (string, error) { return send(ipc.Message{Kind: "rerun"}) }

	out1, err := run()
	if err != nil {
		stdio_logger.Stderr(fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	stdio_logger.Stdout(out1)

	out2, err := rerun()
	if err != nil {
		stdio_logger.Stderr(fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	stdio_logger.Stdout(out2)
}
