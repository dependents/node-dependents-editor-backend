import cli from '../../lib/cli';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('get path', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    // This feature doesn't care about the language or module type
    // so the directory chosen holds no significance
    this._directory = `${this._fixturePath}/javascript/es6`;

    this._run = (data = {}) => {
      return cli(assign({
        getPath: true
      }, data));
    };
  });

  it('returns the path of the module in a partial format', function() {
    return this._run({
      filename: `${this._directory}/index.js`
    }).then(result => {
      assert.equal(result, 'index');
    });
  });

  it('handles files within subdirectories', function() {
    return this._run({
      filename: `${this._directory}/lib/mylib.js`
    }).then(result => {
      assert.equal(result, 'lib/mylib');
    });
  });

  it('can not handle files outside of the root of the deprc', function(done) {
    this._run({
      filename: `/Users/foo/lib/mylib.js`
    })
    .catch(message => {
      assert.equal(message, '.deprc file could not be found');
      done();
    });
  });

  it('works for a stylesheet that also has a js root defined', function() {
    this._directory = `${this._fixturePath}/javascript/amd`;

    return this._run({
      filename: `${this._directory}/styles/styles.css`
    }).then(result => {
      assert.equal(result, 'styles');
    });
  });

  it('works for a stylesheet in a subdir with a js root defined', function() {
    this._directory = `${this._fixturePath}/javascript/amd`;

    return this._run({
      filename: `${this._directory}/styles/subdir/styles2.css`
    }).then(result => {
      assert.equal(result, 'subdir/styles2');
    });
  });
});
