/* $Id$ */

function MenuItem(value,href)
{
	this.menu = null
	this.divDOMID = null
	this.value = value
	this.href = href
	this.styles = new Object()
	this.hoverStyles = new Object()

	return this
}

MenuItem.prototype.highlight = function() {
	// Dehighlight siblings
	for (var i in this.menu.items)
		if (this.menu.items[i].constructor == MenuItem &&
		    this.menu.items[i] != this) {
			this.menu.items[i].deHighlight()
		} else if (this.menu.items[i].constructor == Menu &&
			   this.menu.items[i].menuItem != this) {
			this.menu.items[i].menuItem.deHighlight()
			this.menu.items[i].hideMenu()
		}

	changeStyle(this.divDOMID, 'backgroundColor', this.hoverStyles.backgroundColor)
	changeStyle(this.divDOMID, 'color', this.hoverStyles.color)
}

MenuItem.prototype.deHighlight = function(obj) {
	changeStyle(this.divDOMID, 'backgroundColor', this.styles.backgroundColor)
	changeStyle(this.divDOMID, 'color', this.styles.color)
}

MenuItem.prototype.build = function() {
	var e = new HTMLElement('a', this.value)

	e.addAttribute('id', this.id)
	e.addAttribute('href', this.href)

	return e.build()
}

MenuItem.prototype.clone = function() {
	var item = new MenuItem(this.value, this.href)

	for (i in this)
		item[i] = this[i]

	return item
}

function MenuSpace()
{
	this.styles = new Object()

	return this
}
