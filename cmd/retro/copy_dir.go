package main

import (
	"io"
	"io/fs"
	"os"
	"path/filepath"
)

type copyInfo struct {
	source string
	target string
}

func copyDir(src, dst string, excludes []string) error {
	// Sweep for sources and targets
	var infos []copyInfo
	err := filepath.WalkDir(src, func(source string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			return nil
		}
		for _, exclude := range excludes {
			if source == exclude {
				return nil
			}
		}
		info := copyInfo{
			source: source,
			target: filepath.Join(dst, source),
		}
		infos = append(infos, info)
		return nil
	})
	if err != nil {
		return err
	}

	// Copy sources to targets
	for _, info := range infos {
		if dir := filepath.Dir(info.target); dir != "." {
			if err := os.MkdirAll(dir, PERM_DIR); err != nil {
				return err
			}
		}
		source, err := os.Open(info.source)
		if err != nil {
			return err
		}
		target, err := os.Create(info.target)
		if err != nil {
			return err
		}
		if _, err := io.Copy(target, source); err != nil {
			return err
		}
		source.Close()
		target.Close()
	}
	return nil
}
