import React from "react"
import ReactDOM from "react-dom"

window.React = React
window.ReactDOM = ReactDOM

window.require = module => {
	switch (module) {
		case "react":
			return window.React
		case "react-dom":
			return window.ReactDOM
		default:
			throw new Error(`require(${JSON.stringify(module)}); module=${module}`)
	}
}
