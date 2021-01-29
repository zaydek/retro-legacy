package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("Start")

	ch := time.Tick(1 * time.Second)

	fmt.Println("a")
	for range ch {
		fmt.Println("b")
		fmt.Println("Hello, world!")
	}
}
