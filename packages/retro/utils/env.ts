// setEnvDevelopment sets environment variables for development mode.
export function setEnvDevelopment(): void {
	process.env["__DEV__"] = "true"
	process.env["NODE_ENV"] = "development"
}

// setEnvProduction sets environment variables for production mode.
export function setEnvProduction(): void {
	process.env["__DEV__"] = "false"
	process.env["NODE_ENV"] = "production"
}
