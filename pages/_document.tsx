import React from "react"

interface DocumentProps {
	basename: string

	metadata?: React.ElementType
	children?: React.ReactNode
}

export default function Document({ basename, metadata: Metadata, children }: DocumentProps) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{Metadata && <Metadata />}
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root">{children}</div>
				<script src={`/${basename}.js`}></script>
			</body>
		</html>
	)
}
