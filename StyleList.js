/* $Id$ */

function StyleList(match)
{
	this.match = match
	this.styles = []

	return this
}

StyleList.prototype.addStyle = function(name, value) {
	this.styles[name] = value
}

StyleList.prototype.build = function() {
	var t = ''

	for (var style in this.styles)
		t += style + ':' + this.styles[style] + ';'

	if (this.match != null)
		t = this.match + '{' + t + '}'

	return t
}
