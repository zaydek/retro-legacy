package perm

import "testing"

func TestFile(t *testing.T) {
	if File != 0644 {
		t.Errorf("got %#o want %#o", File, 0644)
	}
}

func TestDirectory(t *testing.T) {
	if Directory != 0755 {
		t.Errorf("got %#o want %#o", Directory, 0755)
	}
}
