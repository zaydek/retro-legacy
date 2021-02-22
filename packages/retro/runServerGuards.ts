import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as types from "./types"

// runServerGuards tests for the presence of directories and public/index.html.
export default async function runServerGuards(dir: types.DirConfiguration): Promise<void> {
	const dirs = Object.entries(dir).map(([_, v]) => v)

	// Guards directories:
	for (const dir_ of dirs) {
		try {
			await fs.promises.stat(dir_)
		} catch (_) {
			fs.promises.mkdir(dir_, { recursive: true })
		}
	}

	// Guards public/index.html:
	const path = p.join(dir.publicDir, "index.html")
	try {
		const data = await fs.promises.readFile(path)
		const text = data.toString()
		if (!text.includes("%head")) {
			log.error(`${path}: Add '%head%' somewhere to '<head>'.

For example:

...
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	%head%
</head>
...`)
		} else if (!text.includes("%app")) {
			log.error(`${path}: Add '%app%' somewhere to '<body>'.

For example:

...
<body>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<div id="app"></div>
	%app%
</body>
...`)
		}
	} catch (_) {
		await fs.promises.writeFile(
			path,
			`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%head%
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="app"></div>
		%app%
	</body>
</html>
`,
		)
	}
}
