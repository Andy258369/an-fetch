const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: {
        name: 'AnFetch',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    targets: {
                      browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                    },
                    useBuiltIns: 'usage',
                    corejs: { version: 3, proposals: true }
                  }],
                  '@babel/preset-typescript'
                ]
              }
            }
          ],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: {
      minimize: isProduction
    },
    externals: {
      // 如果需要在Node.js环境中使用，可以添加相应的externals配置
    }
  };
}; 