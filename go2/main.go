package main

import (
	"os"
	"strings"

	"github.com/zaydek/retro/logger"
)

func main() {
	// defer color.TerminateFormatting()
	// fmt.Println(color.BoldWhitef("Hello, world! %s", "haha"))

	stdout := logger.New(os.Stdout, func(msg string) string {
		arr := strings.Split(msg, "\n")
		for x := range arr {
			if x+1 < len(arr) {
				arr[x] = "  " + arr[x]
			}
		}
		transformed := "\n" + strings.Join(arr, "\n") + "\n"
		return transformed
	})
	// stdout.Printf("Hello %s!\n", "Hello, wrold!")
	stdout.Println("Hello, worl!")

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
