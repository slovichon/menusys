/* $Id$ */

function Browser()
{
	this.hasDOM = document.getElementById
	this.hasImages = document.images
	this.hasLayers = document.layers
	this.hasDocumentAll = document.all

	/*
	 * Some browsers' `width' CSS attribute corresponds
	 * to the actual container width, while in others it
	 * inappropriately includes the container width and
	 * nearby attributes, such as padding and borders.
	 */
	this.hasCorrectSpacing = true

	/* The following should not be used. */
	this.isIE = navigator.appName == 'Microsoft Internet Explorer'
	this.isNN4 = navigator.appName == 'Netscape' &&
		     parseInt(window.navigator.appVersion) == 4

	return this
}

Browser.prototype.width = function() {
	if (window.innerWidth) {
		return window.innerWidth
	} else if (document.body &&
		   document.body.parentElement &&
		   document.body.parentElement.clientWidth) {
		return document.body.parentElement.clientWidth
	} else if (document.body && document.body.clientWidth) {
		return document.body.clientWidth
	}

	return null
}

Browser.prototype.height = function() {
	if (window.innerWidth) 	{
		return window.innerHeight
	} else if (document.body &&
		   document.body.parentElement &&
		   document.body.parentElement.clientHeight) {
		return document.body.parentElement.clientHeight
	} else if (document.body && document.body.clientWidth) {
		return document.body.clientHeight
	}
}

Browser.prototype.mouseX = function(e) {
	if (e && e.mouseX) {
		return e.mouseX
	} else if (e && e.pageX) {
		return e.pageX
	} else if (gBrowser.hasWndEvents()) {
		return window.event.clientX
	}
}

Browser.prototype.mouseY = function(e) {
	if (e && e.mouseY) {
		return e.mouseY
	} else if (e && e.pageY) {
		return e.pageY
	} else if (gBrowser.hasWndEvents()) {
		return window.event.clientY
	}
}

Browser.prototype.offsetX = function(e) {
	if (gBrowser.hasWndEvents())
		return window.event.offsetX
}

Browser.prototype.offsetY = function(e) {
	if (gBrowser.hasWndEvents())
		return window.event.offsetY
}

Browser.prototype.hasFilters = function() {
	return document.body && document.body.filters
}

Browser.prototype.hasWndEvents = function() {
	return window.event
}
