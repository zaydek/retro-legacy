import * as child_process from "child_process"
import * as fs from "fs"
import * as path from "path"

import { copyAll, readdirAll } from "../fsAll"

test("readdirAll", async () => {
	await fs.promises.mkdir(path.join(__dirname, "foo"), { recursive: true })
	await fs.promises.mkdir(path.join(__dirname, "foo", "bar"), { recursive: true })
	await fs.promises.mkdir(path.join(__dirname, "foo", "bar", "baz"), { recursive: true })

	await fs.promises.writeFile(path.join(__dirname, "foo/a"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/b"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/baz/c"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/baz/exclude"), "")

	let srcs = await readdirAll(path.join(__dirname, "foo"), [path.join(__dirname, "foo/bar/baz/exclude")])
	srcs = srcs.map(src => path.relative(__dirname, src))

	// prettier-ignore
	expect(srcs).toEqual([
		"foo/a",
		"foo/bar",
		"foo/bar/b",
		"foo/bar/baz",
		"foo/bar/baz/c",
	])

	// // NOTE: fs.promises.unlink produces EPERM error.
	// await fs.promises.unlink(path.join(__dirname, "foo"))
	child_process.execSync(`rm -rf ${path.join(__dirname, "foo")}`)
})

// test("", () => {
// 	// ...
// })
