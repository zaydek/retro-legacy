import * as esbuild from "esbuild"
import * as terminal from "../shared/terminal"

const defines = (): { [key: string]: string } => ({
	__DEV__: process.env.__DEV__!,
	"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
})

export const transpileJSXAndTSConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: defines(),
	entryPoints: [src],
	external: ["react", "react-dom"], // TODO: Upgrade to ...pkgDependencies, etc.
	format: "cjs", // For require
	inject: ["packages/retro/react-shim.js"],
	loader: { ".js": "jsx" },
	logLevel: "silent",
	minify: false,
	outfile: dst,
	// plugins: [...configs.retro.plugins], // TODO
})

export const bundleAppConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: defines(),
	entryPoints: [src],
	external: [],
	format: "iife",
	inject: ["packages/retro/react-shim.js"],
	loader: { ".js": "jsx" },
	logLevel: "silent", // TODO
	minify: true,
	outfile: dst,
	// plugins: [...configs.retro.plugins], // TODO
})

export function format(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const meta = msg.location!

	const namespace = `${meta.file}:${meta.line}:${meta.column}`
	const error = `esbuild: ${msg.text}`

	let code = ""
	code += `${meta.lineText.slice(0, meta.column)}`
	code += `${color(meta.lineText.slice(meta.column, meta.column + meta.length))}`
	code += `${meta.lineText.slice(meta.column + meta.length)}`

	return `${namespace}: ${error}

	${meta.line} ${terminal.dim("|")} ${code}
	${" ".repeat(String(meta.line).length)} \x20 ${" ".repeat(meta.column)}${color("~".repeat(meta.length))}`
}
