const fs = require("fs")
const p = require("path")

const POLL_INTERVAL = 100

const mtimes: { [key: string]: number } = {}

// checker returns a function that checks whether sources have changed.
async function checker(src: string): Promise<() => Promise<boolean>> {
	// check checks whether sources have changed.
	const check = async (entry: string, { deep }: { deep: boolean }): Promise<boolean> => {
		const stat = await fs.promises.stat(entry)
		// Check for changes:
		const mtimeMs = mtimes[entry]
		if (mtimeMs === undefined || stat.mtimeMs !== mtimeMs) {
			mtimes[entry] = stat.mtimeMs
			if (!deep) {
				return true
			}
		}
		// Recurse on directories:
		if (stat.isDirectory()) {
			for (const src of await fs.promises.readdir(entry)) {
				const next = p.join(entry, src)
				if (await check(next, { deep })) {
					if (!deep) {
						return true
					}
				}
			}
		}
		return false
	}

	await check(src, { deep: true })
	return async (): Promise<boolean> => await check(src, { deep: false })
}

function sleep(forMs: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, forMs)
	})
}

async function run(): Promise<void> {
	const check = await checker("src")
	console.log(mtimes)
	setInterval(async () => {
		console.log("checking")
		if (await check()) {
			console.log("change detected")
		}
	}, 1e3)
}

run()

// function stat(path) {
// 	try {
// 		var stats = fs.statSync(path)
// 	} catch (e) {
// 		return "!"
// 	}
// 	var result = stats.mtimeMs.getTime().toString(36)
// 	if (stats.isDirectory()) {
// 		result += fs
// 			.readdirSync(path)
// 			.map(function (file) {
// 				return stat(path + "/" + file)
// 			})
// 			.join("")
// 	}
// 	return result
// }

// setInterval(() => {
// 	console.log("Hello, world!")
// }, pollInterval)
