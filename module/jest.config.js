module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: [
        "./test/"
    ],
    testMatch: [ 
        "**/__tests__/**/*.[jt]s?(x)", 
        "**/?(*.)+(spec|test).[jt]s?(x)",
    ],
    rootDir: '.'
};