package main

import (
	"fmt"
	"regexp"
)

var portRegex = regexp.MustCompile(`^--port=(\d+)$`)

func main() {
	fmt.Println(portRegex.FindStringSubmatch("--pasdort=3123") == nil)
}
