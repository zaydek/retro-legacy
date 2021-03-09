import * as cli from "./cli"

test("", () => {
	const parse = cli.parseDevCommand
	expect(parse()).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parse("--cached=true")).toEqual({ type: "dev", cached: true, sourcemap: true, port: 8000 })
	expect(parse("--cached=false")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parse("--sourcemap=true")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parse("--sourcemap=false")).toEqual({ type: "dev", cached: false, sourcemap: false, port: 8000 })
	expect(parse("--port=8000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 8000 })
	expect(parse("--port=3000")).toEqual({ type: "dev", cached: false, sourcemap: true, port: 3000 })
})
