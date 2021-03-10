import * as fs from "fs"
import * as path from "path"
import * as T from "../../types"

import { newPagesFromDirectories } from "../pages"

test("newPagesFromDirectories", async () => {
	const __scoped_dirname = path.relative(process.cwd(), __dirname)

	const dirs: T.Directories = {
		wwwDir: path.join(__scoped_dirname, "www"),
		srcPagesDir: path.join(__scoped_dirname, "src/pages"),
		cacheDir: path.join(__scoped_dirname, "__cache__"),
		exportDir: path.join(__scoped_dirname, "__export__"),
	}

	await fs.promises.mkdir(path.join(dirs.srcPagesDir), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "[foo]"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "[foo]", "[bar]"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "[foo]", "[bar]", "[baz]"), { recursive: true })

	await fs.promises.mkdir(path.join(dirs.srcPagesDir), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "foo"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "foo", "bar"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs.srcPagesDir, "foo", "bar", "baz"), { recursive: true })

	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[index].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo]/[index].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo]/[bar].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo]/[bar]/[index].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo]/[bar]/[baz].js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "[foo]/[bar]/[baz]/[index].js"), "")

	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "index.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo/index.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo/bar.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo/bar/index.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo/bar/baz.js"), "")
	await fs.promises.writeFile(path.join(dirs.srcPagesDir, "foo/bar/baz/index.js"), "")

	let pages = await newPagesFromDirectories(dirs)
	pages = pages.map(page => ({
		...page,
		src: path.relative(__scoped_dirname, page.src), // Remove packages/retro/...
	}))

	expect(pages).toEqual([
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[baz]/[index].js", component: "DynamicFooBarBazIndex" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[baz].js", component: "DynamicFooBarBaz" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[index].js", component: "DynamicFooBarIndex" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar].js", component: "DynamicFooBar" },
		{ type: "dynamic", src: "src/pages/[foo]/[index].js", component: "DynamicFooIndex" },
		{ type: "dynamic", src: "src/pages/[foo].js", component: "DynamicFoo" },
		{ type: "dynamic", src: "src/pages/[index].js", component: "DynamicIndex" },

		{ type: "static", src: "src/pages/foo/bar/baz/index.js", component: "StaticFooBarBazIndex" },
		{ type: "static", src: "src/pages/foo/bar/baz.js", component: "StaticFooBarBaz" },
		{ type: "static", src: "src/pages/foo/bar/index.js", component: "StaticFooBarIndex" },
		{ type: "static", src: "src/pages/foo/bar.js", component: "StaticFooBar" },
		{ type: "static", src: "src/pages/foo/index.js", component: "StaticFooIndex" },
		{ type: "static", src: "src/pages/foo.js", component: "StaticFoo" },
		{ type: "static", src: "src/pages/index.js", component: "StaticIndex" },
	])

	await fs.promises.rmdir(path.dirname(dirs.srcPagesDir), { recursive: true })
})
