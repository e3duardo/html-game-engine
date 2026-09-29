import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{ ignores: ['dist/**', '.cache/**', 'node_modules/**'] },
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.browser },
		},
		rules: {
			'no-unused-vars': 'warn',
		},
	},
	eslintConfigPrettier,
];
