// getPrettyDate formats a date as "03:04:05.000 AM".
export function getPrettyDate(date: Date): string {
	const hh = String(date.getHours() % 12 ?? 12).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")
	const am = date.getHours() < 12 ? "AM" : "PM"
	const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0")
	return `${hh}:${mm}:${ss}.${ms} ${am}`
}

// getCurrentPrettyDate formats the current date as "03:04:05.000 AM".
export function getCurrentPrettyDate(): string {
	return getPrettyDate(new Date())
}
