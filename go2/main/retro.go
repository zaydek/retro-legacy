package main

// Retro is a namespace for commands.
type Retro struct{}

func (r Retro) version() {
	stdout.Println("0.0.x")
}

func (r Retro) watch() {
	stderr.Println("😡 TODO")
}

func (r Retro) build() {
	stderr.Println("😡 TODO")
}

func (r Retro) serve() {
	stderr.Println("😡 TODO")
}
