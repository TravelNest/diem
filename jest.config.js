module.exports = {
	testURL: "http://localhost/",
	clearMocks: true,
	globals: {
		'ts-jest': {
			tsConfig: "tsconfig.json",
			diagnostics: {
				ignoreCodes: ['TS151001']
			}
		}
	},
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		"<rootDir>/build/"
	],
	transform: {
		'^.+\\.tsx?$': "ts-jest"
	},
	moduleFileExtensions: [
		"ts",
		"tsx",
		"js",
		"jsx",
		"json"
	],
	setupFiles: [
		// "<rootDir>/testSetup.js",
		// "jest-date-mock"
	],
	preset: 'ts-jest'
};
