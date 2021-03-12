package main

import (
	"encoding/json"
	"fmt"
	"strings"
)

// poorMansFormatter JSON-formats a value as:
//
// - "null"
// - "[foo, bar, baz]"
// - "{ "foo": "a", "bar": "b", "baz": "c" }"
//
func poorMansFormatter(v interface{}) string {
	b, _ := json.MarshalIndent(v, "", " ")
	str := string(b)
	switch str[len(str)-1] {
	case ']':
		repl := strings.ReplaceAll(str, "\n", "")[2:] // Remove "[\n"
		return "[" + repl
	case '}':
		repl := strings.ReplaceAll(str, "\n", "")[2:] // Remove "{\n"
		return "{ " + repl[:len(repl)-1] + " }"
	}
	return str
}

func main() {
	// args := []interface{}{1, "hello", "world"}
	// args := map[string]interface{}{"hello": 1, "oops": "world"}

	var args []interface{}
	// args := []string{"hello", "world"}
	fmt.Println(poorMansFormatter(args))

	// bstr, _ := json.MarshalIndent(args, "", " ")
	// fmt.Println("[" + strings.ReplaceAll(string(bstr), "\n", "")[2:])
	// fmt.Println(string(bstr))
	// fmt.Printf("%+v\n", []string{"hello", "world"})
}
