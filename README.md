<big><h1 align="center">postcss-variables-loader</h1></big>

<p align="center">
  <a href="https://npmjs.org/package/postcss-variables-loader">
    <img src="https://img.shields.io/npm/v/postcss-variables-loader.svg" alt="NPM Version">
  </a>

  <a href="http://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/postcss-variables-loader.svg" alt="License">
  </a>

  <a href="https://github.com/Coobaha/postcss-variables-loader/issues">
    <img src="https://img.shields.io/github/issues/Coobaha/postcss-variables-loader.svg" alt="Github Issues">
  </a>

  
  <a href="https://travis-ci.org/Coobaha/postcss-variables-loader">
    <img src="https://img.shields.io/travis/Coobaha/postcss-variables-loader.svg" alt="Travis Status">
  </a>
  

  
  <a href="https://coveralls.io/github/Coobaha/postcss-variables-loader">
    <img src="https://img.shields.io/coveralls/Coobaha/postcss-variables-loader.svg" alt="Coveralls">
  </a>
  
  
</p>

<p align="center"><big>
Allows you to share variables between CSS and JS with Webpack and HMR.
</big></p>
<br>
This loader transforms special CSS files to JS modules.

* Shared variables between CSS and JS
* HMR friendly, CSS changes are applied on the fly.

To be more JS friendly loader will:

* strip `px` part from CSS px numbers
* convert dashes-case to camelCase
* check for runtime config mutations and access of missing keys (only in dev or es6 mode)

## Usage

```css
/* variables.config.css */

@custom-media --small-device (max-width: 480px))
:root {
  --primary-color: blue;
  --gutter: 30px;
}
```

```css
/* component.css  */

@import 'colors.config.css'

.component {
  color: var(--primary-color);
  margin: 0 var(--gutter);
}

@media (--small-device) {
  /* styles for small viewport */
}

```

```js
// component.js
import variables from 'colors.config.css';

console.log(variables);
/*
  variables = {
    primaryColor: 'blue';
    gutter: 30;
    smallDevice: '(max-width: 480px)'
  }
*/

component.style.color = variables.primaryColor;

function add5ToGutter() {
  return 5 + variables.gutter;
}
```


## Install

```sh
yarn add --dev postcss-variables-loader
```

```sh
npm install --save-dev postcss-variables-loader
```

**NB**: You need to process CSS somehow (eg [postcss](https://github.com/postcss/postcss))
 and imports inside css (eg via [postcss-import](https://github.com/postcss/postcss-import))


**Recommended webpack configuration**: 
`webpack.config.js` with babel-loader
```
loaders: [
  {
    test: /\.config.css$/,
    loader: 'babel-loader!postcss-variables-loader'
  },
 
  // dont forget to exclude *.config.css from other css loaders
  {
    test: /\.css$/,
    exclude: /\.config.css$/, 
    loader: 'css-loader!postcss-loader'
  }
]
```

## Options

if `production.env.NODE_ENV === 'development'` it will try to wrap config inside `Proxy` in runtime. 
It is used to guard from accidental mutations or accessing missing keys.
If you dont want this behaviour: pass `es5=1`:

`loader: 'postcss-variables-loader?es5=1'`

## License

- **MIT** : http://opensource.org/licenses/MIT
