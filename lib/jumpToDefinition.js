var fs = require('fs');
var Walker = require('node-source-walk');
var cabinet = require('filing-cabinet');
var debug = require('./debug');
var getClickedNode = require('./getClickedNode');

module.exports = function(options) {
  options = options || {};

  var filename = options.filename;
  var clickPosition = options.clickPosition.split(',').map(Number);

  if (clickPosition.length < 2) {
    throw new Error('Click position should be of the format row,col');
  }

  clickPosition = {
    line: clickPosition[0],
    column: clickPosition[1]
  };

  debug('parsed clickPosition: ', clickPosition);

  var ast;

  try {
    var walker = new Walker();
    ast = walker.parse(fs.readFileSync(filename, 'utf8'));
    options.ast = ast;
  } catch (e) {
    debug('could not read ' + filename);
    throw new Error('Could not read the file: ' + filename);
  }

  debug('finding the clicked node path');

  var clickedNode = getClickedNode(ast, clickPosition);

  if (!clickedNode) {
    debug('could not find the clicked node');
    return '';
  }

  debug('found clicked node: ' + clickedNode.type);

  if (clickedNode.type === 'StringLiteral') {
    // Note: not asserting that the string is part of an import
    // to avoid identifying CJS and AMD imports
    debug('clicked string is part of an import');
    options.partial = clickedNode.value;
    var resolvedPartial = cabinet(options);

    debug('cabinet resolved partial: ' + resolvedPartial);
    // We don't need to specify a location to jump to
    return resolvedPartial;
  }

  debug('searching for a declaration within the current file');
  var declaration = findDeclarationWithinCurrentFile(clickedNode, ast);

  if (!declaration) {
    debug('could not find a declaration for the clicked node within the current file');
    declaration = findDeclarationWithinImport(clickedNode);
  }

  if (!declaration) {
    debug('could not find a declaration for the clicked node in an import');
    return '';
  }

  debug('found a declaration node: ' + declaration.type);

  var identifier = findIdentifierWithinDeclaration(clickedNode, declaration);

  if (!identifier) {
    debug('clicked node identifier could not be found within the declaration');
    return '';
  }

  debug('found the identifier within the declaration');

  var location = identifier.loc.start;
  // +1 because editors start with 1 based column indexing
  var jumpTo = filename + ':' + location.line + ':' + (location.column + 1);

  debug('jumpTo result: ' + jumpTo);
  return jumpTo;
};

function findDeclarationWithinCurrentFile(clickedNode) {
  var declaratorChecks = {
    VariableDeclaration: function(node, identifier) {
      for (var i = 0, l = node.declarations.length; i < l; i++) {
        var declaration = node.declarations[i];
        if (declaration.type === 'VariableDeclarator' && declaration.id.name === identifier.name) {
          return true;
        }
      }

      return false;
    },
    FunctionDeclaration: function(node, identifier) {
      return node.id && node.id.name === identifier.name;
    }
  };

  var declaration = null;
  var walker = new Walker();

  if (clickedNode.type === 'Identifier') {
    if (clickedNode.parent.type === 'MemberExpression') {
      // Find the object then find the member definition with a matching name
    } else {
      debug('searching for a variable/function declaration');
      // Find a variable or function declaration with a matching name
      walker.moonwalk(clickedNode, function(node) {
        var checker = declaratorChecks[node.type];
        if (checker && checker(node, clickedNode)) {
          declaration = node;
          walker.stopWalking();
        }
      });
    }

  }

  return declaration;
}

function findDeclarationWithinImport(clickedNode, ast) {

}

function findIdentifierWithinDeclaration(clickedNode, declaration) {
  if (declaration.type === 'FunctionDeclaration') {
    return declaration.id;
  }

  if (declaration.type === 'VariableDeclaration') {
    for (var i = 0, l = declaration.declarations.length; i < l; i++) {
      var node = declaration.declarations[i];
      if (node.id && node.id.name === clickedNode.name) {
        return node;
      }
    }
  }

  return null;
}
