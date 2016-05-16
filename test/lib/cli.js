import assert from 'assert';
import path from 'path';
import cli from '../../lib/cli';

describe('lib/cli', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');
  });

  describe('partial lookup', function() {
    describe('sass', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/sass`;
      });

      it('resolves non-underscored partials that have underscored file names', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['styles3.sass'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/_styles3.sass`);
        });
      });

      it('resolves underscored partials that have underscored filenames', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['_styles3.sass'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/_styles3.sass`);
        });
      });

      it('resolves partials without an explicit extension', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['styles3'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/_styles3.sass`);
        });
      });

      it('resolves partials in subdirectories', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['themes/dark'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/themes/dark.sass`);
        });
      });

      it('resolves doubly-quoted partials', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['"themes/dark"'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/themes/dark.sass`);
        });
      });

      it('resolves singly-quoted partials', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['\'themes/dark\''],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/themes/dark.sass`);
        });
      });

      it('resolves partials with a trailing semicolon', function() {
        return cli({
          filename: `${this._directory}/styles.sass`,
          directory: this._directory,
          args: ['styles3;'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/_styles3.sass`);
        });
      });
    });
  });
});
