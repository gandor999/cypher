module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
        'web_scraper/**/*.ts',
        '!src/index.ts',
        '!src/constants.ts',
        '!src/browser/index.ts'
    ]
};
