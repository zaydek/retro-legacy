import React from "react"

interface DocumentProps {
	Head: React.ElementType
	Root: React.ElementType
}

export default function Document({ Head, Root }: DocumentProps) {
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
