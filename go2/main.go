package main

import "os"

func main() {
	// err := os.MkdirAll("a/hello.go", 0755)
	// if err != nil {
	// 	panic(err)
	// }

	_, err := os.Open("side-project/.gitignore")
	if err != nil {
		panic(err)
	}

	// fmt.Printf("path=%s\n", path.Dir("a/b/c"))
	// fmt.Printf("path=%s\n", path.Base("a/b/c.go"))

	// err := ioutil.WriteFile("a/b/c", []byte(""), 0644)
	// if err != nil {
	// 	panic(err)
	// }
}
