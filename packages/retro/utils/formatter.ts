interface Formatter {
	format(...args: unknown[]): void
	done(...args: unknown[]): void
}

export function newFormatter(logger = (...args: unknown[]): void => console.log(...args)): Formatter {
	let once = false
	return {
		format(...args: unknown[]): void {
			if (once) return
			logger(...args)
			once = true
		},
		done(...args: unknown[]): void {
			logger(...args)
		},
	}
}
