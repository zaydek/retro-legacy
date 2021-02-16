package expect

import (
	"reflect"
	"testing"
)

func NotDeepEqual(t *testing.T, x, y interface{}) {
	if !reflect.DeepEqual(x, y) {
		// No-op
		return
	}
	t.Fatalf("got %+q want %+q", x, y)
}

func DeepEqual(t *testing.T, x, y interface{}) {
	if reflect.DeepEqual(x, y) {
		// No-op
		return
	}
	t.Fatalf("got %+q want %+q", x, y)
}
