import assert from 'assert';
import path from 'path';
import cli from '../../lib/cli';
import sinon from 'sinon';

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

  it('rejects if no supported command was supplied', function(done) {
    cli({
      filename: `${this._fixturePath}/javascript/es6/index.js`
    }).catch(message => {
      assert.equal(message, 'No valid command given');
      done();
    });
  });

  describe('.print', function() {
    beforeEach(function() {
      this._console = sinon.stub(console, 'log');
    });

    afterEach(function() {
      this._console.restore();
    });

    it('logs the output to the console', function() {
      cli.print('some result');
      assert.ok(this._console.calledWith('some result'));
    });

    it('works with an array result', function() {
      cli.print(['some result']);
      assert.ok(this._console.calledWith('some result'));
    });

    it('logs objects as strings', function() {
      const result = {foo: 'bar'};
      cli.print(result);
      assert.ok(this._console.calledWith(JSON.stringify(result)));
    });
  });
});
