import * as fs from "fs"

async function main(): Promise<void> {
	await fs.promises.stat("lol")
}

main()
