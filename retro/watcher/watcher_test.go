package watcher

import (
	"io/ioutil"
	"log"
	"os"
	"path"
	"testing"
	"time"

	"github.com/zaydek/retro/perm"
)

type Test struct{ got, want int }

func check(t *testing.T, err error) {
	if err == nil {
		// No-op
		return
	}
	t.Fatalf("check: %s", err)
}

func TestWatch(t *testing.T) {
	var called int

	dir, err := ioutil.TempDir(".", "tmp_")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)

	ch := New(dir, 10*time.Millisecond)
	go func() {
		for range ch {
			called++
		}
	}()

	check(t, ioutil.WriteFile(path.Join(dir, "a"), []byte("Hello, world!\n"), perm.File))
	time.Sleep(10 * time.Millisecond)
	check(t, ioutil.WriteFile(path.Join(dir, "b"), []byte("Hello, world!\n"), perm.File))
	time.Sleep(10 * time.Millisecond)
	check(t, ioutil.WriteFile(path.Join(dir, "c"), []byte("Hello, world!\n"), perm.File))
	time.Sleep(10 * time.Millisecond)

	test := Test{got: called, want: 3}
	if test.got != test.want {
		t.Fatalf("got %d want %d", test.got, test.want)
	}
}
