package main

import "os"

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	stderr.Println(err)
	os.Exit(1)
}
