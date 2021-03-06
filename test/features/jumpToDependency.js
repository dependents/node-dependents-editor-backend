import cli from '../../lib/cli';
import Config from '../../lib/Config';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('partial lookup', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    this._run = (data = {}) => {
      return cli(assign({
        lookup: true
      }, data));
    };
  });

  describe('positional lookup', function() {
    describe('when given a line of text and a clicked position within that text', function() {
      it('finds and resolves the relevant import', function() {
        const directory = `${this._fixturePath}/javascript/es6`;

        return this._run({
          lookupPosition: 18,
          filename: `${directory}/index.js`,
          args: ['import bar from \'./bar\';']
        }).then(result => {
          assert.equal(result, `${directory}/bar.js`);
        });
      });
    });

    describe('when given a line of padded text and a clicked position within that text', function() {
      it('finds and resolves the relevant import', function() {
        const directory = `${this._fixturePath}/javascript/es6`;

        return this._run({
          lookupPosition: 23,
          filename: `${directory}/index.js`,
          args: ['      import bar from \'./bar\';']
        }).then(result => {
          assert.equal(result, `${directory}/bar.js`);
        });
      });
    });
  });

  describe('sass', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/sass`;
    });

    it('resolves non-underscored partials that have underscored file names', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['styles3.sass']
      }).then(result => {
        assert.equal(result, `${this._directory}/_styles3.sass`);
      });
    });

    it('resolves underscored partials that have underscored filenames', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['_styles3.sass']
      }).then(result => {
        assert.equal(result, `${this._directory}/_styles3.sass`);
      });
    });

    it('resolves partials without an explicit extension', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['styles3']
      }).then(result => {
        assert.equal(result, `${this._directory}/_styles3.sass`);
      });
    });

    it('resolves partials in subdirectories', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['themes/dark']
      }).then(result => {
        assert.equal(result, `${this._directory}/themes/dark.sass`);
      });
    });

    it('resolves doubly-quoted partials', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['"themes/dark"']
      }).then(result => {
        assert.equal(result, `${this._directory}/themes/dark.sass`);
      });
    });

    it('resolves singly-quoted partials', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['\'themes/dark\'']
      }).then(result => {
        assert.equal(result, `${this._directory}/themes/dark.sass`);
      });
    });

    it('resolves partials with a trailing semicolon', function() {
      return this._run({
        filename: `${this._directory}/styles.sass`,
        args: ['styles3;']
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

  describe('stylus', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/stylus`;
    });

    it('resolves .css partials', function() {
      return cli({
        filename: `${this._directory}/vendors/index.styl`,
        args: ['foo.css'],
        lookup: true
      }).then(result => {
        assert.equal(result, `${this._directory}/vendors/foo.css`);
      });
    });

    it('resolves partials in the same directory', function() {
      return cli({
        filename: `${this._directory}/site.styl`,
        args: ['secondary'],
        lookup: true
      }).then(result => {
        assert.equal(result, `${this._directory}/secondary.styl`);
      });
    });

    it('resolves partials in subdirectories', function() {
      return cli({
        filename: `${this._directory}/site.styl`,
        args: ['vendors/foo.css'],
        lookup: true
      }).then(result => {
        assert.equal(result, `${this._directory}/vendors/foo.css`);
      });
    });

    it('resolves extensionless partials', function() {
      return cli({
        filename: `${this._directory}/site.styl`,
        args: ['utils/_functions'],
        lookup: true
      }).then(result => {
        assert.equal(result, `${this._directory}/utils/_functions.styl`);
      });
    });

    it('resolves partials with extensions', function() {
      return cli({
        filename: `${this._directory}/site.styl`,
        args: ['utils/_functions.styl'],
        lookup: true
      }).then(result => {
        assert.equal(result, `${this._directory}/utils/_functions.styl`);
      });
    });

    describe('when given a directory as a partial', function() {
      it('resolves to the index.styl file of a directory', function() {
        return cli({
          filename: `${this._directory}/site.styl`,
          args: ['vendors'],
          lookup: true
        }).then(result => {
          assert.equal(result, `${this._directory}/vendors/index.styl`);
        });
      });
    });
  });

  describe('js', function() {
    describe('amd', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/amd/js`;

        this._run = (data = {}) => {
          return cli(assign({
            directory: this._directory,
            lookup: true
          }, data));
        };
      });

      it('resolves aliased partials', function() {
        return this._run({
          filename: `${this._directory}/driver.js`,
          args: ['foobar']
        }).then(result => {
          assert.equal(result, `${this._directory}/b.js`);
        });
      });

      it('resolves unaliased partials', function() {
        return this._run({
          filename: `${this._directory}/driver.js`,
          args: ['./b']
        }).then(result => {
          assert.equal(result, `${this._directory}/b.js`);
        });
      });

      it('resolves relative partials', function() {
        return this._run({
          filename: `${this._directory}/b.js`,
          args: ['../config']
        }).then(result => {
          assert.equal(result, path.resolve(`${this._directory}`, '../') + '/config.js');
        });
      });

      it('resolves template imports', function() {
        return this._run({
          filename: `${this._directory}/b.js`,
          args: ['hgn!templates/face']
        }).then(result => {
          assert.equal(result, path.resolve(`${this._directory}`, '../templates') + '/face.mustache');
        });
      });

      it('resolves css imports', function() {
        return this._run({
          filename: `${this._directory}/b.js`,
          args: ['css!styles/styles']
        }).then(result => {
          assert.equal(result, path.resolve(`${this._directory}`, '../styles') + '/styles.css');
        });
      });

      it('resolves aliased partials to minified files', function() {
        return this._run({
          filename: `${this._directory}/driver.js`,
          args: ['jquery']
        }).then(result => {
          assert.equal(result, `${this._directory}/vendor/jquery.min.js`);
        });
      });

      it('resolves a partial from an outside test directory', function() {
        return this._run({
          filename: `${this._directory}/test/someFile.js`,
          args: ['b']
        }).then(result => {
          assert.equal(result, `${this._directory}/b.js`);
        });
      });

      describe('when given a baseUrl with a leading slash', function() {
        beforeEach(function() {
          this._deprc = new Config();
          this._deprc.load(`${this._fixturePath}/javascript/amd/.deprc`);
          this._deprc.requireConfig = `${this._directory}/innerConfig.json`;
        });

        it('still resolves the partial', function() {
          return this._run({
            filename: `${this._directory}/driver.js`,
            deprc: this._deprc,
            args: ['b']
          }).then(result => {
            assert.equal(result, `${this._directory}/b.js`);
          });
        });
      });
    });

    describe('es6', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/es6`;

        this._run = (data = {}) => {
          return cli(assign({
            directory: this._directory,
            lookup: true
          }, data));
        };
      });

      it('resolves relative partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./foo']
        }).then(result => {
          assert.equal(result, `${this._directory}/foo.js`);
        });
      });

      it('resolves relative partials within a subdirectory', function() {
        return this._run({
          filename: `${this._directory}/lib/mylib.js`,
          args: ['../foo']
        }).then(result => {
          assert.equal(result, `${this._directory}/foo.js`);
        });
      });

      it('resolves subdirectory partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./lib/mylib']
        }).then(result => {
          assert.equal(result, `${this._directory}/lib/mylib.js`);
        });
      });

      it('resolves files that contain es7', function() {
        this._directory = `${this._fixturePath}/javascript/es7`;
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./a']
        }).then(result => {
          assert.equal(result, `${this._directory}/a.js`);
        });
      });

      it('resolves files that contain jsx', function() {
        this._directory = `${this._fixturePath}/javascript/jsx`;
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./a']
        }).then(result => {
          assert.equal(result, `${this._directory}/a.js`);
        });
      });

      it('handles es6 transpiled to cjs imports', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['is-relative-path']
        }).then(result => {
          assert.equal(result, `${this._directory}/node_modules/is-relative-path/index.js`);
        });
      });

      it('resolves for a top level config partial', function() {
        return this._run({
          filename: `${this._directory}/components/common/index.js`,
          args: ['config']
        }).then(result => {
          assert.equal(result, `${this._directory}/config.js`);
        });
      });

      describe('when a partial implicitly references the index.js file of a subdir', function() {
        it('still resolves the partial', function() {
          return this._run({
            filename: `${this._directory}/usesSubdirIndex.js`,
            args: ['components/common']
          }).then(result => {
            assert.equal(result, `${this._directory}/components/common/index.js`);
          });
        });
      });

      describe('when a file outside of the root references a partial within the root', function() {
        it('still resolves the partial', function() {
          this._directory = `${this._directory}/subproject`;

          return this._run({
            filename: `${this._directory}/test/index.spec.js`,
            args: ['module']
          }).then(result => {
            assert.equal(result, `${this._directory}/src/module.js`);
          });
        });
      });

      describe('when a file outside of the root references a partial within the root that has an index.js file', function() {
        it('still resolves the partial', function() {
          this._directory = `${this._directory}/subproject`;

          return this._run({
            filename: `${this._directory}/test/index.spec.js`,
            args: ['components/Sweet']
          }).then(result => {
            assert.equal(result, `${this._directory}/src/components/Sweet/index.js`);
          });
        });
      });
    });

    describe('commonjs', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/commonjs`;
      });

      it('resolves same directory partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./foo']
        }).then(result => {
          assert.equal(result, `${this._directory}/foo.js`);
        });
      });

      it('resolves sub-directory partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./dir/subdir/baz']
        }).then(result => {
          assert.equal(result, `${this._directory}/dir/subdir/baz.js`);
        });
      });

      it('resolves npm package partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['is-relative-path']
        }).then(result => {
          assert.equal(result, `${this._directory}/node_modules/is-relative-path/index.js`);
        });
      });

      it('resolves a directory to its index.js file', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['dir']
        }).then(result => {
          assert.equal(result, `${this._directory}/dir/index.js`);
        });
      });

      it('resolves .. partials to the parent index.js file', function() {
        return this._run({
          filename: `${this._directory}/dir/subdir/baz.js`,
          args: ['../']
        }).then(result => {
          assert.equal(result, `${this._directory}/dir/index.js`);
        });
      });
    });

    describe('webpack', function() {
      beforeEach(function() {
        this._directory = `${this._fixturePath}/javascript/webpack`;

        this._run = (data = {}) => {
          return cli(assign({
            directory: this._directory,
            webpackConfig: `${this._fixturePath}/javascript/webpack/webpack.config.js`,
            lookup: true
          }, data));
        };
      });

      it('resolves aliased partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['R']
        }).then(result => {
          assert.equal(result, `${this._directory}/node_modules/is-relative-path/index.js`);
        });
      });

      it('resolves unaliased partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./someModule']
        }).then(result => {
          assert.equal(result, `${this._directory}/someModule.js`);
        });
      });

      it('resolves template partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['hgn!./templates/foo.mustache']
        }).then(result => {
          assert.equal(result, `${this._directory}/templates/foo.mustache`);
        });
      });

      it('resolves template partials without the loader prefix', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./templates/foo.mustache']
        }).then(result => {
          assert.equal(result, `${this._directory}/templates/foo.mustache`);
        });
      });

      it('resolves text partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['text!./templates/foo.mustache']
        }).then(result => {
          assert.equal(result, `${this._directory}/templates/foo.mustache`);
        });
      });

      it('resolves text partials without the loader prefix', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./templates/foo.mustache']
        }).then(result => {
          assert.equal(result, `${this._directory}/templates/foo.mustache`);
        });
      });

      it('resolves style partials', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['css!./styles/styles.css']
        }).then(result => {
          assert.equal(result, `${this._directory}/styles/styles.css`);
        });
      });

      it('resolves style partials without the loader prefix', function() {
        return this._run({
          filename: `${this._directory}/index.js`,
          args: ['./styles/styles.css']
        }).then(result => {
          assert.equal(result, `${this._directory}/styles/styles.css`);
        });
      });
    });
  });
});
