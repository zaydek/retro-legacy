import * as cli from "./cli"

test("dev command", () => {
	const f = cli.parseDevCommand
	expect(f()).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(f("--cached=true")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(f("--cached=false")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(f("--sourcemap=true")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(f("--sourcemap=false")).toEqual({ type: "dev", cached: false, sourcemap: false, port: 8000 })
	expect(f("--port=8000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(f("--port=3000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 3000 })

	// Unspecified
	expect(f("--cached")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(f("--sourcemap")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
})

test("export command", () => {
	const f = cli.parseExportCommand
	expect(f()).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(f("--cached=true")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(f("--cached=false")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(f("--sourcemap=true")).toEqual({ type: "export", cached: false, sourcemap: true })
	expect(f("--sourcemap=false")).toEqual({ type: "export", cached: false, sourcemap: false })

	// Unspecified
	expect(f("--cached")).toEqual({ type: "export", cached: true, sourcemap: true })
	expect(f("--sourcemap")).toEqual({ type: "export", cached: false, sourcemap: true })
})

test("serve command", () => {
	const f = cli.parseServeCommand
	expect(f()).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(f("--mode=spa")).toEqual({ type: "serve", mode: "spa", port: 8000 })
	expect(f("--mode=ssg")).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(f("--port=8000")).toEqual({ type: "serve", mode: "ssg", port: 8000 })
	expect(f("--port=3000")).toEqual({ type: "serve", mode: "ssg", port: 3000 })
})
