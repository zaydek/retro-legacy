package events

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

type Test struct{ got, want string }

type Message struct {
	Text string `json:"text"`
}

func TestHeaders(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
	}))
	defer ts.Close()
	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}
	test1 := Test{want: res.Header.Get("Content-Type"), got: "text/event-stream"}
	if test1.got != test1.want {
		t.Fatalf("got %s want %s", test1.got, test1.want)
	}
	test2 := Test{want: res.Header.Get("Cache-Control"), got: "no-cache"}
	if test2.got != test2.want {
		t.Fatalf("got %s want %s", test2.got, test2.want)
	}
	test3 := Test{want: res.Header.Get("Connection"), got: "keep-alive"}
	if test3.got != test3.want {
		t.Fatalf("got %s want %s", test3.got, test3.want)
	}
}

func TestFieldEvent(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{Event: "greet"}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	test := Test{got: buf.String(), want: "event: greet\n\n"}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}

func TestFieldData(t *testing.T) {
	data, err := json.Marshal(Message{"Hello, world!"})
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	if _, err := (SSE{Data: string(data)}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	test := Test{got: buf.String(), want: "data: " + `{"text":"Hello, world!"}` + "\n\n"}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}

func TestFieldID(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{ID: "abc-123-xyz"}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	test := Test{got: buf.String(), want: "id: abc-123-xyz\n\n"}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}

func TestFieldRety(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{Retry: 1000}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	test := Test{want: buf.String(), got: "retry: 1000\n\n"}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}

func TestAllFields(t *testing.T) {
	data, err := json.Marshal(Message{"Hello, world!"})
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	if _, err := (SSE{
		Event: "greet",
		Data:  string(data),
		ID:    "abc-123-xyz",
		Retry: 1000,
	}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	test := Test{
		want: buf.String(),
		got: fmt.Sprintf("event: %s\ndata: %s\nid: %s\nretry: %d\n\n",
			"greet",
			`{"text":"Hello, world!"}`,
			"abc-123-xyz",
			1000,
		)}
	if test.got != test.want {
		t.Fatalf("got %q want %q", test.got, test.want)
	}
}
