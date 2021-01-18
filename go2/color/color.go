package color

import "fmt"

// Exposes fmt.Sprint and fmt.Sprintf counterparts for colors and bold colors.
// These functions auto-terminate formatting. Note that programs that panic
// cannot auto-terminate formatting. Therefore, use defer TerminateFormatting().
var (
	Black        = colorImpl("\033[0;30m%s\033[0m")
	Red          = colorImpl("\033[0;31m%s\033[0m")
	Green        = colorImpl("\033[0;32m%s\033[0m")
	Yellow       = colorImpl("\033[0;33m%s\033[0m")
	Purple       = colorImpl("\033[0;34m%s\033[0m")
	Magenta      = colorImpl("\033[0;35m%s\033[0m")
	Teal         = colorImpl("\033[0;36m%s\033[0m")
	White        = colorImpl("\033[0;37m%s\033[0m")

	Blackf       = colorfImpl("\033[0;30m%s\033[0m")
	Redf         = colorfImpl("\033[0;31m%s\033[0m")
	Greenf       = colorfImpl("\033[0;32m%s\033[0m")
	Yellowf      = colorfImpl("\033[0;33m%s\033[0m")
	Purplef      = colorfImpl("\033[0;34m%s\033[0m")
	Magentaf     = colorfImpl("\033[0;35m%s\033[0m")
	Tealf        = colorfImpl("\033[0;36m%s\033[0m")
	Whitef       = colorfImpl("\033[0;37m%s\033[0m")

	BoldBlack    = colorImpl("\033[1;30m%s\033[0m")
	BoldRed      = colorImpl("\033[1;31m%s\033[0m")
	BoldGreen    = colorImpl("\033[1;32m%s\033[0m")
	BoldYellow   = colorImpl("\033[1;33m%s\033[0m")
	BoldPurple   = colorImpl("\033[1;34m%s\033[0m")
	BoldMagenta  = colorImpl("\033[1;35m%s\033[0m")
	BoldTeal     = colorImpl("\033[1;36m%s\033[0m")

	BoldWhite    = colorImpl("\033[1;37m%s\033[0m")
	BoldBlackf   = colorfImpl("\033[1;30m%s\033[0m")
	BoldRedf     = colorfImpl("\033[1;31m%s\033[0m")
	BoldGreenf   = colorfImpl("\033[1;32m%s\033[0m")
	BoldYellowf  = colorfImpl("\033[1;33m%s\033[0m")
	BoldPurplef  = colorfImpl("\033[1;34m%s\033[0m")
	BoldMagentaf = colorfImpl("\033[1;35m%s\033[0m")
	BoldTealf    = colorfImpl("\033[1;36m%s\033[0m")
	BoldWhitef   = colorfImpl("\033[1;37m%s\033[0m")
)

// TerminateFormatting terminates formatting. Use defer TerminateFormatting().
// Note that this terminates formatting for stdio; stdout and stderr.
func TerminateFormatting() {
	fmt.Print("\033[0m")
}

// colorImpl returns a decorated fmt.Sprint function.
func colorImpl(termStr string) func(...interface{}) string {
	fmtSprint := func(args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprint(args...))
	}
	return fmtSprint
}

// colorfImpl returns a decorated fmt.Sprintf function.
func colorfImpl(termStr string) func(string, ...interface{}) string {
	fmtSprintf := func(format string, args ...interface{}) string {
		return fmt.Sprintf(termStr, fmt.Sprintf(format, args...))
	}
	return fmtSprintf
}
