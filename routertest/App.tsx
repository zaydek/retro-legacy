import React from "react"
import ReactDOM from "react-dom"
import { Link as Anchor, Route, Router } from "./Router2"

// import { Anchor, Route, Router } from "./Router"

// const routes = [
// 	{ href: "/", children: "Open home" },
// 	{ href: "/page-a", children: "Open page A" },
// 	{ href: "/page-b", children: "Open page B" },
// ]

// {/* {routes.map(({ href, children }) => (
// 	<Anchor key={href} href={href}>
// 		{children}
// 	</Anchor>
// ))} */}

interface NavWrapperProps {
	children?: React.ReactNode
}

function NavWrapper({ children }: NavWrapperProps) {
	return (
		<div className="flex-col m-gap-16">
			<div>
				You are currently viewing <code>`{window.location.pathname}`</code>
			</div>
			<div className="flex-row m-gap-16">
				<Anchor href="/">Open home</Anchor>
				<Anchor href="/page-a">Open page A</Anchor>
				<Anchor href="/page-b">Open page B</Anchor>
			</div>
			<div>{children}</div>
		</div>
	)
}

function Home() {
	return (
		<NavWrapper>
			<h1>Hello, world!</h1>
		</NavWrapper>
	)
}

function PageA() {
	return (
		<NavWrapper>
			<h1>Hello, world! (page A)</h1>
		</NavWrapper>
	)
}

function PageB() {
	return (
		<NavWrapper>
			<h1>Hello, world! (page B)</h1>
		</NavWrapper>
	)
}

function FourZeroFour() {
	return (
		<NavWrapper>
			<h1>Oops! Wrong page (404)</h1>
		</NavWrapper>
	)
}

export default function RoutedApp() {
	return (
		<div className="container py-16">
			<Route path="/">
				<Home />
			</Route>
			<Route path="/page-a">
				<PageA />
			</Route>
			<Route path="/page-b">
				<PageB />
			</Route>
			<Route path="/404">
				<FourZeroFour />
			</Route>
		</div>
	)
}

// ReactDOM.render(<div>Hello, world!</div>, document.getElementById("root"))
ReactDOM.render(<RoutedApp />, document.getElementById("root"))
