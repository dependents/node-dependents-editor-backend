import mockfs from 'mock-fs';
import assert from 'assert';
import jumpToDefinition from '../../lib/jumpToDefinition';

describe('jump to definition', function() {
  describe('es6', function() {
    afterEach(function() {
      mockfs.restore();
    });

    it('throws when given an invalid click position tuple', function() {
      mockfs({
        'example.js': ''
      });

      assert.throws(() => {
        jumpToDefinition({
          filename: 'example.js',
          clickPosition: '4'
        });
      }, Error, 'Click position should be of the format row,col');
    });

    it('throws when given a file that cannot be found/read', function() {
      assert.throws(() => {
        jumpToDefinition({
          filename: 'nogood.js',
          clickPosition: '4,5'
        });
      }, Error, 'Could not read the file: nogood.js');
    });

    it('returns an empty string if the clicked node could not be found', function() {
      mockfs({
        'example.js': ''
      });

      const result = jumpToDefinition({
        filename: 'example.js',
        clickPosition: '4,5'
      });

      assert.equal(result, '');
    });

    describe('identifiers', function() {
      it('returns an empty string if a definition could not be found', function() {
        mockfs({
          'example.js': 'console.log(bar);'
        });

        const result = jumpToDefinition({
          filename: 'example.js',
          clickPosition: '1,13'
        });

        assert.equal(result, '');
      });

      describe('with a definition in the same file', function() {
        describe('when the definition is a variable declaration', function() {
          beforeEach(function() {
            mockfs({
              'single.js': 'var foo = 1;\nconsole.log(foo);',
              'multiple.js': 'var bar = 2, foo = 1;\nconsole.log(foo);',
              'funcExpression.js': 'var foo = function(){};\nconsole.log(foo);',
              'objDeclaration.js': 'var foo = {bar: function(){}};\nconsole.log(foo);',
              'objCall.js': 'var foo = {bar: function(){}};\nconsole.log(foo.bar());',
              'const.js': 'const foo = 1;\nconsole.log(foo);',
              'let.js': 'let foo = 1;\nconsole.log(foo);'
            });
          });

          it('finds the definition with a single declared variable', function() {
            const result = jumpToDefinition({
              filename: 'single.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'single.js:1:5');
          });

          it('finds the definition with mutiple declared vars', function() {
            const result = jumpToDefinition({
              filename: 'multiple.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'multiple.js:1:14');
          });

          it('finds the definition of a function expression', function() {
            const result = jumpToDefinition({
              filename: 'funcExpression.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'funcExpression.js:1:5');
          });

          it('finds the definition of an object literal', function() {
            const result = jumpToDefinition({
              filename: 'objDeclaration.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'objDeclaration.js:1:5');
          });

          it('finds the definition of an object literal in a member expression', function() {
            const result = jumpToDefinition({
              filename: 'objCall.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'objCall.js:1:5');
          });

          it('finds the definition of a const', function() {
            const result = jumpToDefinition({
              filename: 'const.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'const.js:1:7');
          });

          it('finds the definition of a let variable', function() {
            const result = jumpToDefinition({
              filename: 'let.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'let.js:1:5');
          });
        });

        describe('when the definition is a function declaration', function() {
          it('finds the definition of a sibling', function() {
            mockfs({
              'sibling.js': 'function foo(){}\nconsole.log(foo);'
            });

            const result = jumpToDefinition({
              filename: 'sibling.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'sibling.js:1:10');
          });

          it('finds the definition that is the immediate parent', function() {
            mockfs({
              'parent.js': 'function foo(){\nconsole.log(foo);\n}'
            });

            const result = jumpToDefinition({
              filename: 'parent.js',
              clickPosition: '2,13'
            });

            assert.equal(result, 'parent.js:1:10');
          });

          it('finds the definition that is higher up in scope', function() {
            mockfs({
              'higher.js': 'function bar(){};\nfunction foo(){\nconsole.log(bar);\n}'
            });

            const result = jumpToDefinition({
              filename: 'higher.js',
              clickPosition: '3,13'
            });

            assert.equal(result, 'higher.js:1:10');
          });
        });

        describe.skip('when the definition is a member of an object', function() {
          it('finds the definition of a function property', function() {
            mockfs({
              'property.js': 'var obj = {\nfoo: function(){}};\nconsole.log(obj.foo);'
            });

            const result = jumpToDefinition({
              filename: 'property.js',
              clickPosition: '3,17'
            });

            assert.equal(result, 'property.js:2:1');
          });

          it('finds the definition of a data property', function() {
            mockfs({
              'property.js': 'var obj = {\nfoo: 1}\nconsole.log(obj.foo);'
            });

            const result = jumpToDefinition({
              filename: 'property.js',
              clickPosition: '3,17'
            });

            assert.equal(result, 'property.js:2:1');
          });
        });
      });

      // TODO: Change these to look within the resolved import
      describe.skip('when a clicked identifier belongs to an import', function() {
        beforeEach(function() {
          mockfs({
            es6: {
              'importDeclaration.js': `import {bar} from './bar';\nconsole.log(bar);`,
              'importDeclarationLocal.js': `import {foo as bar} from './bar';\nconsole.log(bar);`,
              'importDeclarationMultiple.js': `import foo, {bar} from './bar';\nconsole.log(bar);`,
              'importDefaultDeclaration.js': `import bar from './bar';\nconsole.log(bar);`,
              'importNamespaceDeclaration.js': `import * as bar from './bar';\nconsole.log(bar);`
            }
          });
        });

        it('jumps to the starting location of the identifier', function() {
          const result = jumpToDefinition({
            filename: 'es6/importDeclaration.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/importDeclaration.js:1:9');
        });

        it('works for import default declarations', function() {
          const result = jumpToDefinition({
            filename: 'es6/importDefaultDeclaration.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/importDefaultDeclaration.js:1:8');
        });

        it('works for import namespace declarations', function() {
          const result = jumpToDefinition({
            filename: 'es6/importDefaultDeclaration.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/importDefaultDeclaration.js:1:8');
        });

        it('works for local renames of import declarations', function() {
          const result = jumpToDefinition({
            filename: 'es6/importDeclarationLocal.js',
            clickPosition: '2,14'
          });

          assert.equal(result, 'es6/importDeclarationLocal.js:1:16');
        });

        it('works for multiple imports within an import declaration', function() {
          const result = jumpToDefinition({
            filename: 'es6/importDeclarationMultiple.js',
            clickPosition: '2,14'
          });

          assert.equal(result, 'es6/importDeclarationMultiple.js:1:14');
        });
      });

      describe('when an identifer is defined above',function() {
        beforeEach(function() {
          mockfs({
            es6: {
              'var.js': `var bar = 1;\nconsole.log(bar);`,
              'let.js': `let bar = 1;\nconsole.log(bar);`,
              'const.js': `const bar = 1;\nconsole.log(bar);`
            }
          });
        });

        it('jumps to the variable declarator', function() {
          const result = jumpToDefinition({
            filename: 'es6/var.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/var.js:1:5');
        });

        it('works for let declarations', function() {
          const result = jumpToDefinition({
            filename: 'es6/let.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/let.js:1:5');
        });

        it('works for const declarations', function() {
          const result = jumpToDefinition({
            filename: 'es6/const.js',
            clickPosition: '2,13'
          });

          assert.equal(result, 'es6/const.js:1:7');
        });
      });

      describe('when an identifier is defined within the same function', function() {
        it('jumps to the variable declarator', function() {
          mockfs({
            'example.js': `function foo() {\nvar bar = 1;\nconsole.log(bar); }`
          });

          const result = jumpToDefinition({
            filename: 'example.js',
            clickPosition: '3,13'
          });

          assert.equal(result, 'example.js:2:5');
        });
      });
    });

    describe('import literals - dependency paths', function() {
      it('returns an empty string if a string is not part of an import', function() {
        const directory = __dirname;

        mockfs({
          [directory]: {
            'example.js': 'console.log("bar");'
          }
        });

        const result = jumpToDefinition({
          filename: `${directory}/example.js`,
          clickPosition: '1,15',
          directory
        });

        assert.equal(result, '');
      });

      describe('when the string is part of an import default specifier', function() {
        it('returns the resolved partial name', function() {
          const directory = __dirname + '/example';

          mockfs({
            [directory]: {
              'index.js': 'import foo from "./foo";',
              'foo.js': 'export default 1;'
            }
          });

          const result = jumpToDefinition({
            filename: `${directory}/index.js`,
            clickPosition: '1,20',
            directory
          });

          assert.equal(result, `${directory}/foo.js`);
        });
      });

      describe('when the string is part of an import specifier', function() {
        it('returns the resolved partial name', function() {
          const directory = __dirname + '/example';

          mockfs({
            [directory]: {
              'index.js': 'import {foo} from "./foo";',
              'foo.js': 'export default 1;'
            }
          });

          const result = jumpToDefinition({
            filename: `${directory}/index.js`,
            clickPosition: '1,23',
            directory
          });

          assert.equal(result, `${directory}/foo.js`);
        });
      });

      describe('when the string is part of an import namespace specifier', function() {
        it('returns the resolved partial name', function() {
          const directory = __dirname + '/example';

          mockfs({
            [directory]: {
              'index.js': 'import * as foo from "./foo";',
              'foo.js': 'export default 1;'
            }
          });

          const result = jumpToDefinition({
            filename: `${directory}/index.js`,
            clickPosition: '1,26',
            directory
          });

          assert.equal(result, `${directory}/foo.js`);
        });
      });
    });
  });
});
