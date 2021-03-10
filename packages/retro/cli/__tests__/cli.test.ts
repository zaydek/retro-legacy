import { parseDevCommand, parseExportCommand, parseServeCommand } from "../cli"

test("parseDevCommand", () => {
	expect(parseDevCommand()).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--cached=true")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--cached=false")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--sourcemap=true")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--sourcemap=false")).toEqual({ type: "dev", cached: false, sourcemap: false, port: 8000 })
	expect(parseDevCommand("--port=8000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--port=3000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 3000 })

	// Unspecified
	expect(parseDevCommand("--cached")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(parseDevCommand("--sourcemap")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
})

test("parseExportCommand", () => {
	expect(parseExportCommand()).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(parseExportCommand("--cached=true")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(parseExportCommand("--cached=false")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(parseExportCommand("--sourcemap=true")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(parseExportCommand("--sourcemap=false")).toEqual({ type: "export", cached: false, sourcemap: false })

	// Unspecified
	expect(parseExportCommand("--cached")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(parseExportCommand("--sourcemap")).toEqual({ type: "export", cached: false, sourcemap: true })
})

test("parseServeCommand", () => {
	expect(parseServeCommand()).toEqual({ type: "serve", /* mode: "ssg", */ port: 8000 })
	// expect(parseServeCommand("--mode=spa")).toEqual({ type: "serve", mode: "spa", port: 8000 })
	// expect(parseServeCommand("--mode=ssg")).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(parseServeCommand("--port=8000")).toEqual({ type: "serve", /* mode: "ssg", */ port: 8000 })
	expect(parseServeCommand("--port=3000")).toEqual({ type: "serve", /* mode: "ssg", */ port: 3000 })
})
