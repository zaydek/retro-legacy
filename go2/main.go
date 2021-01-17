package main

import (
	"fmt"
	"path"
)

func main() {
	// err := os.MkdirAll("a/hello.go", 0755)
	// if err != nil {
	// 	panic(err)
	// }

	fmt.Printf("path=%s\n", path.Dir("a"))
	// fmt.Printf("path=%s\n", path.Dir("a/b/c"))
	// fmt.Printf("path=%s\n", path.Base("a/b/c.go"))

	// err := ioutil.WriteFile("a/b/c", []byte(""), 0644)
	// if err != nil {
	// 	panic(err)
	// }
}
