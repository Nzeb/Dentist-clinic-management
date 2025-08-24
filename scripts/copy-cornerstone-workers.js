const fs = require('fs-extra');
const path = require('path');

const cornerstoneWADOImageLoaderPath = path.dirname(require.resolve('cornerstone-wado-image-loader/package.json'));
const webWorkerPath = path.join(cornerstoneWADOImageLoaderPath, 'dist');
const publicPath = path.join(__dirname, '../public');

fs.copy(webWorkerPath, publicPath, {
  filter: (src) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      return true;
    }
    return path.basename(src).includes('cornerstoneWADOImageLoader');
  }
}).then(() => {
  console.log('Successfully copied cornerstone web workers.');
}).catch((err) => {
  console.error('Error copying cornerstone web workers:', err);
});
