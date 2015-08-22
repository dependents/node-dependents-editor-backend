var cabinet = require('filing-cabinet');
var DependentsConfig = require('./DependentsConfig');

module.exports = function(program) {
  var deferred = q.deferred();

  var config;
  try {
    config = new Config();
    config.findAndLoad(path.dirname(program.filename));

  } catch(e) {
    deferred.reject(e.message);
  }

  var options = {
    directory: config.directory,
    excludes: config.excludes,
    requireConfig: config.requireConfig,
    webpackConfig: config.webpackConfig,
    target: program.args[0]
  };

  if (program.lookup) {
    deferred.resolve(lookup(options));
  }

  return deferred.promise();
};

function lookup(options) {
  return cabinet({
    partial: options.target,
    filename: options.filename,
    directory: options.directory,
    config: options.requireConfig
  })
}