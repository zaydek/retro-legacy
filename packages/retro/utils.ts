import * as esbuild from "esbuild"

import chalk from "chalk"

export function testObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function testArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

// loc.file:loc.line:loc.column: msg.text
//
// loc.line | loc.lineText
//            ~~~~~~~~~~~~
//
export function formatMessage(msg: esbuild.Message, color: (...args: unknown[]) => void): string {
	const loc = msg.location!
	return `${loc.file}:${loc.line}:${loc.column}: ${msg.text}

	${loc.line} ${chalk.gray("|")} ${loc.lineText}
	${" ".repeat(String(loc.line).length)} ${chalk.gray("|")} ${" ".repeat(loc.column)}${color("~".repeat(loc.length))}`
}
