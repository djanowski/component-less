var async = require('async');
var path = require('path');
var less = require('less');
var fs = require('fs');


function isLess(filename) {
	var ext = path.extname(filename);
	if (ext === '.less') {
		return true;
	}
	return false;
}


module.exports = function (builder) {

	builder.hook('before styles', function (builder, callback) {
		if (!builder.config.styles) {
			return callback();
		}

    var config = builder.json().less;

    config.paths.push(builder.dir);

		var files = builder.config.styles;

		var parser = new less.Parser(config);

		async.forEach(files, function (file, cb) {

			var stylesheet = builder.path(file);
			var cssConfig = {};

			if (!fs.existsSync(stylesheet)) {
				return cb(new Error("'" + stylesheet + "'  doesn't exist."));
			}

			if (!cssConfig.compress && !isLess(file)) {
				return cb();
			}

			var data = fs.readFileSync(stylesheet, 'utf8');

			parser.parse(data, function (error, tree) {
				if (error) {
					return cb(error);
				}

				var css = tree.toCSS(cssConfig);


				var newFile = path.basename(file, path.extname(file)) + ((cssConfig.compress) ? '-compressed' : '') + '.css';
				builder.addFile('styles', newFile, css);
				builder.removeFile('styles', file);

				cb();
			});


		}, callback);

	});
};
