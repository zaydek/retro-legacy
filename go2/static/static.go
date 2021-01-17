package static

import _ "embed"

type StaticAsset struct {
	Name     string
	Contents string
}

var (
	//go:embed .gitignore
	gitignore string

	//go:embed Readme
	readme string

	//go:embed retro.config.jsonc
	retroconfigjsonc string

	//go:embed public/index.html
	indexhtml string

	//go:embed pages/index.js
	pagejs string

	//go:embed pages/nested/index.js
	nestedpage string
)

var Assets = []StaticAsset{
	{
		Name:     ".gitignore",
		Contents: gitignore,
	},
	{
		Name:     "README",
		Contents: readme,
	},
	{
		Name:     "retro.config.jsonc",
		Contents: retroconfigjsonc,
	},
	{
		Name:     "public/index.html",
		Contents: indexhtml,
	},
	{
		Name:     "pages/index.js",
		Contents: pagejs,
	},
	{
		Name:     "pages/nested/index.js",
		Contents: nestedpage,
	},
}
