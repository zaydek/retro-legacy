package events

import (
	"bytes"
	"encoding/json"
	"testing"
)

type Data struct {
	Text string `json:"message"`
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
	data, err := json.Marshal(Data{"Hello, world!"})
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	if _, err := (SSE{Data: string(data)}).Write(&buf); err != nil {
		t.Fatal(err)
	}
	want := "data: " + `{"message":"Hello, world!"}` + "\n\n"
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
	data, err := json.Marshal(Data{"Hello, world!"})
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
	want := "event: greet\ndata: " + `{"message":"Hello, world!"}` + "\nid: abc-123-xyz\nretry: 1000\n\n"
	if got := buf.String(); got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}
