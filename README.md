<big><h1 align="center">postcss-variables-loader</h1></big>

<p align="center">
  <a href="https://npmjs.org/package/postcss-variables-loader">
    <img src="https://img.shields.io/npm/v/postcss-variables-loader.svg" alt="NPM Version">
  </a>

  <a href="http://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/postcss-variables-loader.svg" alt="License">
  </a>

  <a href="https://github.com/coobaha/postcss-variables-loader/issues">
    <img src="https://img.shields.io/github/issues/coobaha/postcss-variables-loader.svg" alt="Github Issues">
  </a>

  
  <a href="https://travis-ci.org/coobaha/postcss-variables-loader">
    <img src="https://img.shields.io/travis/coobaha/postcss-variables-loader.svg" alt="Travis Status">
  </a>
  

  
  <a href="https://coveralls.io/github/coobaha/postcss-variables-loader">
    <img src="https://img.shields.io/coveralls/coobaha/postcss-variables-loader.svg" alt="Coveralls">
  </a>
  
  
</p>

<p align="center"><big>
Allows you to share variables between CSS and JS with Webpack and HMR.
</big></p>

## Install

```sh
yard add --dev postcss-variables-loader
```

```sh
npm install --dev postcss-variables-loader
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
    loader: 'postcss-variables-loaderes5=1'
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
