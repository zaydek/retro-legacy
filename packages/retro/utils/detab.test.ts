import { detab } from "./detab"

test("integration", () => {
	expect(detab("")).toBe("")
	expect(detab("Hello, world!")).toBe("Hello, world!")

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
Hello, world!
`),
	).toBe(`
Hello, world!
`)
	expect(
		detab(`
	Hello, world!
`),
	).toBe(`
Hello, world!
`)
	expect(
		detab(`
		Hello, world!
	`),
	).toBe(`
Hello, world!
`)
	expect(
		detab(`
			Hello, world!
		`),
	).toBe(`
Hello, world!
`)

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
Hello, world!
Hello, world!
`),
	).toBe(`
Hello, world!
Hello, world!
`)
	expect(
		detab(`
	Hello, world!
	Hello, world!
`),
	).toBe(`
Hello, world!
Hello, world!
`)
	expect(
		detab(`
		Hello, world!
		Hello, world!
	`),
	).toBe(`
Hello, world!
Hello, world!
`)
	expect(
		detab(`
			Hello, world!
			Hello, world!
		`),
	).toBe(`
Hello, world!
Hello, world!
`)

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
Hello, world!
Hello, world!
Hello, world!
`),
	).toBe(`
Hello, world!
Hello, world!
Hello, world!
`)
	expect(
		detab(`
	Hello, world!
	Hello, world!
	Hello, world!
`),
	).toBe(`
Hello, world!
Hello, world!
Hello, world!
`)
	expect(
		detab(`
		Hello, world!
		Hello, world!
		Hello, world!
	`),
	).toBe(`
Hello, world!
Hello, world!
Hello, world!
`)
	expect(
		detab(`
			Hello, world!
			Hello, world!
			Hello, world!
		`),
	).toBe(`
Hello, world!
Hello, world!
Hello, world!
`)

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
Hello, world!
	Hello, world!
		Hello, world!
`),
	).toBe(`
Hello, world!
	Hello, world!
		Hello, world!
`)
	expect(
		detab(`
	Hello, world!
		Hello, world!
			Hello, world!
`),
	).toBe(`
Hello, world!
	Hello, world!
		Hello, world!
`)
	expect(
		detab(`
		Hello, world!
			Hello, world!
				Hello, world!
	`),
	).toBe(`
Hello, world!
	Hello, world!
		Hello, world!
`)
	expect(
		detab(`
			Hello, world!
				Hello, world!
					Hello, world!
		`),
	).toBe(`
Hello, world!
	Hello, world!
		Hello, world!
`)

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
		Hello, world!
	Hello, world!
Hello, world!
`),
	).toBe(`
		Hello, world!
	Hello, world!
Hello, world!
`)
	expect(
		detab(`
			Hello, world!
		Hello, world!
	Hello, world!
`),
	).toBe(`
		Hello, world!
	Hello, world!
Hello, world!
`)
	expect(
		detab(`
				Hello, world!
			Hello, world!
		Hello, world!
	`),
	).toBe(`
		Hello, world!
	Hello, world!
Hello, world!
`)
	expect(
		detab(`
					Hello, world!
				Hello, world!
			Hello, world!
		`),
	).toBe(`
		Hello, world!
	Hello, world!
Hello, world!
`)

	//////////////////////////////////////////////////////////////////////////////

	expect(
		detab(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
	`),
	).toBe(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
`)
	expect(
		detab(`
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Hello, world!</title>
		</head>
		<body>
			<h1>Hello, world!</h1>
		</body>
	</html>
	`),
	).toBe(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
`)
	expect(
		detab(`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Hello, world!</title>
			</head>
			<body>
				<h1>Hello, world!</h1>
			</body>
		</html>
	`),
	).toBe(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
`)
	expect(
		detab(`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<title>Hello, world!</title>
				</head>
				<body>
					<h1>Hello, world!</h1>
				</body>
			</html>
	`),
	).toBe(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
`)
})
