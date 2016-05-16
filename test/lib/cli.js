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

    describe('scss', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/scss`;
      });

      it('resolves extensionless partials', function() {
        return cli({
          filename: `${this._directory}/site.scss`,
          directory: this._directory,
          args: ['vendors/_packages'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/vendors/_packages.scss`);
        });
      });

      it('resolves non-underscored partials that map to an underscored filename', function() {
        return cli({
          filename: `${this._directory}/site.scss`,
          directory: this._directory,
          args: ['vendors/packages'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/vendors/_packages.scss`);
        });
      });

      it('resolves partials with quotes and a trailing semicolon', function() {
        return cli({
          filename: `${this._directory}/site.scss`,
          directory: this._directory,
          args: ['"vendors/_packages.scss";'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/vendors/_packages.scss`);
        });
      });

      it('resolves relative partials', function() {
        return cli({
          filename: `${this._directory}/vendors/_packages.scss`,
          directory: this._directory,
          args: ['../mixins'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/_mixins.scss`);
        });
      });

      describe('when a partial\'s name matches a file in its directory and parent directory', function() {
        it('resolves to the file in its directory', function() {
          return cli({
            filename: `${this._directory}/utils/_debug.scss`,
            directory: this._directory,
            args: ['mixins'],
            lookup: true
          }).then(result => {
            assert.equal(result, `${this._directory}/utils/_mixins.scss`);
          });
        });
      });
    });
  });
});
