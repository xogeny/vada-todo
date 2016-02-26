var path = require('path');

module.exports = {
    entry: "./src/index.ts",
    resolve: {
        root: [__dirname],
        moduleDirectories: ["node_modules"],
	extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    },
    output: {
        libraryTarget: "var",
        library: "VadaTodo",
        path: path.join(__dirname, 'dist'),
        publicPath: "/dist/",
        filename: "./bundle.js"
    },
    module: {
        loaders: [
            {
		test: /\.tsx$/,
		loader: 'ts-loader'
	    },
            {
		test: /\.ts$/,
		loader: 'ts-loader'
	    },
        ]
    }
}
