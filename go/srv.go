package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/zaydek/retro/pkg/run"
)

type JSON map[string]interface{}

// Sends a POST request to the Node.js server.
func POST(in []byte) ([]byte, error) {
	var buf bytes.Buffer
	buf.Write(in)

	res, err := http.Post("http://localhost:8000", "application/json", &buf)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	out, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return out, nil
}

//go:generate ../node_modules/.bin/esbuild srv.ts --format=cjs --outfile=srv.js
func main() {
	log.SetFlags(log.Lmicroseconds)

	ch := make(chan []byte)
	defer func() {
		close(ch)
	}()

	// // Response:
	// go func() {
	// 	time.Sleep(100 * time.Millisecond)
	//
	// 	for data := range ch {
	// 		var buf bytes.Buffer
	// 		buf.Write(data)
	// 		res, err := http.Post("http://localhost:8000", "application/json", &buf)
	// 		if err != nil {
	// 			panic(err)
	// 		}
	// 		body, err := ioutil.ReadAll(res.Body)
	// 		res.Body.Close()
	// 		if err != nil {
	// 			panic(err)
	// 		}
	// 		log.Printf("recv: %s\n", body)
	// 	}
	// }()

	// Request:
	go func() {
		time.Sleep(100 * time.Millisecond)

		// First request:
		payload := JSON{"type": "ping"}
		in, _ := json.Marshal(payload)

		log.Printf("sent: %s\n", in)
		out, err := POST(in)
		if err != nil {
			panic(err)
		}
		log.Printf("recv: %s\n", out)

		// ...
	}()

	if _, err := run.Cmd("node", "srv.js"); err != nil {
		panic(err)
	}
}
