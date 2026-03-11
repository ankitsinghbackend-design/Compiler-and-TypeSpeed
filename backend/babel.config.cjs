module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: false
    }]
  ],
  assumptions: {
    setPublicClassFields: true
  },
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ]
    }
  }
};
