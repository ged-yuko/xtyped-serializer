module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: [
//        "./test/"
        "./src/"
    ],
    testMatch: [ 
        "**/__tests__/**/*.[jt]s?(x)", 
        "**/?(*.)+(spec|test).[jt]s?(x)",
    ],
    rootDir: '.'
};