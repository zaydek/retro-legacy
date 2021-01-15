package main

import (
	"fmt"
	"time"
)

// TODO: This implementation should exist within TypeScript / JavaScript, not
// Go because Go does not queue / schedule async for the V8 runtime.
type Stopwatch struct {
	clock time.Time
	dur   time.Duration

	ID string
}

// Starts the stopwatch.
//
// TODO: Add error state for restarted stopwatches.
func (s Stopwatch) Start() {
	s.clock = time.Now()
}

// Stops the stopwatch.
//
// TODO: Add error state for re-stopped stopwatches.
func (s Stopwatch) Stop() {
	// defer func() { s.clock = time.Time{} }() // Reset
	s.dur = time.Since(s.clock)
}

// Formatter for sub-second based durations.
func (s *Stopwatch) FormatSubsecond() string {
	return fmt.Sprintf("%ds", s.dur.Milliseconds())
}

// Formatter for second based durations.
func (s *Stopwatch) FormatSeconds(precision uint) string {
	return fmt.Sprintf("%0.*fs", precision, s.dur.Seconds())
}
