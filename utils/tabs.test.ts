import { detab } from "./tabs"

test("detab: Hello, world!", () => {
	expect(detab("")).toBe("")
	expect(detab("\t")).toBe("")
	expect(detab("\tHello, world!")).toBe("Hello, world!")
	expect(detab("\t\tHello, world!")).toBe("Hello, world!")
	expect(detab("\t\t\tHello, world!")).toBe("Hello, world!")
	expect(
		detab(`
Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
	Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
		Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
			Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
Hello, world!
Hello, world!
Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
	Hello, world!
	Hello, world!
	Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
		Hello, world!
		Hello, world!
		Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
			Hello, world!
			Hello, world!
			Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
Hello, world!
	Hello, world!
		Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
	Hello, world!
		Hello, world!
			Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
		Hello, world!
			Hello, world!
				Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
			Hello, world!
				Hello, world!
					Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
		Hello, world!
	Hello, world!
Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
			Hello, world!
		Hello, world!
	Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
				Hello, world!
			Hello, world!
		Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
					Hello, world!
				Hello, world!
			Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
})

test("detab: HTML", () => {
	expect(
		detab(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	</body>
</html>
`),
	).toBe(
		`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	</body>
</html>
`.trimStart(),
	)
	expect(
		detab(`
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
		</head>
		<body>
			<noscript>You need to enable JavaScript to run this app.</noscript>
			<div id="root"></div>
			<script src="/app.js"></script>
		</body>
	</html>
`),
	).toBe(
		`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	</body>
</html>
`.trimStart(),
	)
	expect(
		detab(`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				<script src="/app.js"></script>
			</body>
		</html>
`),
	).toBe(
		`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	</body>
</html>
`.trimStart(),
	)
	expect(
		detab(`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
				</head>
				<body>
					<noscript>You need to enable JavaScript to run this app.</noscript>
					<div id="root"></div>
					<script src="/app.js"></script>
				</body>
			</html>
`),
	).toBe(
		`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	</body>
</html>
`.trimStart(),
	)
})
