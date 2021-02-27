import * as esbuild from "esbuild"
import * as term from "../../lib/term"

// loc.file:loc.line:loc.column: msg.text
//
// loc.line | loc.lineText
//            ~~~~~~~~~~~~
//
// TODO: Add support for hints.
export function formatEsbuildMessage(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const loc = msg.location!
	return `${loc.file}:${loc.line}:${loc.column}: ${msg.text}

	${loc.line} ${term.dim("│")} ${loc.lineText}
	${" ".repeat(String(loc.line).length)} ${term.dim("│")} ${" ".repeat(loc.column)}${color("~".repeat(loc.length))}`
	// ${" ".repeat(String(loc.line).length)} ${term.dim("│")} ${" ".repeat(loc.column)}${color("^")}`
}
