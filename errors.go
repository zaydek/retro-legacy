package main

import (
	"errors"
	"fmt"
)

////////////////////////////////////////////////////////////////////////////////

type MyError struct {
	Source string
	Dest   string
	Err    error
}

func (m MyError) Error() string {
	return fmt.Sprintf("%s: %s", "MyError", m.Err)
}

////////////////////////////////////////////////////////////////////////////////

type CustomError struct {
	Source string
	Dest   string
	Err    error
}

func (c CustomError) Error() string {
	return fmt.Sprintf("%s: %s", "MyError", c.Err)
}

////////////////////////////////////////////////////////////////////////////////

func main() {
	myErr := MyError{
		Source: "src",
		Dest:   "dst",
		Err:    errors.New("Hello, world!"),
	}

	// var mErr MyError
	// if errors.As(err, &mErr) {
	// 	fmt.Println(mErr.Source)
	// }

	var err error = myErr
	switch e := err.(type) {
	case MyError:
		fmt.Println(e)
	case CustomError:
		fmt.Println(e)
	}
}
