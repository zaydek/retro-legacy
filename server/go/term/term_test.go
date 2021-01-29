package term

import "testing"

type Test struct{ got, want string }

func TestRed(t *testing.T) {
	test := Test{got: Red("Hello, world!"), want: "\033[0;31mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}

func TestRedf(t *testing.T) {
	test := Test{got: Redf("Hello, %s!", "world"), want: "\033[0;31mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}

func TestBold(t *testing.T) {
	test := Test{got: Bold("Hello, world!"), want: "\033[0;1mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}

func TestBoldf(t *testing.T) {
	test := Test{got: Boldf("Hello, %s!", "world"), want: "\033[0;1mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}

func TestBoldRed(t *testing.T) {
	test := Test{got: BoldRed("Hello, world!"), want: "\033[1;31mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}

func TestBoldRedf(t *testing.T) {
	test := Test{got: BoldRedf("Hello, %s!", "world"), want: "\033[1;31mHello, world!\033[0m"}
	if test.got != test.want {
		t.Fatalf("got %s want %s", test.got, test.want)
	}
}
