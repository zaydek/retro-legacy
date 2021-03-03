import * as esbuild from "esbuild"
import * as term from "../../lib/term"

export function format_esbuild(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const meta = msg.location!

	const namespace = `${meta.file}:${meta.line}:${meta.column}`
	const error = `esbuild: ${msg.text}`

	let code = ""
	code += `${meta.lineText.slice(0, meta.column)}`
	code += `${color(meta.lineText.slice(meta.column, meta.column + meta.length))}`
	code += `${meta.lineText.slice(meta.column + meta.length)}`

	return `${namespace}: ${error}

	${meta.line} ${term.dim("|")} ${code}
	${" ".repeat(String(meta.line).length)} \x20 ${" ".repeat(meta.column)}${color("~".repeat(meta.length))}`
}
