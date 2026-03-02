import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: ['dist/**', 'reference/**', 'node_modules/**', 'pkg/**'],
	},
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
)
