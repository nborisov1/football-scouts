module.exports = {
  presets: [
    // Use next/babel preset for Next.js components
    [
      'next/babel',
      {
        'preset-env': {
          targets: {
            // Support both browser and node environments
            browsers: ['last 2 versions'],
            node: 'current'
          }
        }
      }
    ]
  ],
  env: {
    // Specific configuration for Jest test environment
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }
  }
}
