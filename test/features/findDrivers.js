import cli from '../../lib/cli';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('find drivers', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    this._run = (data = {}) => {
      return cli(assign({
        findDrivers: true
      }, data));
    };
  });

  describe('amd', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/amd/js`;
    });

    describe('when given a build.json file', function() {
      it('finds the affected (aliased) drivers from the list of modules', function() {
        return this._run({
          filename: `${this._directory}/b.js`
        }).then(drivers => {
          assert.equal(drivers.length, 2);
          assert.equal(drivers[0], `${this._directory}/driver.js`);
          assert.equal(drivers[1], `${this._directory}/usesBAlias.js`);
        });
      });
    });
  });

  describe('es6', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/es6`;
    });

    it('finds the affected drivers', function() {
      return this._run({
        filename: `${this._directory}/bar.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });

    it('handles files in subdirectories', function() {
      return this._run({
        filename: `${this._directory}/lib/mylib.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });
  });

  describe('commonjs', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/commonjs`;
    });

    it('finds the affected drivers', function() {
      return this._run({
        filename: `${this._directory}/bar.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });

    it('handles files in subdirectories', function() {
      return this._run({
        filename: `${this._directory}/dir/subdir/baz.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });
  });

  describe('webpack', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/webpack`;
    });

    it('finds the affected drivers', function() {
      return this._run({
        filename: `${this._directory}/someModule.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });

    it('finds drivers affected by 3rd party library file changes', function() {
      return this._run({
        filename: `${this._directory}/node_modules/is-relative-path/index.js`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/index.js`);
      });
    });
  });

  // See https://github.com/mrjoelkemp/node-dependents-editor-backend/issues/31
  describe.skip('sass', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/sass`;
    });

    it('finds the affected top-level stylesheets', function() {
      return this._run({
        filename: `${this._directory}/_styles3.sass`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/styles.sass`);
      });
    });

    it('handles files in subdirectories', function() {
      return this._run({
        filename: `${this._directory}/themes/dark.sass`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/styles.sass`);
      });
    });
  });

  describe('scss', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/scss`;
    });

    it('finds the affected top-level stylesheets', function() {
      return this._run({
        filename: `${this._directory}/_mixins.scss`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/site.scss`);
      });
    });

    it('handles files in subdirectories', function() {
      return this._run({
        filename: `${this._directory}/vendors/_packages.scss`
      }).then(drivers => {
        assert.equal(drivers.length, 1);
        assert.equal(drivers[0], `${this._directory}/site.scss`);
      });
    });
  });
});
