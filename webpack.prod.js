const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: "./dist/[name].bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "resolve-url-loader",
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'dist/[name].css'
        }),
        new CopyPlugin([
            { from: 'src/index.html', to: '.' },
            { from: 'src/views', to: 'views' },
            { from: 'src/schemaFiles', to: 'schemaFiles' },
            { from: 'src/assets', to: 'assets' },
            { from: 'src/configFiles', to: 'configFiles' },
            { from: 'src/img', to: 'img' },
            { from: 'src/NEWS.md', to: '.' },
            { from: 'src/demoDBs', to: 'demoDBs' },
            { from: 'src/manual', to: 'manual' },
        ]),
    ],
    optimization: {
        minimize: true,
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    }
});