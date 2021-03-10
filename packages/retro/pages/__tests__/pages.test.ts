import * as child_process from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as T from "../../types"

import { component_syntax, dst_syntax, newPagesFromDirectories, path_syntax } from "../pages"
import { parse } from "../parse"

const dirs: T.Directories = {
	wwwDir: "www",
	srcPagesDir: "src/pages",
	cacheDir: "__cache__",
	exportDir: "__export__",
}

test("dst_syntax", () => {
	expect(dst_syntax(dirs, parse("src/pages/index.js"))).toBe("__export__/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo.js"))).toBe("__export__/foo.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/index.js"))).toBe("__export__/foo/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar.js"))).toBe("__export__/foo/bar.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/index.js"))).toBe("__export__/foo/bar/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/baz.js"))).toBe("__export__/foo/bar/baz.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"))).toBe("__export__/foo/bar/baz/index.html")
})

test("path_syntax", () => {
	expect(path_syntax(dirs, parse("src/pages/index.js"))).toBe("/")
	expect(path_syntax(dirs, parse("src/pages/foo.js"))).toBe("/foo")
	expect(path_syntax(dirs, parse("src/pages/foo/index.js"))).toBe("/foo/")
	expect(path_syntax(dirs, parse("src/pages/foo/bar.js"))).toBe("/foo/bar")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/index.js"))).toBe("/foo/bar/")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/baz.js"))).toBe("/foo/bar/baz")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"))).toBe("/foo/bar/baz/")
})

test("component_syntax: dynamic=false", () => {
	const opt = { dynamic: false }
	expect(component_syntax(dirs, parse("src/pages/index.js"), opt)).toBe("StaticIndex")
	expect(component_syntax(dirs, parse("src/pages/foo.js"), opt)).toBe("StaticFoo")
	expect(component_syntax(dirs, parse("src/pages/foo/index.js"), opt)).toBe("StaticFooIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar.js"), opt)).toBe("StaticFooBar")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/index.js"), opt)).toBe("StaticFooBarIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz.js"), opt)).toBe("StaticFooBarBaz")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"), opt)).toBe("StaticFooBarBazIndex")
})

test("component_syntax: dynamic=true", () => {
	const opt = { dynamic: true }
	expect(component_syntax(dirs, parse("src/pages/index.js"), opt)).toBe("DynamicIndex")
	expect(component_syntax(dirs, parse("src/pages/foo.js"), opt)).toBe("DynamicFoo")
	expect(component_syntax(dirs, parse("src/pages/foo/index.js"), opt)).toBe("DynamicFooIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar.js"), opt)).toBe("DynamicFooBar")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/index.js"), opt)).toBe("DynamicFooBarIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz.js"), opt)).toBe("DynamicFooBarBaz")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"), opt)).toBe("DynamicFooBarBazIndex")
})

test("newPagesFromDirectories", async () => {
	const __relative_dirname = path.relative(process.cwd(), __dirname)

	const dirs2: T.Directories = {
		wwwDir: path.join(__relative_dirname, "www"),
		srcPagesDir: path.join(__relative_dirname, "src/pages"),
		cacheDir: path.join(__relative_dirname, "__cache__"),
		exportDir: path.join(__relative_dirname, "__export__"),
	}

	await fs.promises.mkdir(path.join(dirs2.srcPagesDir), { recursive: true })

	// Static
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "foo"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "foo", "bar"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "foo", "bar", "baz"), { recursive: true })

	// Dynamic
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "[foo]"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "[foo]", "[bar]"), { recursive: true })
	await fs.promises.mkdir(path.join(dirs2.srcPagesDir, "[foo]", "[bar]", "[baz]"), { recursive: true })

	// Static
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "index.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo/index.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo/bar.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo/bar/index.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo/bar/baz.js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "foo/bar/baz/index.js"), "")

	// Dynamic
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[index].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo]/[index].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo]/[bar].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo]/[bar]/[index].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo]/[bar]/[baz].js"), "")
	await fs.promises.writeFile(path.join(dirs2.srcPagesDir, "[foo]/[bar]/[baz]/[index].js"), "")

	let pages = await newPagesFromDirectories(dirs2)
	pages = pages.map(page => ({
		...page,
		src: path.relative(__relative_dirname, page.src), // Remove packages/retro/...
	}))

	expect(pages).toEqual([
		// Static
		{ type: "static", src: "src/pages/index.js", component: "StaticIndex" },
		{ type: "static", src: "src/pages/foo.js", component: "StaticFoo" },
		{ type: "static", src: "src/pages/foo/index.js", component: "StaticFooIndex" },
		{ type: "static", src: "src/pages/foo/bar.js", component: "StaticFooBar" },
		{ type: "static", src: "src/pages/foo/bar/index.js", component: "StaticFooBarIndex" },
		{ type: "static", src: "src/pages/foo/bar/baz.js", component: "StaticFooBarBaz" },
		{ type: "static", src: "src/pages/foo/bar/baz/index.js", component: "StaticFooBarBazIndex" },

		// Dynamic
		{ type: "dynamic", src: "src/pages/[index].js", component: "DynamicIndex" },
		{ type: "dynamic", src: "src/pages/[foo].js", component: "DynamicFoo" },
		{ type: "dynamic", src: "src/pages/[foo]/[index].js", component: "DynamicFooIndex" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar].js", component: "DynamicFooBar" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[index].js", component: "DynamicFooBarIndex" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[baz].js", component: "DynamicFooBarBaz" },
		{ type: "dynamic", src: "src/pages/[foo]/[bar]/[baz]/[index].js", component: "DynamicFooBarBazIndex" },
	])

	// // NOTE: fs.promises.unlink throws EPERM error.
	// await fs.promises.unlink(path.dirname(dirs2.srcPagesDir))
	child_process.execSync(`rm -rf ${path.dirname(dirs2.srcPagesDir)}`)
})
