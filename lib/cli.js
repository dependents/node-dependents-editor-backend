var Config = require('./Config');
var getPath = require('./getPath');
var getClickedImport = require('./getClickedImport');

var cabinet = require('filing-cabinet');
var findDependents = require('dependents');
var callers = require('callers');
var tree = require('dependency-tree');
var findDrivers = require('taxicab');

var q = require('q');
var path = require('path');
var debug = require('debug')('backend');

module.exports = function(program) {
  var deferred = q.defer();

  // Useful for consumers like Atom
  if (program.debug) {
    // TODO: Try setting process.env.DEBUG instead
    debug = console.log.bind(console);
  }

  var config;
  try {
    config = new Config();
    config.findAndLoad(path.dirname(program.filename));
    debug('loaded config', config);

  } catch (e) {
    debug('error when searching for deprc file: ' + e.message);
    deferred.reject(e.message);
    return deferred.promise;
  }

  var options = {
    directory: config.directory,
    filename: program.filename,
    exclude: config.exclude,
    config: config.requireConfig,
    webpackConfig: config.webpackConfig
  };

  debug('command options', options);

  if (program.lookup) {
    if (!program.lookupPosition) {
      options.partial = program.args[0].replace(/["|'|;]/g, '');
    } else {
      debug('given a lookup location: ', program.lookupPosition);
      options.partial = getClickedImport(program.args[0], Number(program.lookupPosition));
    }

    debug('performing a lookup with options: ', options);

    var result = cabinet(options);

    debug('lookup result: ' + result);
    deferred.resolve(result);

  } else if (program.findDependents) {
    debug('finding the dependents of the given file: ' + options.filename);

    findDependents(options, function(err, dependents) {
      if (err) {
        var msg = err.message || err;

        debug('error: ', msg);

        deferred.reject(msg);
        return;
      }

      debug('found the following dependents: ', dependents);
      deferred.resolve(dependents);
    });

  } else if (program.getPath) {
    deferred.resolve(getPath({
      filename: options.filename,
      directory: options.directory,
      stylesDirectory: config.stylesRoot
    }));

  } else if (program.findCallers) {
    options.functionName = program.args[0].replace(/["|'|;]/g, '');

    options.success = function(err, callers) {
      if (err) {
        deferred.reject(err.message || err);
      } else {
        deferred.resolve(callers);
      }
    };

    debug('finding the callers of "' + options.functionName + '" with options: ', options);

    callers(options);

  } else if (program.getTree) {
    options.root = options.directory;

    var results = tree(options);

    try {
      deferred.resolve(results);
    } catch (e) {
      deferred.reject(e.message);
    }

  } else if (program.findDrivers) {
    options.buildConfig = config.buildConfig;
    debug('build config: ' + options.buildConfig);

    options.success = function(err, drivers) {
      if (err) {
        deferred.reject(err.message || err);
      } else {
        deferred.resolve(drivers);
      }
    };

    findDrivers(options);

  } else if (program.getConfig) {
    deferred.resolve(config.toJSON());

  } else {
    deferred.reject('No valid command given');
  }

  return deferred.promise;
};
