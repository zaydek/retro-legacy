package static

import _ "embed"

type StaticAsset struct {
	Path     string // E.g. path/to/asset
	Contents string // E.g. Hello, world!
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
		Path:     ".gitignore",
		Contents: gitignore,
	},
	{
		Path:     "README",
		Contents: readme,
	},
	{
		Path:     "retro.config.jsonc",
		Contents: retroconfigjsonc,
	},
	{
		Path:     "public/index.html",
		Contents: indexhtml,
	},
	{
		Path:     "pages/index.js",
		Contents: pagejs,
	},
	{
		Path:     "pages/nested/index.js",
		Contents: nestedpage,
	},
}
