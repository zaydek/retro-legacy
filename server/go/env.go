package main

import (
	"fmt"
	"regexp"
	"strings"
)

const data = `+-------------------------------+
| REACT_VERSION        | latest |
| REACT_DOM_VERSION    | latest |
| RETRO_CLIENT_VERSION | latest |
| RETRO_SERVER_VERSION | latest |
+-------------------------------+
`

// https://regex101.com/r/0L0wqz/1
var rowRe = regexp.MustCompile(`^\| ([^ ]+) +\| ([^ ]+) +\|$`)

func setPkgVars(table string) {
	for _, each := range strings.Split(data, "\n") {
		matches := rowRe.FindAllStringSubmatch(each, -1)
		if matches != nil {
			pkg, version := matches[0][1], matches[0][2]
			// os.Setenv(pkg, fmt.Sprintf("%q", version))
			fmt.Println(pkg, version)
		}
	}
}

func main() {
	setPkgVars(data)
}
