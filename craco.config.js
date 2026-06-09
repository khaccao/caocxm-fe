const CracoLessPlugin = require('craco-less');
const path = require('path');

module.exports = {
  plugins: [{ plugin: CracoLessPlugin }],
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  typescript: {
    enableTypeChecking: true /* (default value) */,
  },
};
