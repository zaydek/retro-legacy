import * as errors from "../errors"
import * as fs from "fs"
import * as log from "../../shared/log"
import * as path from "path"
import * as T from "../types"
import * as utils from "../utils"

export async function serverGuards(this: T.Runtime): Promise<void> {
	const dirs = [this.dirs.wwwDir, this.dirs.srcPagesDir, this.dirs.cacheDir, this.dirs.exportDir]
	for (const dir of dirs) {
		try {
			await fs.promises.stat(dir)
		} catch (error) {
			fs.promises.mkdir(dir, { recursive: true })
		}
	}

	const target1 = path.join(this.dirs.wwwDir, "index.html")

	try {
		fs.promises.stat(target1)
	} catch (error) {
		await fs.promises.writeFile(
			target1,
			utils.detab(`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="utf-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1" />
						%head%
					</head>
					<body>
						%app%
					</body>
				</html>
			`),
		)
	}

	const buffer = await fs.promises.readFile(target1)
	const contents = buffer.toString()

	if (!contents.includes("%head")) {
		log.fatal(errors.missingDocumentHeadTag(target1))
	} else if (!contents.includes("%app")) {
		log.fatal(errors.missingDocumentAppTag(target1))
	}

	const target2 = path.join(this.dirs.exportDir, this.dirs.wwwDir)
	await fs.promises.mkdir(target2, { recursive: true })
	await utils.copyAll(this.dirs.wwwDir, target2, [path.join(this.dirs.wwwDir, "index.html")])
}

export async function purgeDirs(this: T.Runtime): Promise<void> {
	await fs.promises.rmdir(this.dirs.cacheDir, { recursive: true })
	await fs.promises.rmdir(this.dirs.exportDir, { recursive: true })
}
