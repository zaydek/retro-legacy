import React from "react"
import renderer from "react-test-renderer"

type Snapshot = renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null

declare namespace global {
	function mockLocationPathname(): void
	function renderRoutedSnapshot(pathname: string, routedApp: React.ReactElement): Snapshot
}

// https://stackoverflow.com/a/54034379
function mockLocationPathname() {
	Object.defineProperty(window, "location", {
		value: { pathname: "/" },
		writable: true,
	})
}

function renderRoutedSnapshot(pathname: string, app: React.ReactElement) {
	window.location.pathname = pathname
	return renderer.create(app).toJSON()
}

global.mockLocationPathname = mockLocationPathname
global.renderRoutedSnapshot = renderRoutedSnapshot
