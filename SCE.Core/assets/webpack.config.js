const path = require('path');
var config = {
    entry: './index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, "../Components/"),
        filename: 'SharpCodeEditor.razor.js'
    }
};
module.exports = (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = 'source-map'
    };
    return config;
};