import assign from 'object-assign';
import assert from 'assert';
import path from 'path';
import tmpDir from 'os-tmpdir';
import fileExists from 'file-exists';
import rewire from 'rewire';
import q from 'q';

const cli = rewire('../../lib/cli');

describe('get dependency tree pic', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    this._tmpDirectory = tmpDir();
    this._imagePath = `${this._tmpDirectory}/foo.jpg`;
    this._directory = `${this._fixturePath}/javascript/es6`;
  });

  it('generates an image for the given file\'s dependency tree', function() {
    return cli({
      getTreePic: this._imagePath,
      filename: `${this._directory}/index.js`
    }).then(imagePath => {
      assert.equal(imagePath, this._imagePath);
      assert.ok(fileExists(imagePath));
    });
  });

  describe('when the user does not have graphviz installed', function() {
    it('rejects with the appropriate error', function(done) {
      const someErrorMessage = 'error';

      const revert = cli.__set__('treePic', () => {
        return q.fcall(() => {
          throw new Error(someErrorMessage);
        });
      });

      cli({
        getTreePic: this._imagePath,
        filename: `${this._directory}/index.js`
      }).catch(({message}) => {
        assert.equal(message, someErrorMessage);
        revert();
        done();
      });
    });
  });
});
