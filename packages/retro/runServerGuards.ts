import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as types from "./types"

// runServerGuards tests for the presence of directories and public/index.html.
export default async function runServerGuards(directories: types.DirConfiguration): Promise<void> {
	// prettier-ignore
	const dirs = [
		directories.publicDir,
		directories.srcPagesDir,
		directories.cacheDir,
		directories.exportDir,
	]

	for (const dir of dirs) {
		try {
			await fs.promises.stat(dir)
		} catch (_) {
			fs.promises.mkdir(dir, { recursive: true })
		}
	}

	// Guards public/index.html:
	const path = p.join(directories.publicDir, "index.html")
	try {
		const data = await fs.promises.readFile(path)
		const text = data.toString()
		if (!text.includes("%head")) {
			// TODO: Extract to errs?
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
			// TODO: Extract to errs?
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
