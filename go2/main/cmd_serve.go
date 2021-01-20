package main

import (
	"net/http"
	"strconv"
)

var port = 8000

func (r Retro) cmdServe() {
	http.Handle("/", http.FileServer(http.Dir(r.config.BuildDir)))
	raw.Printf("serving on port %[1]d; open https://localhost:%[1]d\n", port)
	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		stderr.Fatal("an unexpected error occurred; %w")
	}
}
