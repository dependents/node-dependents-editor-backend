import cli from '../../lib/cli';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('find dependents', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    this._assertSomeDependent = (dependent, dependents) => {
      const foundSome = dependents.some(file => file === dependent);

      if (!foundSome) {
        console.log('dependents found: ', dependents);
      }

      assert.ok(foundSome);
    };

    this._run = (data = {}) => {
      return cli(assign({
        directory: this._directory,
        findDependents: true
      }, data));
    };
  });

  describe('sass', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/sass`;
    });

    it('finds all of the dependents of a module', function() {
      return this._run({
        filename: `${this._directory}/themes/dark.sass`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/styles.sass`, results);
      });
    });

    it('returns an empty list if there are no dependents on a module', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`
      }).then(results => {
        assert.equal(results.length, 0);
      });
    });
  });

  describe('scss', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/scss`;
    });

    it('finds all of the dependents of a module', function() {
      return this._run({
        filename: `${this._directory}/_mixins.scss`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/site.scss`, results);
        this._assertSomeDependent(`${this._directory}/vendors/_packages.scss`, results);
      });
    });

    it('returns an empty list if there are no dependents on a module', function() {
      return this._run({
        filename: `${this._directory}/site.scss`
      }).then(results => {
        assert.equal(results.length, 0);
      });
    });
  });

  describe('stylus', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/stylus`;
    });

    it('finds all of the dependents of a module', function() {
      return this._run({
        filename: `${this._directory}/utils/_functions.styl`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/site.styl`, results);
      });
    });

    it('finds the dependents of an index.styl file', function() {
      return this._run({
        filename: `${this._directory}/vendors/index.styl`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/site.styl`, results);
      });
    });

    it('finds the dependents of a css file', function() {
      return this._run({
        filename: `${this._directory}/vendors/foo.css`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/vendors/index.styl`, results);
        this._assertSomeDependent(`${this._directory}/site.styl`, results);
      });
    });

    it('returns an empty list if there are no dependents on a module', function() {
      return this._run({
        filename: `${this._directory}/site.styl`
      }).then(results => {
        assert.equal(results.length, 0);
      });
    });
  });

  describe('javascript', function() {

  });
});
