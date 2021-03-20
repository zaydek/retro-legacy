package main

import (
	"encoding/json"
	"fmt"
)

type Message2 struct {
	Kind string
	Data json.RawMessage
}

func main() {
	var m Message2
	if err := json.Unmarshal([]byte(`{"Kind":"done","Data":{"errors":[{"location":{"column":3,"file":"src/pages/index.js","length":1,"line":13,"lineText":"\t\t\t<Nav />","namespace":""},"notes":[],"text":"Expected \">\" but found \"<\""}],"warnings":[]}}`), &m); err != nil {
		panic(err)
	}
	var m2 map[string]interface{}
	var ptr interface{} = &m2
	if err := json.Unmarshal(m.Data, ptr); err != nil {
		panic(err)
	}
	fmt.Println(m2)
}
