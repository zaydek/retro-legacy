package main

import (
	"io"
	"io/fs"
	"os"
	"path/filepath"
)

type copyInfo struct {
	source string
	dest   string
}

func copyDir(from_dir, to_dir string, excludes []string) error {
	// Sweep for source and dest
	var infos []copyInfo
	err := filepath.WalkDir(from_dir, func(source string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		for _, exclude := range excludes {
			if source == exclude {
				return nil
			}
		}
		info := copyInfo{source: source, dest: filepath.Join(to_dir, source)}
		infos = append(infos, info)
		return nil
	})
	if err != nil {
		return err
	}

	// Copy source to dest
	for _, info := range infos {
		if dir := filepath.Dir(info.dest); dir != "." {
			if err := os.MkdirAll(dir, PERM_DIR); err != nil {
				return err
			}
		}
		source, err := os.Open(info.source)
		if err != nil {
			return err
		}
		dest, err := os.Create(info.dest)
		if err != nil {
			return err
		}
		if _, err := io.Copy(dest, source); err != nil {
			return err
		}
		source.Close()
		dest.Close()
	}
	return nil
}
