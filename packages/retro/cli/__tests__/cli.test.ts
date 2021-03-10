import { parseDevCommand, parseExportCommand, parseServeCommand } from "../cli"

test("parseDevCommand", () => {
	expect(parseDevCommand()).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--fast-refresh=true")).toEqual({
		type: "dev",
		fast_refresh: true,
		sourcemap: true,
		port: 8000,
	})
	expect(parseDevCommand("--fast-refresh=false")).toEqual({
		type: "dev",
		fast_refresh: false,
		sourcemap: true,
		port: 8000,
	})
	expect(parseDevCommand("--sourcemap=true")).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--sourcemap=false")).toEqual({
		type: "dev",
		fast_refresh: true,
		sourcemap: false,
		port: 8000,
	})
	expect(parseDevCommand("--port=8000")).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--port=3000")).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 3000 })

	// Unspecified
	expect(parseDevCommand("--fast-refresh")).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--sourcemap")).toEqual({ type: "dev", fast_refresh: true, sourcemap: true, port: 8000 })
})

test("parseExportCommand", () => {
	expect(parseExportCommand()).toEqual({ type: "export", sourcemap: true })
	expect(parseExportCommand("--sourcemap=true")).toEqual({ type: "export", sourcemap: true })
	expect(parseExportCommand("--sourcemap=false")).toEqual({ type: "export", sourcemap: false })

	// Unspecified
	expect(parseExportCommand("--sourcemap")).toEqual({ type: "export", sourcemap: true })
})

test("parseServeCommand", () => {
	expect(parseServeCommand()).toEqual({ type: "serve", /* mode: "ssg", */ port: 8000 })
	expect(parseServeCommand("--port=8000")).toEqual({ type: "serve", /* mode: "ssg", */ port: 8000 })
	expect(parseServeCommand("--port=3000")).toEqual({ type: "serve", /* mode: "ssg", */ port: 3000 })
})
