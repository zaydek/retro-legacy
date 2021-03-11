package terminal

import (
	"fmt"
	"io"
)

var (
	Bold         = sprint("\033[0;1m%s\033[0m")
	Boldf        = sprintf("\033[0;1m%s\033[0m")
	Underline    = sprint("\033[0;4m%s\033[0m")
	Underlinef   = sprintf("\033[0;4m%s\033[0m")

	Black        = sprint("\033[0;30m%s\033[0m")
	Red          = sprint("\033[0;31m%s\033[0m")
	Green        = sprint("\033[0;32m%s\033[0m")
	Yellow       = sprint("\033[0;33m%s\033[0m")
	Purple       = sprint("\033[0;34m%s\033[0m")
	Magenta      = sprint("\033[0;35m%s\033[0m")
	Teal         = sprint("\033[0;36m%s\033[0m")
	White        = sprint("\033[0;37m%s\033[0m")
	BoldBlack    = sprint("\033[1;30m%s\033[0m")
	BoldRed      = sprint("\033[1;31m%s\033[0m")
	BoldGreen    = sprint("\033[1;32m%s\033[0m")
	BoldYellow   = sprint("\033[1;33m%s\033[0m")
	BoldPurple   = sprint("\033[1;34m%s\033[0m")
	BoldMagenta  = sprint("\033[1;35m%s\033[0m")
	BoldTeal     = sprint("\033[1;36m%s\033[0m")
	BoldWhite    = sprint("\033[1;37m%s\033[0m")

	Blackf       = sprintf("\033[0;30m%s\033[0m")
	Redf         = sprintf("\033[0;31m%s\033[0m")
	Greenf       = sprintf("\033[0;32m%s\033[0m")
	Yellowf      = sprintf("\033[0;33m%s\033[0m")
	Purplef      = sprintf("\033[0;34m%s\033[0m")
	Magentaf     = sprintf("\033[0;35m%s\033[0m")
	Tealf        = sprintf("\033[0;36m%s\033[0m")
	Whitef       = sprintf("\033[0;37m%s\033[0m")
	BoldBlackf   = sprintf("\033[1;30m%s\033[0m")
	BoldRedf     = sprintf("\033[1;31m%s\033[0m")
	BoldGreenf   = sprintf("\033[1;32m%s\033[0m")
	BoldYellowf  = sprintf("\033[1;33m%s\033[0m")
	BoldPurplef  = sprintf("\033[1;34m%s\033[0m")
	BoldMagentaf = sprintf("\033[1;35m%s\033[0m")
	BoldTealf    = sprintf("\033[1;36m%s\033[0m")
	BoldWhitef   = sprintf("\033[1;37m%s\033[0m")
)

func Revert(w io.Writer) (n int, err error) {
	return fmt.Fprint(w, "\033[0m")
}

func sprint(termStr string) func(...interface{}) string {
	format := func(args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprint(args...))
	}
	return format
}

func sprintf(termStr string) func(string, ...interface{}) string {
	format := func(format string, args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprintf(format, args...))
	}
	return format
}
