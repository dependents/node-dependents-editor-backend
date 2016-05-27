import assert from 'assert';
import path from 'path';
import Config from '../../lib/Config';

describe('lib/Config', function() {
  beforeEach(function() {
    this._config = new Config();

    const fixturePath = path.resolve(__dirname, '../fixtures');
    this._directory = `${fixturePath}/exclude`;
    this._deprc = `${this._directory}/.deprc`;
  });

  describe('when the js root is missing', function() {
    it('should default the main directory to the styles root', function() {
      this._config.load(`${this._directory}/noJSRoot.js`);
      assert.equal(this._config.directory, `${this._directory}/styles`);
    });

    describe('and the styles root is missing', function() {
      it('throws an error', function() {
        assert.throws(() => this._config.load(`${this._directory}/noRootsAtAll.js`));
      });
    });
  });

  describe('exclude', function() {
    it('should not throw on an exclude array', function() {
      assert.doesNotThrow(() => this._config.load(this._deprc));
    });

    it('should not throw on an exclude string', function() {
      assert.doesNotThrow(() => this._config.load(`${this._directory}/excludeString.js`));
    });

    it('should convert an exlude string to an array', function() {
      this._config.load(`${this._directory}/excludeString.js`);

      assert.ok(this._config.exclude instanceof Array);
      assert.equal(this._config.exclude[0], 'bin');
    });
  });
});
