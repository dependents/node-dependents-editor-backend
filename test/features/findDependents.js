import cli from '../../lib/cli';
import Config from '../../lib/Config';

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

    it('finds dependents within the same directory', function() {
      return this._run({
        filename: `${this._directory}/styles2.sass`
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

    // See https://github.com/mrjoelkemp/node-dependents-editor-backend/issues/7
    it.skip('finds dependents of a star partial', function() {
      return this._run({
        filename: `${this._directory}/utils/_extraUnusedForStar.styl`
      }).then(results => {
        this._assertSomeDependent(`${this._directory}/site.styl`, results);
      });
    });
  });

  describe('javascript', function() {
    describe('es6', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/es6`;
      });

      it('finds the dependents of a module', function() {
        return this._run({
          filename: `${this._directory}/lib/mylib.js`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/foo.js`, results);
          this._assertSomeDependent(`${this._directory}/bar.js`, results);
        });
      });

      it('returns an empty list when there are no dependents', function() {
        return this._run({
          filename: `${this._directory}/index.js`
        }).then(results => {
          assert.equal(results.length, 0);
        });
      });

      it('still works for files that have jsx', function() {
        return this._run({
          filename: `${this._fixturePath}/javascript/jsx/index.js`
        }).then(results => {
          assert.equal(results.length, 0);
        });
      });

      it('does not throw on files that have async functions', function() {
        return this._run({
          filename: `${this._fixturePath}/javascript/es7/index.js`
        }).then(results => {
          assert.equal(results.length, 0);
        });
      });

      it('includes files that use the export ... from pattern', function() {
        return this._run({
          filename: `${this._directory}/baz.js`
        }).then(results => {
          assert.equal(results[0], `${this._directory}/exportsFrom.js`);
        });
      });
    });

    describe('commonjs', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/commonjs`;
      });

      it('finds the dependents of a module', function() {
        return this._run({
          filename: `${this._directory}/dir/subdir/baz.js`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/foo.js`, results);
          this._assertSomeDependent(`${this._directory}/bar.js`, results);
        });
      });

      it('returns an empty list when there are no dependents', function() {
        return this._run({
          filename: `${this._directory}/index.js`
        }).then(results => {
          assert.equal(results.length, 0);
        });
      });
    });

    describe('amd', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/amd/js`;

        this._run = (data = {}) => {
          return cli(assign({
            directory: this._directory,
            config: path.resolve(this._directory, '../config.js'),
            findDependents: true
          }, data));
        };
      });

      it('finds a minified dependent', function() {
        return this._run({
          filename: `${this._directory}/vendor/jquery.min.js`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/driver.js`, results);
        });
      });

      it('finds the dependents of an imported stylesheet', function() {
        return this._run({
          filename: path.join(this._directory, '../styles/styles.css')
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/b.js`, results);
        });
      });

      it('finds the dependents of a template', function() {
        return this._run({
          filename: path.join(this._directory, '../templates/face.mustache')
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/b.js`, results);
        });
      });

      it('finds the dependents of a non-aliased module', function() {
        return this._run({
          filename: `${this._directory}/b.js`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/driver.js`, results);
        });
      });

      it('finds the dependents of an aliased module', function() {
        return this._run({
          filename: `${this._directory}/b.js`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/usesBAlias.js`, results);
          assert.ok(results.length > 1);
        });
      });

      describe('when given a config with a baseUrl with a leading slash', function() {
        beforeEach(function() {
          this._directory = `${this._fixturePath}/javascript/amd`;
          this._deprc = new Config();
          this._deprc.load(`${this._directory}/.deprc`);
          this._deprc.requireConfig = `${this._directory}/configWithLeadingSlash.js`;
        });

        it('still finds the dependents', function() {
          return this._run({
            filename: `${this._directory}/js/vendor/jquery.min.js`,
            deprc: this._deprc
          }).then(results => {
            this._assertSomeDependent(`${this._directory}/js/driver.js`, results);
          });
        });
      });
    });

    describe('webpack', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/webpack`;
      });

      it('finds the dependents of a module', function() {
        return this._run({
          filename: `${this._directory}/someModule.js`
        }).then(results => {
          assert.equal(results.length, 2);
          this._assertSomeDependent(`${this._directory}/anotherDependent.js`, results);
          this._assertSomeDependent(`${this._directory}/index.js`, results);
        });
      });

      it('returns an empty list when there are no dependents', function() {
        return this._run({
          filename: `${this._directory}/index.js`
        }).then(results => {
          assert.equal(results.length, 0);
        });
      });

      it('finds the dependents of an imported stylesheet', function() {
        return this._run({
          filename: `${this._directory}/styles/styles.css`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/someModule.js`, results);
        });
      });

      it('finds the dependents of an imported template', function() {
        return this._run({
          filename: `${this._directory}/templates/foo.mustache`
        }).then(results => {
          this._assertSomeDependent(`${this._directory}/someModule.js`, results);
        });
      });

      describe('when the partial has a loader reference', function() {
        it('still registers the dependent', function() {
          return this._run({
            filename: `${this._directory}/templates/foo.mustache`
          }).then(results => {
            this._assertSomeDependent(`${this._directory}/someModule.js`, results);
            this._assertSomeDependent(`${this._directory}/anotherDependent.js`, results);
          });
        });
      });
    });
  });
});
