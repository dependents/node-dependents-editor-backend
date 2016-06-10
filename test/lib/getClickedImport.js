import getClickedImport from '../../lib/getClickedImport';
import assert from 'assert';
import path from 'path';

describe('lib/getClickedImport', function() {
  beforeEach(function() {
    this._fixturePath = path.resolve(__dirname, '../fixtures');
  });

  describe('when given a lookup position', function() {
    describe('for a line with a single string', function() {
      beforeEach(function() {
        this._fixture = 'import {SelectListView} from "atom-space-pen-views";';
      });

      describe('and the position collides with the start of the string', function() {
        it('returns the quoteless string', function() {
          const result = getClickedImport(this._fixture, 29);
          assert.equal(result, 'atom-space-pen-views');
        });
      });

      describe('and the position collides with the end of the string', function() {
        it('returns the quoteless string', function() {
          const result = getClickedImport(this._fixture, 50);
          assert.equal(result, 'atom-space-pen-views');
        });
      });

      describe('and the position collides within the string', function() {
        it('returns the quoteless string', function() {
          const result = getClickedImport(this._fixture, 32);
          assert.equal(result, 'atom-space-pen-views');
        });
      });

      describe('and the position does not collide', function() {
        it('returns the quoteless string anyway', function() {
          const result = getClickedImport(this._fixture, 12);
          assert.equal(result, 'atom-space-pen-views');
        });
      });

      describe('and the position is negative', function() {
        it('returns the quoteless string anyway', function() {
          const result = getClickedImport(this._fixture, -1);
          assert.equal(result, 'atom-space-pen-views');
        });
      });

      describe('and the position exceeds the length of the string', function() {
        it('returns the quoteless string anyway', function() {
          const result = getClickedImport(this._fixture, 100);
          assert.equal(result, 'atom-space-pen-views');
        });
      });
    });

    describe('for a line with multiple strings', function() {
      beforeEach(function() {
        this._fixture = 'define(["foo", "bar"], function(foo, bar) {';
      });

      describe('and the position collides with a string', function() {
        it('returns the quoteless string', function() {
          const result = getClickedImport(this._fixture, 16);
          assert.equal(result, 'bar');
        });
      });

      describe('and the position does not collide', function() {
        it('returns the first string', function() {
          const result = getClickedImport(this._fixture, 50);
          assert.equal(result, 'foo');
        });
      });

      describe('and the position is negative', function() {
        it('returns the first string', function() {
          const result = getClickedImport(this._fixture, -1);
          assert.equal(result, 'foo');
        });
      });

      describe('and the position exceeds the length of the string', function() {
        it('returns the first string', function() {
          const result = getClickedImport(this._fixture, 100);
          assert.equal(result, 'foo');
        });
      });
    });

    describe('for a line with no strings but space-delimited words', function() {
      beforeEach(function() {
        this._fixture = '@import styles.sass';
      });

      describe('and the position collides with the start of the word', function() {
        it('returns the word', function() {
          const result = getClickedImport(this._fixture, 9);
          assert.equal(result, 'styles.sass');
        });
      });

      describe('and the position collides with the end of the word', function() {
        it('returns the word', function() {
          const result = getClickedImport(this._fixture, 19);
          assert.equal(result, 'styles.sass');
        });
      });

      describe('and the position collides within the word', function() {
        it('returns the word', function() {
          const result = getClickedImport(this._fixture, 11);
          assert.equal(result, 'styles.sass');
        });
      });

      describe('and the position does not collide', function() {
        it('returns the first space-surrounded string', function() {
          const result = getClickedImport(this._fixture, 50);
          assert.equal(result, 'styles.sass');
        });
      });
    });
  });
});
