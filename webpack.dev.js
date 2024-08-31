const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        // progress: true,
        liveReload: false,
        host: '0.0.0.0',  // Allow access from any IP
   //     allowedHosts: 'all'  // Allow all hosts to connect
    },
});