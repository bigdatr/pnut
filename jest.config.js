// @flow
module.exports = {
    preset: 'blueflag-test',
    collectCoverageFrom: [
        "src/**/*.{js,jsx}",
        "!**/lib/**",
        "!**/node_modules/**"
    ],
    testMatch: ["**/__test__/**/*.js?(x)"]
};