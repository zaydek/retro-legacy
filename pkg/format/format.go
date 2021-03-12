package format

import (
	"regexp"
	"strings"

	"github.com/zaydek/retro/pkg/terminal"
)

var quoteRegex = regexp.MustCompile(`'([^']+)'`)

func Format(str string) string {
	str = strings.ReplaceAll(str, "\t", "  ") // Tabs -> spaces
	str = quoteRegex.ReplaceAllString(str, terminal.Cyan("'$1'"))
	return str
}
