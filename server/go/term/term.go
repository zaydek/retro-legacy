package term

import (
	"fmt"
	"io"
)

var (
	Bold         = sprintImpl("\033[0;1m%s\033[0m")
	Boldf        = sprintfImpl("\033[0;1m%s\033[0m")
	Underline    = sprintImpl("\033[0;4m%s\033[0m")
	Underlinef   = sprintfImpl("\033[0;4m%s\033[0m")

	Black        = sprintImpl("\033[0;30m%s\033[0m")
	Red          = sprintImpl("\033[0;31m%s\033[0m")
	Green        = sprintImpl("\033[0;32m%s\033[0m")
	Yellow       = sprintImpl("\033[0;33m%s\033[0m")
	Purple       = sprintImpl("\033[0;34m%s\033[0m")
	Magenta      = sprintImpl("\033[0;35m%s\033[0m")
	Teal         = sprintImpl("\033[0;36m%s\033[0m")
	White        = sprintImpl("\033[0;37m%s\033[0m")
	BoldBlack    = sprintImpl("\033[1;30m%s\033[0m")
	BoldRed      = sprintImpl("\033[1;31m%s\033[0m")
	BoldGreen    = sprintImpl("\033[1;32m%s\033[0m")
	BoldYellow   = sprintImpl("\033[1;33m%s\033[0m")
	BoldPurple   = sprintImpl("\033[1;34m%s\033[0m")
	BoldMagenta  = sprintImpl("\033[1;35m%s\033[0m")
	BoldTeal     = sprintImpl("\033[1;36m%s\033[0m")
	BoldWhite    = sprintImpl("\033[1;37m%s\033[0m")

	Blackf       = sprintfImpl("\033[0;30m%s\033[0m")
	Redf         = sprintfImpl("\033[0;31m%s\033[0m")
	Greenf       = sprintfImpl("\033[0;32m%s\033[0m")
	Yellowf      = sprintfImpl("\033[0;33m%s\033[0m")
	Purplef      = sprintfImpl("\033[0;34m%s\033[0m")
	Magentaf     = sprintfImpl("\033[0;35m%s\033[0m")
	Tealf        = sprintfImpl("\033[0;36m%s\033[0m")
	Whitef       = sprintfImpl("\033[0;37m%s\033[0m")
	BoldBlackf   = sprintfImpl("\033[1;30m%s\033[0m")
	BoldRedf     = sprintfImpl("\033[1;31m%s\033[0m")
	BoldGreenf   = sprintfImpl("\033[1;32m%s\033[0m")
	BoldYellowf  = sprintfImpl("\033[1;33m%s\033[0m")
	BoldPurplef  = sprintfImpl("\033[1;34m%s\033[0m")
	BoldMagentaf = sprintfImpl("\033[1;35m%s\033[0m")
	BoldTealf    = sprintfImpl("\033[1;36m%s\033[0m")
	BoldWhitef   = sprintfImpl("\033[1;37m%s\033[0m")
)

func Revert(w io.Writer) {
	fmt.Fprint(w, "\033[0m")
}

// sprintImpl decorates fmt.Sprint.
func sprintImpl(termStr string) func(...interface{}) string {
	sprint := func(args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprint(args...))
	}
	return sprint
}

// sprintfImpl decorates fmt.Sprintf.
func sprintfImpl(termStr string) func(string, ...interface{}) string {
	sprintf := func(format string, args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprintf(format, args...))
	}
	return sprintf
}
