package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
)

type ResponseKind string

const (
	START   ResponseKind = "start"
	MESSAGE ResponseKind = "message"
	END     ResponseKind = "end"
	ERROR   ResponseKind = "error"
)

type Response struct {
	Kind  ResponseKind           `json:"kind"`
	Data  map[string]interface{} `json:"data"`
	Error string                 `json:"error"`
}

func main() {
	cmd := exec.Command("node", "pipes.js")
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		panic(err)
	}

	// Scan once for stderr (asynchronous)
	go func() {
		bstr, err := ioutil.ReadAll(stderr)
		if err != nil {
			panic(err)
		}
		// Return on empty stderr
		if len(bstr) == 0 {
			return
		}
		fmt.Fprintln(os.Stderr, "stderr:", string(bstr))
		os.Exit(1)
	}()

	// Create a scanner and scan for stdout (asynchronous)
	scanner := bufio.NewScanner(stdout)
scan:
	for {
		// Scan stdout bytes
		scanner.Scan()
		if err := scanner.Err(); err != nil {
			panic(err)
		}

		// Decode scanned stdout bytes
		var res Response
		bstr := scanner.Bytes()
		if err := json.Unmarshal(bstr, &res); err != nil {
			panic(err)
		}

		switch res.Kind {
		case START:
			fmt.Println("node started")
		case MESSAGE:
			bstr, _ := json.Marshal(res)
			fmt.Printf("node message; %+v\n", string(bstr))
		case ERROR:
			bstr, _ := json.Marshal(res)
			fmt.Printf("node error; %+v\n", string(bstr))
			break scan
		case END:
			fmt.Println("node ended")
			break scan
		}
	}

	if bstr, err := ioutil.ReadAll(stderr); err != nil {
		fmt.Fprintln(os.Stderr, "stderr:", string(bstr))
	}

	stdout.Close()
	stderr.Close()

	fmt.Println("done")
}
