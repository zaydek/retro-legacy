package main

import (
	"fmt"
	"path/filepath"
	"strings"
)

func filenameToCamelCase(filename string) string {
	byteIsLetter := func(b byte) bool {
		ok := ('a' <= b && b <= 'z') ||
			('A' <= b && b <= 'Z')
		return ok
	}

	trim := filename
	trim = strings.TrimPrefix(trim, "./")           // Remove ./etc
	trim = trim[:len(trim)-len(filepath.Ext(trim))] // Remove etc.*

	var ret string
	for x := 0; x < len(trim); x++ {
		switch trim[x] {
		case '/':
			ret += "Slash"
			x++
			if x < len(trim) {
				ret += strings.ToUpper(string(trim[x]))
			}
		case '-':
			x++
			if x < len(trim) && byteIsLetter(trim[x]) {
				ret += strings.ToUpper(string(trim[x]))
			}
		default:
			ret += string(trim[x])
		}
	}
	return ret
}

func main() {
	fmt.Println(filenameToCamelCase("./retro-app/pages/index.js"))
}
