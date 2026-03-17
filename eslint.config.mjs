import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default generateEslintConfig({
	enableTypescript: true,
	ignores: ['reference/**'],
	typescriptRules: {
		'@typescript-eslint/no-unsafe-enum-comparison': 'off',
	},
})
