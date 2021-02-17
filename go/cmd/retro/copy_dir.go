package retro

import (
	"io/ioutil"
	"os"
	p "path"
	"path/filepath"

	"github.com/zaydek/retro/pkg/perm"
)

type copyPath struct {
	src string
	dst string
}

// copyAssetDirToBuildDir destructively and recursively copies the asset
// directory to the build directory.
func copyAssetDirToBuildDir(config DirectoryConfiguration) error {
	path := p.Join(config.BuildDirectory, config.AssetDirectory)
	if _, err := os.Stat(path); os.IsExist(err) {
		if err := os.RemoveAll(path); err != nil {
			return err
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
		return err
	}

	for _, each := range paths {
		if dir := p.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				return err
			}
		}

		// src, err := os.Open(each.src)
		// if err != nil {
		// 	return err
		// }
		// dst, err := os.Create(each.dst)
		// if err != nil {
		// 	return err
		// }
		// if _, err := io.Copy(dst, src); err != nil {
		// 	return err
		// }
		// src.Close()
		// dst.Close()

		bstr, err := ioutil.ReadFile(each.src)
		if err != nil {
			return err
		}
		if err := ioutil.WriteFile(each.dst, bstr, perm.File); err != nil {
			return err
		}
	}
	return nil
}
