const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const pathConfig = require("./config.js");
const dir = path.resolve(__dirname, "../");
const outPath = path.resolve(dir, pathConfig.output || "dist");
const entryPath = path.resolve(dir, pathConfig.entry || "src/index.js");

const pro = {
  mode: "production",
  entry: {
    index: [entryPath],
  },
  output: {
    filename: "index.js",
    path: outPath,
    library: "dva-react-hook",
    globalObject: "this",
    libraryTarget: "umd",
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                useBuiltIns: "usage",
              },
            ],
            "@babel/preset-react",
          ],
          plugins: [
            ["@babel/plugin-transform-runtime", { corjs: 2 }],
            "@babel/plugin-transform-destructuring",
            "@babel/plugin-syntax-dynamic-import",
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            "@babel/plugin-proposal-class-properties",
          ],
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      dry: false,
      dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: [path.resolve(outPath, "**/*")],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "types",
          context: path.resolve(__dirname, "../"),
        },
      ],
    }),
  ],
};

module.exports = pro;
