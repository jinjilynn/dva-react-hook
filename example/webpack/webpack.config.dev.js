const path = require('path');
const htmlwebpackplugin = require('html-webpack-plugin');
const pathConfig = require('./config.js');
const dir = path.resolve(__dirname, '../');
const outPath = path.resolve(dir, pathConfig.output || 'dist');
const entryPath = path.resolve(dir, pathConfig.entry || 'src/index.js');
const templatePath = path.resolve(dir, pathConfig.template || 'src/index.html');
const webpack = require('webpack');

const dev = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: {
        index: entryPath
    },
    output: {
        filename: 'js/[name].[hash].js',
        chunkFilename: 'js/[name].[hash].async.js',
        path: outPath,
    },
    module: {
        rules: [
            {
                test: /\.(jpg|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: 'imgs/[name]_[hash].[ext]',
                        limit: 20480
                    }
                }
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'font/[name].[ext]'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                useBuiltIns: 'usage'
                            }
                        ],
                        '@babel/preset-react'
                    ],
                    plugins: [
                        ["@babel/plugin-transform-runtime", { "corjs": 2 }],
                        "@babel/plugin-syntax-dynamic-import",
                        ["@babel/plugin-proposal-decorators", { "legacy": true }],
                        "@babel/plugin-proposal-class-properties"
                    ]
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')
                            ]
                        }
                    },
                ]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            modules: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')
                            ]
                        }
                    },
                    {
                        loader: 'less-loader',
                    },
                ],
            }
        ]
    },
    devServer: {
        noInfo: false,
        overlay: true,
        hot: true,
        //publicPath: config.output.publicPath,
        stats: {
            colors: true
        },
        //contentBase: path.join(__dirname, "../src"),
        watchContentBase: true,
        historyApiFallback: true,
        open: true,
        port: 3001,
        proxy: {
        },
        disableHostCheck: true,
    },
    plugins: [
        new htmlwebpackplugin({
            template: templatePath,
            filename: path.resolve(outPath, 'index.html'),
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    optimization: {
        usedExports: true,
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 12,
            maxInitialRequests: 9,
            automaticNameDelimiter: '~',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module, chunks, chcheGroupKey) {
                        let name = module.context.match(/[\\/]node_modules[\\/](.*?)[\\/]/);
                        return name ? name[1] : 'vender';
                    },
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
}

module.exports = dev