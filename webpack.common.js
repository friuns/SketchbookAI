const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/ts/sketchbook.js'
    },
    output: {
        filename: './build/sketchbook.min.js',
        library: 'Sketchbook',
        libraryTarget: 'umd',
        path: path.resolve(__dirname),
        globalObject: 'this'
    },
    resolve: {
        alias: {
        //   cannon: path.resolve(__dirname, './src/lib/cannon/cannon.js')
        },
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        url: false // Disable URL processing
                    }
                },
                'postcss-loader'
            ]
        }
      ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'build/styles.min.css'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'node_modules/monaco-editor/min/vs',
                    to: 'build/monaco/vs'
                },
                {
                    from: 'node_modules/vue/dist/vue.js',
                    to: 'build/vue.js'
                },
                {
                    from: 'node_modules/peerjs/dist/peerjs.min.js',
                    to: 'build/peerjs.min.js'
                },
                {
                    from: 'node_modules/typescript/lib/typescript.js',
                    to: 'build/typescript.js'
                },
                {
                    from: 'node_modules/@fortawesome/fontawesome-free/webfonts',
                    to: 'build/webfonts'
                },
                {
                    from: 'node_modules/@tweenjs/tween.js/dist/tween.umd.js',
                    to: 'build/tween.umd.js'
                }
            ]
        })
    ],
    performance: {
        hints: false
    }
};