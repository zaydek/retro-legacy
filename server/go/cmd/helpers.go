package main

import (
	"io/ioutil"
	"os"
	p "path"
	"path/filepath"

	"github.com/zaydek/retro/cli"
	"github.com/zaydek/retro/cmd/errs"
	"github.com/zaydek/retro/mode"
)

// getCmd gets the current command.
func (r Runtime) getCmd() string {
	switch r.Command.(type) {
	case cli.CreateCommand:
		return "create"
	case cli.WatchCommand:
		return "watch"
	case cli.BuildCommand:
		return "build"
	case cli.ServeCommand:
		return "serve"
	}
	return ""
}

// getPort gets the current port.
func (r Runtime) getPort() int {
	if cmd := r.getCmd(); cmd == "watch" {
		return r.Command.(cli.WatchCommand).Port
	} else if cmd == "serve" {
		return r.Command.(cli.ServeCommand).Port
	}
	return 0
}

type copyPath struct {
	src string
	dst string
}

// copyAssetDirectoryToBuildDirectory recursively copies the asset directory to
// the build directory.
func copyAssetDirectoryToBuildDirectory(config DirConfiguration) error {
	// TODO: We need to check for the presence of build/public and recursively
	// delete if it exists. This is related to #19.

	var paths []copyPath
	if err := filepath.Walk(config.AssetDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			if info.Name() == "index.html" {
				return nil
			}
			src := path
			dst := p.Join(config.BuildDirectory, path)
			paths = append(paths, copyPath{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		errs.Walk(config.AssetDirectory, err)
	}

	for _, each := range paths {
		if dir := p.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, mode.Directory); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
	}

	for _, each := range paths {
		bstr, err := os.ReadFile(each.src)
		if err != nil {
			return errs.ReadFile(each.src, err)
		}
		if err := ioutil.WriteFile(each.dst, bstr, mode.File); err != nil {
			return errs.ReadFile(each.dst, err)
		}
	}
	return nil
}
