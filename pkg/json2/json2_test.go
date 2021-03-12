package json2

import (
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestNil(t *testing.T) {
	expect.DeepEqual(t, PoorMansFormat(nil),
		`null`)
}

func TestSlice(t *testing.T) {
	expect.DeepEqual(t, PoorMansFormat([]string{"foo", "bar", "baz"}),
		`["foo", "bar", "baz"]`,
	)
}

func TestMap(t *testing.T) {
	expect.DeepEqual(t, PoorMansFormat(map[string]interface{}{"foo": "a", "bar": "b", "baz": "c"}),
		`{ "bar": "b", "baz": "c", "foo": "a" }`,
	)
}
