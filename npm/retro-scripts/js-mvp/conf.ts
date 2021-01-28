// Top-level configuration.
//
// TODO: Add field for `public` or `static` files; `STATIC_DIR`.
// TODO: Add field for JavaScript-less builds.
export default {
	// Env configuration:
	__DEV__: process.env.NODE_ENV !== "production",
	NODE_ENV: process.env.NODE_ENV || "development",

	// `<React.StrictMode>` configuration:
	STRICT_MODE: false,

	// Directory configuration:
	PAGES_DIR: "pages",
	CACHE_DIR: "cache",
	BUILD_DIR: "build",
}
