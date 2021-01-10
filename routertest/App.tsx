import React from "react"
import ReactDOM from "react-dom"
import { Anchor, Route, Router, Redirect } from "./Router2"

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
			<div className="flex-row m-gap-8">
				<Anchor className="px-16 py-8 bg-cool-gray-200 rounded-full" href="/">
					Open home
				</Anchor>
				<Anchor className="px-16 py-8 bg-cool-gray-200 rounded-full" href="/page-a">
					Open Page A
				</Anchor>
				<Anchor className="px-16 py-8 bg-cool-gray-200 rounded-full" href="/page-b">
					Open Page B
				</Anchor>
			</div>
			<div>{children}</div>
		</div>
	)
}

function Home() {
	return (
		<NavWrapper>
			<h1>Hello, world! {Date.now().toString()}</h1>
		</NavWrapper>
	)
}

function PageA() {
	return (
		<NavWrapper>
			<div className="flex-row m-gap-16">
				<h1>Hello, world! (Page A)</h1>
				<Anchor className="px-16 py-8 bg-cool-gray-200 rounded-full" href="/page-b">
					Open Page B
				</Anchor>
			</div>
		</NavWrapper>
	)
}

function PageB() {
	return (
		<NavWrapper>
			<div className="flex-row m-gap-16">
				<h1>Hello, world! (Page B)</h1>
				<Anchor className="px-16 py-8 bg-cool-gray-200 rounded-full" href="/page-a">
					Open Page A
				</Anchor>
			</div>
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

function RedirectTest() {
	return <Redirect href="/haha" />
}

export default function RoutedApp() {
	return (
		<div className="container py-16">
			{/* TODO: What if `<Router>` accepted `window.location.pathname` for SSG? */}
			<Router>
				<Route href="/">
					<Home />
				</Route>
				<Route href="/page-a">
					<PageA />
				</Route>
				<Route href="/page-b">
					<PageB />
				</Route>
				<Route href="/oops">
					<RedirectTest />
				</Route>
				<Route href="/404">
					<FourZeroFour />
				</Route>
			</Router>
		</div>
	)
}

ReactDOM.render(<RoutedApp />, document.getElementById("root"))
