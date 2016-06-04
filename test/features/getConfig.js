import cli from '../../lib/cli';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('get config', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');
    this._directory = `${this._fixturePath}/javascript/amd`;

    this._run = (data = {}) => {
      return cli(assign({
        getConfig: true
      }, data));
    };
  });

  it('returns the parsed contents of the found deprc file', function() {
    return this._run({
      filename: `${this._directory}/js/b.js`,
    }).then(config => {
      assert.equal(config.directory, `${this._directory}/js`);
      assert.equal(config.stylesRoot, `${this._directory}/styles`);
      assert.equal(config.webpackConfig, '');
      assert.equal(config.requireConfig, `${this._directory}/config.js`);
      assert.equal(config.buildConfig, `${this._directory}/build.json`);
      assert.deepEqual(config.exclude, []);
    });
  });
});
