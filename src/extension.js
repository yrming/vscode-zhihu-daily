const ZhihuProvider = require('./zhihuProvider');
const ZhihuCommands = require('./zhihuCommand');

function activate(context) {
	new ZhihuProvider(context);
	new ZhihuCommands(context);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
