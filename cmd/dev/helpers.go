package dev

import (
	"io"
	"os"
	p "path"
	"path/filepath"
	"strconv"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/dev/cli"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
)

// getCmd gets the current command.
func (r Runtime) getCmd() Cmd {
	switch r.Command.(type) {
	case cli.StartCommand:
		return CmdStart
	case cli.BuildCommand:
		return CmdBuild
	case cli.ServeCommand:
		return CmdServe
	}
	return 0
}

// getSourceMap gets the current source map enum.
func (r Runtime) getSourceMap() api.SourceMap {
	if cmd := r.getCmd(); cmd == CmdStart {
		if r.Command.(cli.StartCommand).SourceMap {
			return api.SourceMapLinked
		}
		return api.SourceMapNone
	} else if cmd == CmdBuild {
		if r.Command.(cli.BuildCommand).SourceMap {
			return api.SourceMapLinked
		}
		return api.SourceMapNone
	}
	return 0
}

// getPort gets the current port.
func (r Runtime) getPort() string {
	if cmd := r.getCmd(); cmd == CmdStart {
		return strconv.Itoa(r.Command.(cli.StartCommand).Port)
	} else if cmd == CmdServe {
		return strconv.Itoa(r.Command.(cli.ServeCommand).Port)
	}
	return ""
}

type copyPath struct {
	src string
	dst string
}

// copyAssetDirectoryToBuildDirectory destructively and recursively copies the
// asset directory to the build directory.
func copyAssetDirectoryToBuildDirectory(config DirectoryConfiguration) error {
	path := p.Join(config.BuildDirectory, config.AssetDirectory)
	if _, err := os.Stat(path); os.IsExist(err) {
		if err := os.RemoveAll(path); err != nil {
			return errs.Unexpected(err)
		}
	}

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
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
		src, err := os.Open(each.src)
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			return errs.Unexpected(err)
		}
		if _, err := io.Copy(dst, src); err != nil {
			return errs.Unexpected(err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}
