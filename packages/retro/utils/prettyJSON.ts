// TODO: Write tests.
export function prettyJSON(value: unknown): string {
	return JSON.stringify(value)
		.replace(/^{"/, `{ "`)
		.replace(/":"/g, `": "`)
		.replace(/","/g, `", "`)
		.replace(/"}$/, `" }`)
}
