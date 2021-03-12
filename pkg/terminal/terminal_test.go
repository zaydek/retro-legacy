package terminal

import (
	"bytes"
	"testing"

	"github.com/zaydek/retro/pkg/expect"
)

func TestRevert(t *testing.T) {
	var buf bytes.Buffer
	if _, err := Revert(&buf); err != nil {
		t.Fatal(err)
	}
	expect.DeepEqual(t, buf.String(), "\x1b[0m")
}

func TesetDeferRevert(t *testing.T) {
	var buf bytes.Buffer
	defer func() {
		expect.DeepEqual(t, buf.String(), "\x1b[0m")
	}()
	defer Revert(&buf)
}

func TestBold(t *testing.T) {
	expect.DeepEqual(t, Bold.Sprint(), "")
	expect.DeepEqual(t, Bold.Sprintf(""), "")
	expect.DeepEqual(t, Bold.Sprint("Hello, world!"), "\x1b[1mHello, world!\x1b[0m")
	expect.DeepEqual(t, Bold.Sprintf("%s", "Hello, world!"), "\x1b[1mHello, world!\x1b[0m")
}

func TestRed(t *testing.T) {
	expect.DeepEqual(t, Red.Sprint(), "")
	expect.DeepEqual(t, Red.Sprintf(""), "")
	expect.DeepEqual(t, Red.Sprint("Hello, world!"), "\x1b[31mHello, world!\x1b[0m")
	expect.DeepEqual(t, Red.Sprintf("%s", "Hello, world!"), "\x1b[31mHello, world!\x1b[0m")
}

func TestBoldRed(t *testing.T) {
	boldRed := New(BoldCode, RedCode)
	expect.DeepEqual(t, boldRed.Sprint(), "")
	expect.DeepEqual(t, boldRed.Sprintf(""), "")
	expect.DeepEqual(t, boldRed.Sprint("Hello, world!"), "\x1b[1m\x1b[31mHello, world!\x1b[0m")
	expect.DeepEqual(t, boldRed.Sprintf("%s", "Hello, world!"), "\x1b[1m\x1b[31mHello, world!\x1b[0m")
}
