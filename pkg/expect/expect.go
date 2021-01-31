package expect

import (
	"reflect"
	"testing"
)

func Expect(t *testing.T, x, y interface{}) {
	if reflect.DeepEqual(x, y) {
		// No-op
		return
	}
	t.Fatalf("got %+q want %+q", x, y)
}
