const path = require('path');
const cleanwebpackplugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const htmlwebpackplugin = require('html-webpack-plugin');
const pathConfig = require('./config.js');
const dir = path.resolve(__dirname, '../');
const outPath = path.resolve(dir, pathConfig.output || 'dist');
const entryPath = path.resolve(dir, pathConfig.entry || 'src/index.js');
const templatePath = path.resolve(dir, pathConfig.template || 'src/index.html');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');


const pro = {
    mode: 'production',
    entry: {
        index: entryPath
    },
    output: {
        filename: 'js/[name].[contenthash].js',
        chunkFilename: 'js/[name].[contenthash].async.js',
        path: outPath,
        publicPath: pathConfig.publicPath
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
                        "@babel/plugin-proposal-class-properties",
                        ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]
                    ]
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
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
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            modules: true,
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
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: 'css/[id].[hash].css',
        }),
        new cleanwebpackplugin({
            verbose: true,
            dry: false,
            dangerouslyAllowCleanPatternsOutsideProject: true,
            cleanOnceBeforeBuildPatterns: [path.resolve(outPath, '**/*')]
        })
    ],
    optimization: {
        minimizer: [
            new TerserPlugin(/* ... */),
            new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify("production") }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new OptimizeCSSAssetsPlugin({})
        ],
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
    },
}

module.exports = pro