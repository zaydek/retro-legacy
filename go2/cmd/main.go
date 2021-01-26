package main

import (
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/color"
)

func main() {
	// f, err := embedded.JavaScriptFS.Open(".gitignore")
	// if err != nil {
	// 	panic(err)
	// }
	// bstr, err := ioutil.ReadAll(f)
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Print(string(bstr))

	defer color.TerminateFormatting(os.Stdout)

	start := time.Now()

	runtime := loadRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case "create":
		runtime.Create()
	case "watch":
		// runtime.Watch()
	case "build":
		// runtime.Build()
	case "serve":
		runtime.Serve()
	}
	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}
