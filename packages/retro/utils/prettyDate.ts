// prettyDate formats a date as "03:04:05.000 AM".
export function prettyDate(date: Date): string {
	const hh = String(date.getHours() % 12 ?? 12).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")
	const am = date.getHours() < 12 ? "AM" : "PM"
	const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0")
	return `${hh}:${mm}:${ss}.${ms} ${am}`
}

// prettyCurrentDate formats the current date as "03:04:05.000 AM".
export function prettyCurrentDate(): string {
	return prettyDate(new Date())
}
