module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
    },
    plugins: [
        'mocha'
    ],
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'indent': [2, 'tab'],
        'no-tabs': 0,
        'semi': ['error', 'always'],
        'space-before-function-paren': 0,
        'no-multiple-empty-lines': 0,
        "mocha/no-exclusive-tests": "error"
    }
};
