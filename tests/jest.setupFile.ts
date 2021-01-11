import React from "react"
import renderer from "react-test-renderer"

// See `renderer.create(...).toJSON()`
type Snapshot = renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null

declare namespace global {
	function mock_location_pathname(): void
	function renderRoutedSnapshot(pathname: string, routedApp: React.ReactElement): Snapshot
}

// https://stackoverflow.com/a/54034379
function mock_location_pathname() {
	Object.defineProperty(window, "location", {
		value: { pathname: "/" },
		writable: true,
	})
}

function renderRoutedSnapshot(pathname: string, app: React.ReactElement) {
	window.location.pathname = pathname
	const snapshot = renderer.create(app).toJSON()
	return snapshot
}

global.mock_location_pathname = mock_location_pathname
global.renderRoutedSnapshot = renderRoutedSnapshot
