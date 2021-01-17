package main

import (
	_ "embed"
	"fmt"
	"path"
)

// go:embed *
// var fsys embed.FS

func main() {
	fmt.Println(path.Join(".", "."))
}
