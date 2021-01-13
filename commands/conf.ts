// Top-level configuration.
export default {
	__DEV__: process.env.NODE_ENV !== "production",
	NODE_ENV: process.env.NODE_ENV || "development",

	PAGES_DIR: "pages",
	CACHE_DIR: "cache",
	BUILD_DIR: "build",
}
