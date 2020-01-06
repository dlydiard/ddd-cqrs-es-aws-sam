const webpack = require('webpack');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const package = require('./package.json');

const lazyDependencies = [ // lazy loads for typeorm
  '@sap/hdbext',
  'grpc',
  'ioredis',
  'kafkajs',
  'mongodb',
  'mssql',
  'mysql',
  'mysql2',
  'mqtt',
  'nats',
  'oracledb',
  'point-of-view',
  'pg',
  'pg-native',
  'pg-query-stream',
  'react-native-sqlite-storage',
  'redis',
  'sql.js',
  'sqlite3',
  'typeorm-aurora-data-api-driver'
];

const devDependencies = Object.keys(package.devDependencies);
const awsSamPlugin = new AwsSamPlugin();
const outputPath = __dirname + '/.aws-sam/build/';
const appOutput = 'app.js';

// TODO: autodll-plugin currently not used because it breaks AWSCodeBuild
// const vendorOutput = 'vendor.dll.js';
// const fs = require('fs');
const autoDllPluginPostBuilder = [
  /*
  new AutoDllPlugin({
    inject: false, // will inject the DLL bundles to index.html
    context: __dirname,
    path: '',
    filename: vendorOutput,
    plugins: [],
    inherit: true,
    entry: { vendor: Object.keys(package.dependencies) }
  }),
  {
    apply: (compiler) => {
      // concatenate vendor dll to each Lambda app
      compiler.hooks.afterEmit.tap('CopyAfterEmitPlugin', compilation => {
        Object.keys(awsSamPlugin.entry()).forEach(entry => {
          const outputFile = outputPath + entry + '/' + appOutput;
          const vendorData = fs.readFileSync(outputPath + vendorOutput, 'utf8');
          const appData = fs.readFileSync(outputFile, 'utf8');

          // TODO: need to merge source maps see https://github.com/thlorenz/combine-source-map
          // merge vendor dll and app output to a single file
          fs.writeFileSync(outputFile, vendorData + '\n\r' + appData);
        })
      });
    }
  }*/
];

module.exports = {
  cache: true,

  // Loads the entry object from the AWS::Serverless::Function resources in your
  // template.yaml or template.yml
  entry: awsSamPlugin.entry(),

  // Write the output to the .aws-sam/build folder
  output: {
    filename: '[name]/' + appOutput,
    libraryTarget: 'umd',
    path: outputPath
  },

  // Create source maps
  devtool: process.env.NODE_ENV === 'development' ? 'cheap-source-map' : 'none',

  optimization: {
    minimize: true
  },

  // Resolve .ts and .js extensions
  resolve: {
    extensions: ['.ts', '.js']
  },

  // Target node
  target: 'node',

  node: {
    fs: 'empty',
    module: 'empty',
    net: 'empty'
  },

  // Includes the aws-sdk only for development. The node10.x docker image
  // used by SAM CLI Local doens't include it but it's included in the actual
  // Lambda runtime.=
  externals: process.env.NODE_ENV === 'development' ? devDependencies : ['aws-sdk', ...devDependencies],

  // Set the webpack mode
  mode: process.env.NODE_ENV || 'production',

  optimization: {
    usedExports: true,
  },

  // Add the TypeScript loader
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: ['ts-loader', 'ts-nameof-loader']
      }
    ]
  },

  // Add the AWS SAM Webpack plugin
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        if (!lazyDependencies.includes(resource)) return false;
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      }
    }),
    new HardSourceWebpackPlugin(),
    new FilterWarningsPlugin({
      exclude: [/Critical dependency: the request of a dependency is an expression/]
    }),
    awsSamPlugin
  ]
}
