import * as cli from "./cli"

test("dev command", () => {
	expect(cli.parseDevCommand()).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--cached=true")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--cached=false")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--sourcemap=true")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--sourcemap=false")).toEqual({ type: "dev", cached: false, sourcemap: false, port: 8000 })
	expect(cli.parseDevCommand("--port=8000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--port=3000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 3000 })

	// Unspecified
	expect(cli.parseDevCommand("--cached")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(cli.parseDevCommand("--sourcemap")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
})

test("export command", () => {
	expect(cli.parseExportCommand()).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(cli.parseExportCommand("--cached=true")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(cli.parseExportCommand("--cached=false")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(cli.parseExportCommand("--sourcemap=true")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(cli.parseExportCommand("--sourcemap=false")).toEqual({ type: "export", cached: false, sourcemap: false })

	// Unspecified
	expect(cli.parseExportCommand("--cached")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(cli.parseExportCommand("--sourcemap")).toEqual({ type: "export", cached: false, sourcemap: true })
})

test("serve command", () => {
	expect(cli.parseServeCommand()).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	// expect(cli.parseServeCommand("--mode=spa")).toEqual({ type: "serve", mode: "spa", port: 8000 })
	// expect(cli.parseServeCommand("--mode=ssg")).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(cli.parseServeCommand("--port=8000")).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(cli.parseServeCommand("--port=3000")).toEqual({ type: "serve", mode: "ssg", port: 3000 })
})
