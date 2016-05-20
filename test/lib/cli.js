import assert from 'assert';
import path from 'path';
import cli from '../../lib/cli';

describe('lib/cli', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');
  });

  it('rejects if a deprc file was not found anywhere relative to the given file', function(done) {
    cli({
      filename: '/Users/foo/bar.js'
    }).catch(message => {
      assert.equal(message, '.deprc file could not be found');
      done();
    });
  });
});
