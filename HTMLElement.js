/* $Id$ */

function HTMLElement(name, value)
{
	this.name = name
	this.value = value
	this.styles = new StyleList()
	this.attributes = []

	return this
}

HTMLElement.prototype.addStyle = function(name, value) {
	this.styles.addStyle(name, value)
}

HTMLElement.prototype.addAttribute = function(name, value) {
	this.attributes[name] = value
}

HTMLElement.prototype.setValue = function(value) {
	this.value = value
}

HTMLElement.prototype.build = function(escape) {
	var html = '', t = ''

	if (escape == null)
		escape = false

	html += '<' + this.name

	// Build styles
	var styleAttribute = this.styles.build()

	if (styleAttribute.length)
		this.addAttribute('style', styleAttribute)

	// Build attributes
	for (var attribute in this.attributes) {
		html	+= ' '
			+ attribute
			+ '="'

		if (this.attributes[attribute] == null) {
			html += attribute
		} else {
			if (escape) {
				html += escapeHTML(this.attributes[attribute])
			} else {
				html += this.attributes[attribute]
			}
		}

		html += '"'
	}

	// Finish tag (<tag /> or <tag>value</tag>)
	if (this.value || this.name == 'div')
		html += '>' + (this.value || '') + '</' + this.name
	else
		html += ' /'

	html += '>'

	return html
}
