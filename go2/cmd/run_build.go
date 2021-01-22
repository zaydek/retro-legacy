package main

import (
	"fmt"
	"io"
	"os"
	pathpkg "path"
	"path/filepath"
)

func copyAssetToBuildDir(retro Retro) error {
	var paths []struct{ src, dst string }
	if err := filepath.Walk(retro.Config.AssetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && info.Name() != "index.html" {
			src := path
			dst := pathpkg.Join(retro.Config.BuildDir, path)
			paths = append(paths, struct{ src, dst string }{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		return fmt.Errorf("failed to read %s; %w", retro.Config.AssetDir, err)
	}
	for _, each := range paths {
		if dir := pathpkg.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return fmt.Errorf("failed to make directories recursively %s; %w", dir, err)
			}
		}
		src, err := os.Open(each.src)
		if err != nil {
			return fmt.Errorf("an unexpected error occurred; %w", err)
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			return fmt.Errorf("an unexpected error occurred; %w", err)
		}
		if _, err := io.Copy(src, dst); err != nil {
			return fmt.Errorf("an unexpected error occurred; %w", err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}

func (r Retro) build() {
	var err error
	if r.Config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	} else if r.Routes, err = loadRoutes(r.Config); err != nil {
		stderr.Fatalln(err)
	}

	if err := copyAssetToBuildDir(r); err != nil {
		stderr.Fatalln(err)
	}

	// must(prerenderProps(r))
	// must(prerenderApp(r))
	// must(prerenderPages(r))
}
