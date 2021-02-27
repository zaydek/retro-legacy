// TODO: Write tests.
export function prettyJSON(str: string): string {
	return str.replace(/^{"/, `{ "`).replace(/":"/g, `": "`).replace(/","/g, `", "`).replace(/"}$/, `" }`)
}
