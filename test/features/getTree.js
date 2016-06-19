import cli from '../../lib/cli';

import assign from 'object-assign';
import assert from 'assert';
import path from 'path';

describe('get dependency tree', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');

    this._assertSomeDependency = (dependency, tree = {}) => {
      const dependencies = Object.keys(tree);
      const foundSome = dependencies.some(file => file === dependency);

      if (!foundSome) {
        console.log('actual dependencies found: ', dependencies);
      }

      assert.ok(foundSome);
    };

    this._run = (data = {}) => {
      return cli(assign({
        getTree: true
      }, data));
    };
  });

  describe('es6', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/es6`;
    });

    it('returns the tree of the given file', function() {
      const filename = `${this._directory}/index.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/foo.js`, tree);
        this._assertSomeDependency(`${this._directory}/bar.js`, tree);
        this._assertSomeDependency(`${this._directory}/lib/mylib.js`, tree[`${this._directory}/foo.js`]);
      });
    });

    it('returns an empty object if a module has no dependencies', function() {
      const filename = `${this._directory}/lib/mylib.js`;

      return this._run({
        filename
      })
      .then(tree => {
        assert.deepEqual(tree[filename], {});
      });
    });

    it('returns the tree of files with jsx', function() {
      this._directory = `${this._fixturePath}/javascript/jsx`;
      const filename = `${this._directory}/index.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        assert.ok(tree[`${this._directory}/a.js`]);
      });
    });

    it('returns the tree of files with es7', function() {
      this._directory = `${this._fixturePath}/javascript/es7`;
      const filename = `${this._directory}/index.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        assert.ok(tree[`${this._directory}/a.js`]);
      });
    });
  });

  describe('amd', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/amd/js`;

      this._run = (data = {}) => {
        return cli(assign({
          config: path.resolve(this._directory, '../config.js'),
          getTree: true
        }, data));
      };
    });

    it('returns the tree of the given file', function() {
      const filename = `${this._directory}/driver.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/b.js`, tree);
        // See https://github.com/mrjoelkemp/node-module-lookup-amd/issues/8
        // this._assertSomeDependency(`${this._directory}/vendor/jquery.min.js`, tree);
        this._assertSomeDependency(path.resolve(this._directory, '../config.js'), tree[`${this._directory}/b.js`]);
      });
    });

    it('includes resolved, aliased modules', function() {
      const filename = `${this._directory}/usesBAlias.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/b.js`, tree);
        this._assertSomeDependency(path.resolve(this._directory, '../config.js'), tree[`${this._directory}/b.js`]);
      });
    });

    it('includes templates in the tree', function() {
      const filename = `${this._directory}/b.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(path.resolve(this._directory, '../templates/face.mustache'), tree);
      });
    });

    it('includes styles in the tree', function() {
      const filename = `${this._directory}/b.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(path.resolve(this._directory, '../styles/styles.css'), tree);
      });
    });

    it('returns an empty object if a module has no dependencies', function() {
      const filename = `${this._directory}/vendor/jquery.min.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        assert.deepEqual(tree, {});
      });
    });
  });

  describe('commonjs', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/javascript/commonjs`;
    });

    it('includes 3rd party dependencies', function() {
      const filename = `${this._directory}/index.js`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/foo.js`, tree);
        this._assertSomeDependency(`${this._directory}/bar.js`, tree);
        this._assertSomeDependency(`${this._directory}/node_modules/is-relative-path/index.js`, tree);

        const foo = tree[`${this._directory}/foo.js`];

        this._assertSomeDependency(`${this._directory}/dir/subdir/baz.js`, foo);
        this._assertSomeDependency(`${this._directory}/dir/subdir/baz.js`, tree[`${this._directory}/bar.js`]);
        this._assertSomeDependency(`${this._directory}/bar.js`, foo[`${this._directory}/dir/subdir/baz.js`]);
      });
    });

    it('returns an empty object if a module has no dependencies', function() {
      const filename = `${this._directory}/nodeps.js`;

      return this._run({
        filename
      })
      .then(tree => {
        assert.deepEqual(tree[filename], {});
      });
    });
  });

  describe('sass', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/sass`;
    });

    // See https://github.com/mrjoelkemp/node-dependents-editor-backend/issues/31
    it.skip('returns the tree of the given file', function() {
      const filename = `${this._directory}/styles.sass`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/themes/dark.sass`, tree);
        this._assertSomeDependency(`${this._directory}/styles2.sass`, tree);
        this._assertSomeDependency(`${this._directory}/_styles3.sass`, tree);
      });
    });

    it('returns an empty object if a module has no dependencies', function() {
      const filename = `${this._directory}/styles2.sass`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        assert.deepEqual(tree, {});
      });
    });
  });

  describe('scss', function() {
    beforeEach(function() {
      this._directory = `${this._fixturePath}/scss`;
    });

    it('returns the tree of the given file', function() {
      const filename = `${this._directory}/site.scss`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        this._assertSomeDependency(`${this._directory}/vendors/_packages.scss`, tree);
        this._assertSomeDependency(`${this._directory}/utils/_debug.scss`, tree);
        this._assertSomeDependency(`${this._directory}/utils/_mixins.scss`, tree);
        this._assertSomeDependency(`${this._directory}/_mixins.scss`, tree);
      });
    });

    it('returns an empty object if a module has no dependencies', function() {
      const filename = `${this._directory}/_mixins.scss`;

      return this._run({
        filename
      })
      .then(({[filename]: tree}) => {
        assert.deepEqual(tree, {});
      });
    });
  });
});
