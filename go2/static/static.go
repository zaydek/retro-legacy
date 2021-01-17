package static

import _ "embed"

//go:embed .gitignore
var Gitignore string

//go:embed Readme
var Readme string

//go:embed retro.config.jsonc
var RetroConfigJSONC string

var Assets = []string{
	Gitignore,
	Readme,
	RetroConfigJSONC,
}
