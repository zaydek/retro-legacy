import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as types from "./types"

// runServerGuards tests for the presence of directories and public/index.html.
export default async function runServerGuards(dirConfig: types.DirConfiguration): Promise<void> {
	const dirs = Object.entries(dirConfig).map(([_, dir]) => dir)

	// Guards directories:
	for (const dir of dirs) {
		try {
			await fs.promises.stat(dir)
		} catch (_) {
			fs.promises.mkdir(dir, { recursive: true })
		}
	}

	// Guards public/index.html:
	const path = p.join(dirConfig.publicDir, "index.html")
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
		} else if (!text.includes("%page")) {
			log.error(`${path}: Add '%page%' somewhere to '<body>'.

For example:

...
<body>
	%page%
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
		%page%
	</body>
</html>
`,
		)
	}
}
