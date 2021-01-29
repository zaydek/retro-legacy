package events

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type Message struct {
	Text string `json:"text"`
}

func TestHeaders(t *testing.T) {
	var got, want string

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		SetSSEHeaders(w)
	}))
	defer ts.Close()
	res, err := http.Get(ts.URL)
	if err != nil {
		t.Fatal(err)
	}

	got = res.Header.Get("Content-Type")
	want = "text/event-stream"
	if got != want {
		t.Fatalf("got %s want %s", got, want)
	}
	got = res.Header.Get("Cache-Control")
	want = "no-cache"
	if got != want {
		t.Fatalf("got %s want %s", got, want)
	}
	got = res.Header.Get("Connection")
	want = "keep-alive"
	if got != want {
		t.Fatalf("got %s want %s", got, want)
	}
}

func TestFieldEvent(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{Event: "greet"}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	want := "event: greet\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
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
	want := "data: " + `{"text":"Hello, world!"}` + "\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestFieldID(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{ID: "abc-123-xyz"}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	want := "id: abc-123-xyz\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestFieldRety(t *testing.T) {
	var buf bytes.Buffer
	if _, err := (SSE{Retry: 1e3}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	want := "retry: 1000\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
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
		Retry: 1e3,
	}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	want := "event: greet\ndata: " + `{"text":"Hello, world!"}` + "\nid: abc-123-xyz\nretry: 1000\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}
