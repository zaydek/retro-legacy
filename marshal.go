package main

import (
	"encoding/json"
	"fmt"
)

func main() {
	type T struct {
		Foo struct {
			Bar string
		}
	}

	var t T
	if err := json.Unmarshal([]byte(`{"foo":{"bar":"baz"}}`), &t); err != nil {
		panic(err)
	}
	fmt.Println(t.Foo.Bar)
}
