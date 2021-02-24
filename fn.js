// function attach(f, set) {
// 	f.a = function (...args) {
// 		set.add(2)
// 		attach(this, set)
// 		return f(...args)
// 	}
// 	f.b = function (...args) {
// 		set.add(3)
// 		attach(this, set)
// 		return f(...args)
// 	}
// }

// let callStack = 0

// function creator(...codes) {
// 	console.log("hello")
// 	// if (codes.length >= 10) {
// 	// 	return () => {}
// 	// }
//
// 	const f = function (...args) {
// 		return `<start:${codes.join(";")}>` + args.join(" ") + "<end>"
// 	}
//
// 	// f.a = (...args) => {
// 	// 	return creator([...set, 2])(...args)
// 	// }
// 	// f.b = (...args) => {
// 	// 	return creator([...set, 3])(...args)
// 	// }
//
// 	// if (codes.length < 10) {
// 	f.a = function (...args) {
// 		const created = creator(...[...codes, 2])
// 		this.a = created.a
// 		this.b = created.b
// 		return created(...args)
// 	}
// 	f.b = function (...args) {
// 		const created = creator(...[...codes, 2])
// 		this.a = created.a
// 		this.b = created.b
// 		return created(...args)
// 	}
// 	// }
//
// 	return f
// }

// const a = {
// 	get a() {
// 		return (...args) => {
// 			return args.join(" ")
// 		}
// 	},
// }

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

function builder(code) {
	const set = new Set(code)

	const sprint = (...args) => {
		// return `<start:${[...set].join(";")}>` + args.join(" ") + "<end>"

		const distinct = [...set].join("")
		return distinct + args.join(" ").replaceAll("\x1b[0m", "\x1b[0m" + distinct) + "\x1b[0m"
		// const out = distinct + args.join(" ").replaceAll("\x1b[0m", "\x1b[0m" + distinct) + "\x1b[0m"
		// return cleanTerminalString(out)
		// return out
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
	return sprint
}

const noop = (...args) => args.join(" ")
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

// console.log(creator().b.a.b.a.c.e.a("hello"))
console.log(`${bold.red(`hello ${blue("haha")}!`)}`)

// const b = creator(1)
// const c = creator(1)

// // function creator(...codes) {
// // 	const f = function (...args) {
// // 		f.a = f.a
// // 		f.b = f.b
// // 		return `<start:${codes.join(";")}>` + args.join(" ") + "<end>"
// // 	}
// // 	f.a = function (...args) {
// // 		const f = creator(...[...codes, 1])
// // 		// for (const [key, fn] of Object.entries(f)) {
// // 		// 	f[key] = fn
// // 		// }
// // 		return f(...args)
// // 	}
// // 	f.b = function (...args) {
// // 		const f = creator(...[...codes, 2])
// // 		// for (const [key, fn] of Object.entries(f)) {
// // 		// 	f[key] = fn
// // 		// }
// // 		return f(...args)
// // 	}
// // 	return f
// // }
//
// // function creator(...codes) {
// // 	const f = (...args) => {
// // 		return `<start:${codes.join(";")}>` + args.join(" ") + "<end>"
// // 	}
// // 	f.a = creator(...[...codes, 2])
// // 	f.b = creator(...[...codes, 3])
// // 	return f
// // }
//
// // const thing = {
// // 	a() {
// // 		return this
// // 	},
// // 	b() {
// // 		return this
// // 	}
// // }
//
// // const a = creator(1)
// // // thing.a.b.c()
//
// // console.log(a("hello", "world"))
// // console.log(a.b("hello", "world"))
// // console.log(a.b.a("hello", "world"))
// // // console.log(a.b.a.b("hello", "world"))
// // // console.log(a.b("hello", "world"))
// // // console.log(a.b.a("hello", "world"))
// // // console.log(a.b.a.b("hello", "world"))
//
// interface Builder {
// 	(...args: unknown[]): string
// 	a(...args: unknown[]): Builder
// 	b(...args: unknown[]): Builder
//
// 	// a(...args: unknown[]): string | Builder
// 	// b(...args: unknown[]): string | Builder
// }
//
// // function factory(...codes: number[]): string | Builder {
// // 	const set = new Set(codes)
// //
// // 	const f = (...args: unknown[]): string => {
// // 		return `<start:${[...set].join(";")}>${args.join(" ")}<end>`
// // 	}
// // 	f.a = (...args: unknown[]): string | Builder => {
// // 		const f = (...args: unknown[]): string => {
// // 			return `<start:${[...set].join(";")}>${args.join(" ")}<end>`
// // 		}
// // 		f.a =
// // 		return f
// // 	}
// // 	f.b = (...args: unknown[]): string | Builder => {
// // 		const f = (...args: unknown[]): string => {
// // 			return `<start:${[...set].join(";")}>${args.join(" ")}<end>`
// // 		}
// // 		f.a =
// // 		return f
// // 	}
// // 	return f
// // }
//
// const a = factory(1)
//
// function fn(s: string): string {
// 	return s
// }
//
// const v = a.a().b("hello")
// fn(v)
//
// // console.log(a.a().b().a().b("hello"))
// // console.log(a.a().b().a().b("hello"))
//
