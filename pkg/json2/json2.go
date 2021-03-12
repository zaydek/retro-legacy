package json2

import (
	"encoding/json"
	"strings"
)

// PoorMansFormat JSON-encodes a value as:
//
// - "null"
// - "[foo, bar, baz]"
// - "{ "foo": "a", "bar": "b", "baz": "c" }"
//
func PoorMansFormat(v interface{}) string {
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
