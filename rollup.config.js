'use strict';

let fs = require('fs'),
  json = require('rollup-plugin-json'),
  postcss = require('postcss'),
  buble = require('rollup-plugin-buble'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  scss = require('rollup-plugin-scss'),
  //post CSS plugins:
  comments = require('postcss-discard-comments'),
  dupes = require('postcss-discard-duplicates'),
  cssnext = require('postcss-cssnext'),
  replace = require("rollup-plugin-replace");

const defaultExternal = [];

function getPlugins({
  external
}, withScss = true) {
  const scssPlugins = [scss({
      output(styles, styleNodes) {
        postcss([cssnext, comments, dupes])
          .process(styles)
          .then(result => {
            fs.writeFile('./dist/index.css', result.css);
          });
      }
    })];
  const defaultPlugins = [
    json(),
    buble({
      objectAssign: 'Object.assign',
      exclude: ["./node_modules/**/*"]
    }),
    // babel({
    //   presets: [
    //     ["env", {modules: false}],
    //     "es2015-rollup",
    //     "react"
    //   ],
    //   exclude: "./node_modules/**/*"
    // }),

    nodeResolve({
      browser: true,
      jsnext: true,
      main: true
    }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ];

  return withScss
    ? scssPlugins.concat(defaultPlugins)
    : defaultPlugins;
}

function getConfig({
  external = [],
  input = 'client/index.js'
}, withScss = true) {
  return {
    input,
    external: defaultExternal.concat(external),
    plugins: getPlugins({external}, withScss),
  };
}

module.exports = getConfig;