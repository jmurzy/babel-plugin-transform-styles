# babel-plugin-transform-styles

This [Babel](https://github.com/babel/babel) [transoformation](https://babeljs.io/docs/plugins/) auto-generates React [StyleSheet](https://facebook.github.io/react-native/docs/stylesheet.html)s from import statements of CSS files at compile time.

[![CircleCI](https://img.shields.io/circleci/project/jmurzy/babel-plugin-transform-styles.svg)](https://circleci.com/gh/jmurzy/babel-plugin-transform-styles)
[![npm version](https://img.shields.io/npm/v/babel-plugin-transform-styles.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-styles)
[![npm](https://img.shields.io/npm/l/babel-plugin-transform-styles.svg)](https://github.com/jmurzy/babel-plugin-transform-styles/blob/master/LICENSE.md)

## Example

The following CSS file

```css
.container {
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #F5FCFF;
  margin: 10 5;
  border-bottom-width: hairline-width;
  -ios-shadow-opacity: 4;
  -ios-shadow-offset: 2 4;
  -android-elevation: 1;
}
```

when imported as follows

```js
import styles from '../styles.css';

<Container style={styles.container} />

```

will be transformed to

```js
var styles = StyleSheet.create({
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
  }
});
```

See the spec for [more examples](https://github.com/jmurzy/babel-plugin-transform-styles/blob/master/test/index.spec.js).

## Requirements
[Babel](https://github.com/babel/babel) v6 or higher.

## Installation

```sh
$ npm install babel-plugin-transform-styles
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [["transform-styles", {
                "extensions": ["css"],
              }]]
}
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: [['transform-styles', {
              extensions: ['css'],
            }]]
});
```

### Release Notes

* 0.0.2 Fix dependency issue
* 0.0.1 Initial release

### Contributing

Contributions are very welcome—bug fixes, features, documentation, tests. Just make sure the tests are passing.
