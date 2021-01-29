package loggers

import (
	"bytes"
	"fmt"
	"testing"
	"time"
)

type Test struct{ got, want string }

func TestNew(t *testing.T) {
	var buf bytes.Buffer
	logger := New(&buf)
	logger.Println("Hello, world!")
	test := Test{got: buf.String(), want: "Hello, world!\n"}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}

func TestNewTransform(t *testing.T) {
	start := time.Now()

	var buf bytes.Buffer
	logger := NewTransform(&buf, func(str string) string {
		return fmt.Sprintf("%s: %s", start.Format(time.RFC3339), str)
	})
	logger.Println("Hello, world!")
	test := Test{got: buf.String(), want: fmt.Sprintf("%s: Hello, world!\n", start.Format(time.RFC3339))}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}
