import * as fs from "fs"

async function run() {
	// await fs.promises.unlink("zfakedir")
	await fs.promises.rmdir("zfakedir", { recursive: true })
}

run()
