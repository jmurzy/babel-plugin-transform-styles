import { transformFileSync } from 'babel-core'
import { expect } from 'chai'
import path from 'path'
import fs from 'fs'
import gulpUtil from 'gulp-util'
import gulpBabel from 'gulp-babel'

describe('transforms StyleSheet', () => {
  const transform = (filename, config = {}) =>
    transformFileSync(path.resolve(__dirname, filename), {
      babelrc: false,
      presets: [ 'es2015' ],
      plugins: [
        [ '../../src/index.js', config ]
      ]
    })

  it('replaces require statements with StyleSheet', () => {
    expect(transform('fixtures/require-css.js', {
      extensions: [ 'css' ]
    }).code).to.be.equal(`'use strict';

var styles = require('react-native').StyleSheet.create({
  "container": {
    "flex": 1,
    "justifyContent": "center",
    "alignItems": "center",
    "backgroundColor": "#F5FCFF",
    "margin": 0,
    "marginTop": 10,
    "marginRight": 5,
    "marginBottom": 10,
    "marginLeft": 5,
    "borderBottomWidth": StyleSheet.hairlineWidth,
    "shadowOpacity": 4,
    "shadowOffset": {
      "width": 2,
      "height": 4
    },
    "elevation": 1
  },
  "foo": {
    "flex": 1
  }
});`)
  })

  it('replaces import statements with StyleSheet', () => {
    expect(transform('fixtures/import-css.js', {
      extensions: [ 'css' ]
    }).code).to.be.equal(`'use strict';

var _styles = require('react-native').StyleSheet.create({
  "container": {
    "flex": 1,
    "justifyContent": "center",
    "alignItems": "center",
    "backgroundColor": "#F5FCFF",
    "margin": 0,
    "marginTop": 10,
    "marginRight": 5,
    "marginBottom": 10,
    "marginLeft": 5,
    "borderBottomWidth": StyleSheet.hairlineWidth,
    "shadowOpacity": 4,
    "shadowOffset": {
      "width": 2,
      "height": 4
    },
    "elevation": 1
  },
  "foo": {
    "flex": 1
  }
});

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }`)
  })

  it('replaces import statements with filename and then exports', () => {
    expect(transform('fixtures/import-export-css.js', {
      extensions: [ 'css' ]
    }).code).to.be.equal(`'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styles = undefined;

var _styles = require('react-native').StyleSheet.create({
  "container": {
    "flex": 1,
    "justifyContent": "center",
    "alignItems": "center",
    "backgroundColor": "#F5FCFF",
    "margin": 0,
    "marginTop": 10,
    "marginRight": 5,
    "marginBottom": 10,
    "marginLeft": 5,
    "borderBottomWidth": StyleSheet.hairlineWidth,
    "shadowOpacity": 4,
    "shadowOffset": {
      "width": 2,
      "height": 4
    },
    "elevation": 1
  },
  "foo": {
    "flex": 1
  }
});

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.styles = _styles2.default;`)
  })


  it('replaces import statement with StyleSheet via gulp', (cb) => {
    const stream = gulpBabel({
      babelrc: false,
      presets: [ 'es2015' ],
      plugins: [
        [ '../../src/index.js', {
          extensions: [ 'css' ]
        } ]
      ]
    })

    stream.on('data', (file) => {
      expect(file.contents.toString()).to.be.equal(`'use strict';

var _styles = require('react-native').StyleSheet.create({
  "container": {
    "flex": 1,
    "justifyContent": "center",
    "alignItems": "center",
    "backgroundColor": "#F5FCFF",
    "margin": 0,
    "marginTop": 10,
    "marginRight": 5,
    "marginBottom": 10,
    "marginLeft": 5,
    "borderBottomWidth": StyleSheet.hairlineWidth,
    "shadowOpacity": 4,
    "shadowOffset": {
      "width": 2,
      "height": 4
    },
    "elevation": 1
  },
  "foo": {
    "flex": 1
  }
});

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }`)
    })

    stream.on('end', cb)

    stream.write(new gulpUtil.File({
      cwd: __dirname,
      base: path.join(__dirname, 'fixtures'),
      path: path.join(__dirname, 'fixtures/import-css.js'),
      contents: fs.readFileSync(path.join(__dirname, 'fixtures/import-css.js'))
    }))

    stream.end()
  })

  it('throws error when import/require statements are empty', () => {
    expect(() => transform('fixtures/empty-require.js', {
      extensions: [ 'css' ]
    })).to
      .throw(/^.+: Found empty import from .+\.$/)

    expect(() => transform('fixtures/empty-import.js', {
      extensions: [ 'css' ]
    })).to
      .throw(/^.+: Found empty import from .+\.$/)
  })
})
