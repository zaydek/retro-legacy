module.exports = {
	extends: ["plugin:react-hooks/recommended"],

	env: {
		browser: true,
		jest: true,
		node: true,
	},

	// Use @typescript-eslint/parser (uses ./tsconfig.json).
	ignorePatterns: ["*.js", "*.jsx"],
	parser: "@typescript-eslint/parser",
	parserOptions: { project: ["./tsconfig.json"] },
	plugins: ["@typescript-eslint"],

	rules: {
		////////////////////////////////////////////////////////////////////////////
		// JavaScript
		////////////////////////////////////////////////////////////////////////////

		// Use '===' not '=='.
		//
		// https://eslint.org/docs/rules/eqeqeq
		eqeqeq: 1,

		////////////////////////////////////////////////////////////////////////////
		// TypeScript
		////////////////////////////////////////////////////////////////////////////

		// Do not use 'any'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md
		"@typescript-eslint/no-explicit-any": 1,

		// Use 'if (t === true)' not 'if (t)'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unnecessary-boolean-literal-compare.md
		"@typescript-eslint/no-unnecessary-boolean-literal-compare": [
			1,
			{
				allowComparingNullableBooleansToTrue: false,
				allowComparingNullableBooleansToFalse: false,
			},
		],

		// Use 'if (x === y)' not 'if (x)'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/strict-boolean-expressions.md
		"@typescript-eslint/strict-boolean-expressions": [
			1,
			{
				allowNumber: false,
				allowString: false,
				allowNullableObject: false,
				allowNullableBoolean: false,
				allowNullableString: false,
				allowNullableNumber: false,
				allowAny: false,
				allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
			},
		],

		// Use 'a ?? b' not 'a || b'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-nullish-coalescing.md
		"@typescript-eslint/prefer-nullish-coalescing": 1,

		// Use 'a?.b?.c' not 'a && b && c'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/prefer-optional-chain.md
		"@typescript-eslint/prefer-optional-chain": 1,

		// Use 'function fn(): T { ... }' not 'function fn() { ... }'.
		//
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-function-return-type.md
		"@typescript-eslint/explicit-function-return-type": [
			1,
			{
				allowExpressions: false,
				allowTypedFunctionExpressions: true,
				allowHigherOrderFunctions: true,
				allowDirectConstAssertionInArrowFunctions: false,
				allowConciseArrowFunctionExpressionsStartingWithVoid: false,
			},
		],
	},
}
