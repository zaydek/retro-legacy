package terminal

import (
	"fmt"
	"io"
	"strings"
)

const (
	ResetCode     = "\x1b[0m"
	NormalCode    = "\x1b[0m"
	BoldCode      = "\x1b[1m"
	DimCode       = "\x1b[2m"
	UnderlineCode = "\x1b[4m"
	BlackCode     = "\x1b[30m"
	RedCode       = "\x1b[31m"
	GreenCode     = "\x1b[32m"
	YellowCode    = "\x1b[33m"
	BlueCode      = "\x1b[34m"
	MagentaCode   = "\x1b[35m"
	CyanCode      = "\x1b[36m"
	WhiteCode     = "\x1b[37m"
	BgBlackCode   = "\x1b[40m"
	BgRedCode     = "\x1b[41m"
	BgGreenCode   = "\x1b[42m"
	BgYellowCode  = "\x1b[43m"
	BgBlueCode    = "\x1b[44m"
	BgMagentaCode = "\x1b[45m"
	BgCyanCode    = "\x1b[46m"
	BgWhiteCode   = "\x1b[47m"
)

var (
	None      = New()
	Normal    = New(NormalCode)
	Bold      = New(BoldCode)
	Dim       = New(DimCode)
	Underline = New(UnderlineCode)
	Black     = New(BlackCode)
	Red       = New(RedCode)
	Green     = New(GreenCode)
	Yellow    = New(YellowCode)
	Blue      = New(BlueCode)
	Magenta   = New(MagentaCode)
	Cyan      = New(CyanCode)
	White     = New(WhiteCode)
	BgBlack   = New(BgBlackCode)
	BgRed     = New(BgRedCode)
	BgGreen   = New(BgGreenCode)
	BgYellow  = New(BgYellowCode)
	BgBlue    = New(BgBlueCode)
	BgMagenta = New(BgMagentaCode)
	BgCyan    = New(BgCyanCode)
	BgWhite   = New(BgWhiteCode)
)

type Formatter struct {
	code string
}

func New(codes ...string) Formatter {
	code := strings.Join(codes, "")
	formatter := Formatter{code}
	return formatter
}

func (f Formatter) Sprintf(format string, args ...interface{}) string {
	var str string
	str = fmt.Sprintf(format, args...)
	if f.code == "" {
		return str
	}
	str = f.code + strings.ReplaceAll(str, ResetCode, ResetCode+f.code) + ResetCode
	return str
}

func (f Formatter) Sprint(args ...interface{}) string {
	var str string
	str = fmt.Sprint(args...)
	if f.code == "" {
		return str
	}
	str = f.code + strings.ReplaceAll(str, ResetCode, ResetCode+f.code) + ResetCode
	return str
}

func Revert(w io.Writer) (n int, err error) {
	return fmt.Fprint(w, "\x1b[0m")
}
