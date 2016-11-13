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

## Install

```sh
yarn add --dev postcss-variables-loader
```

```sh
npm install --save-dev postcss-variables-loader
```


Hipster webpack config (with babel-loader)
```
loaders: [
  {
    test: /\.config.css$/,
    loader: 'babel-loader!postcss-variables-loader'
  }
]
```

ES5 webpack config
```
loaders: [
  {
    test: /\.config.css$/,
    loader: 'postcss-variables-loader?es5=1'
  }
]
```
## Usage

```

# config/colors.config.css
:root {
  --primaryColor: blue;
}



# component.css (works with pre-processors too)
@import 'config/colors.config.css' // via postcss-import for example

.component {
  color: var(--primaryColor);
}



# component.js
import colors from 'config/colors.config.css';

component.style.color = colors.primaryColor;
```

## License

- **MIT** : http://opensource.org/licenses/MIT
