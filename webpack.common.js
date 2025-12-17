const path = require('path');
const fs = require('fs');

// Custom plugin to generate examples.json
class GenerateExamplesJsonPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap('GenerateExamplesJsonPlugin', () => {
      const examplesPath = path.join(__dirname, 'src/main/examples');
      const outputPath = path.join(__dirname, 'build/examples.json');
      const buildDir = path.dirname(outputPath);

      try {
        if (!fs.existsSync(buildDir)) {
          fs.mkdirSync(buildDir, { recursive: true });
        }

        const files = fs.readdirSync(examplesPath)
          .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

        fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
        console.log('Successfully generated build/examples.json');
      } catch (err) {
        console.error('Error generating examples.json:', err);
      }
    });
  }
}

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
                { loader: 'style-loader', options: { injectType: 'singletonStyleTag' } },
                { loader: 'css-loader' },
            ]
        }
      ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new GenerateExamplesJsonPlugin()
    ]
};
