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

// func sendMessage(data map[string]interface{}) ([]byte, error) {
// 	bstr, err := json.Marshal(data)
// }

type JSON map[string]interface{}

//go:generate ../node_modules/.bin/esbuild srv.ts --format=cjs --outfile=srv.js
func main() {
	log.SetFlags(log.Lmicroseconds)

	ch := make(chan []byte)
	defer func() {
		close(ch)
	}()

	// Response:
	go func() {
		time.Sleep(100 * time.Millisecond)

		for data := range ch {
			var buf bytes.Buffer
			buf.Write(data)
			res, err := http.Post("http://localhost:8000", "application/json", &buf)
			if err != nil {
				panic(err)
			}
			body, err := ioutil.ReadAll(res.Body)
			res.Body.Close()
			if err != nil {
				panic(err)
			}
			log.Printf("recv: %s\n", body)
		}
	}()

	// Request:
	go func() {
		time.Sleep(100 * time.Millisecond)

		msg := JSON{
			"type": "greet",
			"data": "Zaydek",
		}
		bstr, _ := json.Marshal(msg)
		log.Printf("sent: %s\n", bstr)
		ch <- bstr
	}()

	if _, err := run.Cmd("node", "srv.js"); err != nil {
		panic(err)
	}
}
