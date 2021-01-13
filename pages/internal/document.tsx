import React from "react"

interface HTMLProps {
	Head: React.ElementType
	Root: React.ElementType
}

export default function HTML({ Head, Root }: HTMLProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Head />
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<Root />
			</body>
		</html>
	)
}
