package main

import (
	"fmt"

	"github.com/zaydek/retro/color"
)

func main() {
	defer color.TerminateFormatting()

	fmt.Println(color.BoldWhitef("Hello, world! %s", "haha"))

	// err := os.MkdirAll("a/hello.go", 0755)
	// if err != nil {
	// 	panic(err)
	// }

	// fmt.Printf("path=%s\n", path.Dir("a/b/c"))
	// fmt.Printf("path=%s\n", path.Base("a/b/c.go"))

	// err := ioutil.WriteFile("a/b/c", []byte(""), 0644)
	// if err != nil {
	// 	panic(err)
	// }
}
