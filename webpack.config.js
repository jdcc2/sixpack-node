var webpack = require('webpack');
module.exports = {
    entry: [
      './webapp/main.js'
    ],
    output: {
        path: __dirname + '/static',
        filename: "webapp.js",
	publicPath : "/static/"
    },
    module: {
        loaders: [
            //Presets configure babel respectively for es6 support and es7 class properties (fat arrow functions with automatic binding of this to lexical scope)
            { test: /\.js$/, loaders: ['babel?presets[]=es2015,presets[]=stage-1'], exclude : /node_modules/},
            { test: /\.css$/, loader: "style!css" },
            {
                test: /\.vue$/,
                loader: 'vue'
            }
        ]
    },
    plugins: [
     //new webpack.HotModuleReplacementPlugin(),
     new webpack.NoErrorsPlugin()
    ]

};

if (process.env.NODE_ENV === 'production') {
    module.exports.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.OccurenceOrderPlugin()
    ]
} else {
    module.exports.devtool = '#source-map'
}
