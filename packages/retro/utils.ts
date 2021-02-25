import * as esbuild from "esbuild"
import * as term from "../lib/term"

export function testStrictObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function testStrictArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

// loc.file:loc.line:loc.column: msg.text
//
// loc.line | loc.lineText
//            ~~~~~~~~~~~~
//
export function formatEsbuildMessage(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const loc = msg.location!
	return `${loc.file}:${loc.line}:${loc.column}: ${msg.text}

	${loc.line} ${term.dim("│")} ${loc.lineText}
	${" ".repeat(String(loc.line).length)} ${term.dim("│")} ${" ".repeat(loc.column)}${color("~".repeat(loc.length))}`
	// ${" ".repeat(String(loc.line).length)} ${term.dim("│")} ${" ".repeat(loc.column)}${color("^")}`
}
