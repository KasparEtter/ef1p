var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

// Configuration adapted from https://www.typescriptlang.org/docs/handbook/react-&-webpack.html#create-a-webpack-configuration-file.
module.exports = {
    // mode: "development",
    mode: "production",

    // https://webpack.js.org/concepts/entry-points/
    entry: {
        anchors: "./typescript/anchors.ts",
        scrolling: "./typescript/scrolling.ts",
        styling: "./typescript/styling.ts",
    },

    output: {
        filename: "[name].min.js",
        path: __dirname + "/assets/scripts/internal"
    },

    // Enable sourcemaps for debugging webpack's output.
    // devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // { test: /\.js$/, enforce: "pre", loader: "source-map-loader" },
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

    plugins: [
        new WebpackBuildNotifierPlugin()
    ],
};
