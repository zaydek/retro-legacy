package main

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	pathpkg "path"
	"path/filepath"

	"github.com/zaydek/retro/cli"
	"github.com/zaydek/retro/errs"
	"github.com/zaydek/retro/loggers"
)

// getPort gets the current port.
func (r Runtime) getPort() int {
	if r.WatchCommand != nil {
		return r.WatchCommand.Port
	} else if r.ServeCommand != nil {
		return r.ServeCommand.Port
	}
	return 0
}

// loadRuntime loads the runtime; parses CLI arguments, configuration, and the
// page-based routes.
func loadRuntime() Runtime {
	var err error

	var runtime Runtime
	runtime.Commands = cli.ParseCLIArguments()
	if runtime.Config, err = loadConfig(); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	if runtime.Router, err = loadRouter(runtime.Config); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	return runtime
}

// buildRequireStmt builds a require statement for Node processes.
func buildRequireStmt(routes []PageBasedRoute) string {
	var requireStmt string
	for x, each := range routes {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requireStmt += sep + fmt.Sprintf(`const %s = require("../%s")`,
			each.Component, each.FSPath)
	}
	return requireStmt
}

// buildRequireStmtAsArray builds a require statement as an array for Node
// processes.
func buildRequireStmtAsArray(routes []PageBasedRoute) string {
	var requireStmtAsArray string
	for _, each := range routes {
		requireStmtAsArray += "\n\t" + fmt.Sprintf(`{ fs_path: %q, path: %q, exports: %s },`,
			each.FSPath, each.Path, each.Component)
	}
	requireStmtAsArray = "[" + requireStmtAsArray + "\n]"
	return requireStmtAsArray
}

// copyPath describes a copy path for copyFSToDirectory and
// copyAssetDirectoryToBuildDirectory.
type copyPath struct {
	src string
	dst string
}

// copyFSToDirectory recursively copies a filesystem to a directory. The
// directory must be created but empty.
func copyFSToDirectory(f fs.FS, namespace, dir string) error {
	var paths []copyPath
	if err := fs.WalkDir(f, ".", func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !dirEntry.IsDir() {
			src := path
			dst := pathpkg.Join(dir, path)
			paths = append(paths, copyPath{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		return errs.Walk(namespace, err)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
	}

	for _, each := range paths {
		src, err := os.Open(each.src)
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			return errs.Unexpected(err)
		}
		if _, err := io.Copy(src, dst); err != nil {
			return errs.Unexpected(err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}

// copyAssetDirectoryToBuildDirectory recursively copies the asset directory to
// the build directory.
func copyAssetDirectoryToBuildDirectory(config Configuration) error {
	var paths []copyPath
	if err := filepath.Walk(config.AssetDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			if info.Name() != "index.html" {
				return nil
			}
			src := path
			dst := pathpkg.Join(config.BuildDirectory, path)
			paths = append(paths, copyPath{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		errs.Walk(config.AssetDirectory, err)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
	}

	for _, each := range paths {
		src, err := os.Open(each.src)
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			return errs.Unexpected(err)
		}
		if _, err := io.Copy(src, dst); err != nil {
			return errs.Unexpected(err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}
