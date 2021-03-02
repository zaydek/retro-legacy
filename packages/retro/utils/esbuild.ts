import * as esbuild from "esbuild"
import * as term from "../../lib/term"

export function format_esbuild(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const meta = msg.location!
	return `${meta.file}:${meta.line}:${meta.column}: ${msg.text}

	${meta.line} ${term.dim("│")} ${meta.lineText}
	${" ".repeat(String(meta.line).length)} ${term.dim("│")} ${" ".repeat(meta.column)}${color("~".repeat(meta.length))}`
}
