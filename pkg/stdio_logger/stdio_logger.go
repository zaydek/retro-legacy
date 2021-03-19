package stdio_logger

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/zaydek/retro/pkg/terminal"
)

type LoggerOptions struct {
	Datetime bool
	Date     bool
	Time     bool
}

type StdioLogger struct {
	format string
}

var (
	dim      = terminal.New(terminal.DimCode).Sprint
	boldCyan = terminal.New(terminal.BoldCode, terminal.CyanCode).Sprint
	boldRed  = terminal.New(terminal.BoldCode, terminal.RedCode).Sprint
)

func New(args ...LoggerOptions) *StdioLogger {
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

var stdio = New(LoggerOptions{Datetime: true})

func Stdout(args ...interface{}) {
	stdio.Stdout(args...)
}

func Stderr(args ...interface{}) {
	stdio.Stderr(args...)
}
