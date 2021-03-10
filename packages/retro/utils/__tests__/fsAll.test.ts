import * as fs from "fs"
import * as path from "path"

import { copyAll, readdirAll } from "../fsAll"

test("copyAll", async () => {
	await fs.promises.mkdir(path.join(__dirname, "foo"), { recursive: true })
	await fs.promises.mkdir(path.join(__dirname, "foo", "bar"), { recursive: true })
	await fs.promises.mkdir(path.join(__dirname, "foo", "bar", "baz"), { recursive: true })

	await fs.promises.writeFile(path.join(__dirname, "foo/a"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/b"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/baz/c"), "")
	await fs.promises.writeFile(path.join(__dirname, "foo/bar/baz/exclude"), "")

	await copyAll(path.join(__dirname, "foo"), path.join(__dirname, "bar"), [path.join(__dirname, "foo/bar/baz/exclude")])

	let foo = await readdirAll(path.join(__dirname, "foo"))
	foo = foo.map(src => path.relative(__dirname, src))

	let bar = await readdirAll(path.join(__dirname, "bar"))
	bar = bar.map(src => path.relative(__dirname, src))

	// prettier-ignore
	expect(foo).toEqual([
		"foo/a",
		"foo/bar",
		"foo/bar/b",
		"foo/bar/baz",
		"foo/bar/baz/c",
		"foo/bar/baz/exclude",
	])

	// prettier-ignore
	expect(bar).toEqual([
		"bar/a",
		"bar/bar",
		"bar/bar/b",
		"bar/bar/baz",
		"bar/bar/baz/c",
	])

	await fs.promises.rmdir(path.join(__dirname, "foo"), { recursive: true })
	await fs.promises.rmdir(path.join(__dirname, "bar"), { recursive: true })
})

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

	await fs.promises.rmdir(path.join(__dirname, "foo"), { recursive: true })
})
