// https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
module.exports = {
	env: {
		browser: true,
		jest: true,
		node: true,
	},
	extends: ["plugin:react-hooks/recommended"],
	globals: { JSX: true }, // JSX.Element
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	rules: {
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-function-return-type.md
		"@typescript-eslint/explicit-function-return-type": 2,
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md
		"@typescript-eslint/no-explicit-any": 2,
		// https://eslint.org/docs/rules/eqeqeq
		eqeqeq: 2,
	},
}
