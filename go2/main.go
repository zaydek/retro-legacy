package main

import (
	"fmt"
	"io/ioutil"

	"github.com/zaydek/retro/stubs"
)

// // Server guards; must be run once.
// func (c Configuration) serverGuards() error {
// 	info, err := os.Stat(c.PagesDir)
// 	if os.IsNotExist(err) {
// 		err := os.Mkdir(c.PagesDir, os.ModePerm)
// 		if err != nil {
// 			return err
// 		}
// 	} else if !info.IsDir() {
// 		return errors.New("cannot proceed; configuration field `PAGES_DIR` must be a directory")
// 	}
// 	info, err = os.Stat(c.CacheDir)
// 	if os.IsNotExist(err) {
// 		err := os.Mkdir(c.CacheDir, os.ModePerm)
// 		if err != nil {
// 			return err
// 		}
// 	} else if !info.IsDir() {
// 		return errors.New("cannot proceed; configuration field `CACHE_DIR` must be a directory")
// 	}
// 	info, err = os.Stat(c.BuildDir)
// 	if os.IsNotExist(err) {
// 		err := os.Mkdir(c.BuildDir, os.ModePerm)
// 		if err != nil {
// 			return err
// 		}
// 	} else if !info.IsDir() {
// 		return errors.New("cannot proceed; configuration field `BUILD_DIR` must be a directory")
// 	}
// 	return nil
// }

// TODO: Add graceful error-handling if there’s no `public/index.html` or
// `public` directory.
func main() {
	bstr, err := ioutil.ReadFile("public/index.html")
	if err != nil {
		panic(err)
	}
	fmt.Print(string(stubs.ReplaceRetroStubs(string(bstr))))
}
