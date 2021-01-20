package main

import (
	"net/http"
	"os"
	"strconv"
)

var port = 8000

func (r Retro) cmdServe() {
	if _, err := os.Stat("retro.config.jsonc"); os.IsNotExist(err) {
		stderr.Fatalln("no such retro.config.jsonc; try retro help")
	} else if _, err := os.Stat(r.config.BuildDir); os.IsNotExist(err) {
		stderr.Fatalln("no such build directory; try retro build && retro serve")
	}

	http.Handle("/", http.FileServer(http.Dir(r.config.BuildDir)))
	raw.Printf("serving on port %[1]d; open https://localhost:%[1]d\n", port)
	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		stderr.Fatal("an unexpected error occurred; %w")
	}
}
