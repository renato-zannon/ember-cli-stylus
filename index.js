var StylusCompiler = require('broccoli-stylus-single');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var merge = require('merge');

function StylusPlugin(optionsFn) {
  this.name = 'ember-cli-stylus';
  this.ext = 'styl';

  this.optionsFn = optionsFn;
};

StylusPlugin.prototype.toTree = function(tree, inputPath, outputPath, inputOptions) {
  var options = merge({}, this.optionsFn(), inputOptions);

  var trees = [tree];
  if (options.includePaths) trees = trees.concat(options.includePaths);

  var paths = options.outputPaths;
  var outputTrees = Object.keys(paths).map(function(file) {
    var output = paths[file];
    var input = path.join(inputPath, file + '.styl');
    var optionsForTree = merge({}, options);

    if (optionsForTree.sourceMap) {
      optionsForTree.sourceComments = 'map';
      optionsForTree.sourceMap = output + '.map';
    }

    return new StylusCompiler(trees, input, output, options);
  });

  return mergeTrees(outputTrees);
};

module.exports = {
  name: 'ember-cli-stylus',

  stylusOptions: function() {
    var env = process.env.EMBER_ENV;
    var options = (this.app && this.app.options && this.app.options.stylusOptions) || {};

    if ((options.sourceMap === undefined) && (env == 'development')) {
      options.cache = false;
      options.sourceMap = {
        inline: true
      };
    }

    return options;
  },

  setupPreprocessorRegistry: function(type, registry) {
    registry.add('css', new StylusPlugin(this.stylusOptions.bind(this)));
  },

  included: function(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    this.app = app;
  }
};
