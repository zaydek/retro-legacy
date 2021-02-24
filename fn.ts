const options = [
	{ name: "normal", code: "\x1b[0m" },
	{ name: "bold", code: "\x1b[1m" },
	{ name: "dim", code: "\x1b[2m" },
	{ name: "underline", code: "\x1b[4m" },
	{ name: "black", code: "\x1b[30m" },
	{ name: "red", code: "\x1b[31m" },
	{ name: "green", code: "\x1b[32m" },
	{ name: "yellow", code: "\x1b[33m" },
	{ name: "blue", code: "\x1b[34m" },
	{ name: "magenta", code: "\x1b[35m" },
	{ name: "cyan", code: "\x1b[36m" },
	{ name: "white", code: "\x1b[37m" },
	{ name: "bgBlack", code: "\x1b[40m" },
	{ name: "bgRed", code: "\x1b[41m" },
	{ name: "bgGreen", code: "\x1b[42m" },
	{ name: "bgYellow", code: "\x1b[43m" },
	{ name: "bgBlue", code: "\x1b[44m" },
	{ name: "bgMagenta", code: "\x1b[45m" },
	{ name: "bgCyan", code: "\x1b[46m" },
	{ name: "bgWhite", code: "\x1b[47m" },
]

interface Builder {
	(...args: unknown[]): string
	normal: Builder
	bold: Builder
	dim: Builder
	underline: Builder
	black: Builder
	red: Builder
	green: Builder
	yellow: Builder
	blue: Builder
	magenta: Builder
	cyan: Builder
	white: Builder
	bgBlack: Builder
	bgRed: Builder
	bgGreen: Builder
	bgYellow: Builder
	bgBlue: Builder
	bgMagenta: Builder
	bgCyan: Builder
	bgWhite: Builder
}

function clean(str: string): string {
	let out = ""

	let x = 0
	while (x < str.length) {
		let codes: string[] = []
		let x2 = x

		// On "\x1b":
		while (str[x2] === "\x1b") {
			x2++

			// Step over "[":
			if (x2 >= str.length || str[x2] !== "[") {
				break
			}
			x2++
			// Step over /\d+/:
			const start = x2
			while (x2 < str.length) {
				if (str[x2]! < "0" || str[x2]! > "9") {
					break
				}
				x2++
			}
			// Guard /\d+/:
			const end = x2
			if (start === end) {
				break
			}
			// Step over "m":
			if (x2 >= str.length || str[x2] !== "m") {
				break
			}
			x2++
			codes.push(str.slice(start, end))
		}

		// On one or more code matches:
		if (codes.length > 0) {
			out += `\x1b[${codes.join(";")}m`
			x = x2
			continue
		}

		// Shortcut:
		if (x2 > x) {
			out += str.slice(x, x2)
			x = x2
			continue
		}
		out += str[x]
		x++
	}
	return out
}

function builder(code: string): Builder {
	const set = new Set(code)

	const sprint = (...args: unknown[]): string => {
		const distinct = [...set].join("")
		const out = distinct + args.join(" ").replaceAll("\x1b[0m", "\x1b[0m" + distinct) + "\x1b[0m"
		return clean(out)
	}

	for (const { name, code } of options) {
		Object.defineProperty(sprint, name, {
			enumerable: true,
			get: function () {
				set.add(code)
				return this
			},
		})
	}
	return sprint as Builder
}

const noop = (...args: unknown[]): string => args.join(" ")
const normal = builder("\x1b[0m")
const bold = builder("\x1b[1m")
const dim = builder("\x1b[2m")
const underline = builder("\x1b[4m")
const black = builder("\x1b[30m")
const red = builder("\x1b[31m")
const green = builder("\x1b[32m")
const yellow = builder("\x1b[33m")
const blue = builder("\x1b[34m")
const magenta = builder("\x1b[35m")
const cyan = builder("\x1b[36m")
const white = builder("\x1b[37m")
const bgBlack = builder("\x1b[40m")
const bgRed = builder("\x1b[41m")
const bgGreen = builder("\x1b[42m")
const bgYellow = builder("\x1b[43m")
const bgBlue = builder("\x1b[44m")
const bgMagenta = builder("\x1b[45m")
const bgCyan = builder("\x1b[46m")
const bgWhite = builder("\x1b[47m")

console.log(bold.red(`hello ${blue("haha")}!`))
console.log(bold.blue.bgRed("hello") + "!")
