package dev

import (
	"os"

	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
)

// statOrCreateDir stats for the presence of a directory or creates one.
func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, perm.Directory); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

// serverGuards runs server guards on the configuration.
func serverGuards(config DirConfiguration) error {
	dirs := []string{config.AssetDirectory, config.PagesDirectory, config.CacheDirectory, config.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	return nil
}
