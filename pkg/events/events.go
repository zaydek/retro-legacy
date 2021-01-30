package events

import (
	"fmt"
	"io"
)

// SSE describes a server-sent event (SSE).
//
// https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#fields
type SSE struct {
	// A string identifying the type of event described. If this is specified, an
	// event will be dispatched on the browser to the listener for the specified
	// event name; the website source code should use addEventListener() to listen
	// for named events. The onmessage handler is called if no event name is
	// specified for a message.
	Event string

	// The data field for the message. When the EventSource receives multiple
	// consecutive lines that begin with data:, it concatenates them, inserting a
	// newline character between each one. Trailing newlines are removed.
	Data string

	// The event ID to set the EventSource object's last event ID value.
	ID string

	// The reconnection time to use when attempting to send the event. This must
	// be an integer, specifying the reconnection time in milliseconds. If a non-
	// integer value is specified, the field is ignored.
	Retry int
}

func (e SSE) Write(w io.Writer) (n int, err error) {
	if e.Event != "" { fmt.Fprintf(w, "event: %s\n", e.Event) }
	if e.Data  != "" { fmt.Fprintf(w, "data: %s\n", e.Data) }
	if e.ID    != "" { fmt.Fprintf(w, "id: %s\n", e.ID) }
	if e.Retry != 0  { fmt.Fprintf(w, "retry: %d\n", e.Retry) }
	return fmt.Fprintln(w)
}
