/* $Id$ */

var gBrowser = new Browser()

/* CSS constants to provide cross-browser compatibility. */
var CSS_VISIBILITY_HIDE, CSS_VISIBILITY_SHOW

if (gBrowser.isNN4) {
	CSS_VISIBILITY_HIDE = 'hide'
	CSS_VISIBILITY_SHOW = 'show'
} else {
	CSS_VISIBILITY_HIDE = 'hidden'
	CSS_VISIBILITY_SHOW = 'visible'
}

/*
 * Currently selected menu -- required because when
 * the mouse leaves the menu while dragging very quickly,
 * we lose the target object, so we must be able to save
 * it somewhere
 */
var gCurrentMenu = null

// Register (but don't override) event handlers
if (document.onmousemove)
{
	// Save old event handler
	var func = document.onmousemove

	document.onmousemove	= new Function(e)
	{
		MenuUpdateDrag(e)

		// Reinstate previous event handler
		func(e)
	}
} else {
	document.onmousemove = MenuUpdateDrag
}

if (document.onmouseup)
{
	var func = document.onmouseup

	document.onmouseup	= new Function(e)
	{
		MenuEndDrag(e)
		func(e)
	}
} else {
	document.onmouseup = MenuEndDrag
}

//var objReportWindow = window.open('about:blank','report')
/*
function report(str)
{
	var o = getObj('report')

	str = escapeHTML(String(str))
	str = String(str).replace(/&lt;r&gt;(.*?)&lt;\/r&gt;/g,'<span style="color:red">$1</span>')
	str = String(str).replace(/&lt;g&gt;(.*?)&lt;\/g&gt;/g,'<span style="color:green">$1</span>')
	str = String(str).replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g,'<span style="color:blue">$1</span>')
	str = String(str).replace(/&lt;p&gt;(.*?)&lt;\/p&gt;/g,'<span style="color:purple">$1</span>')
	str = String(str).replace(/&lt;o&gt;(.*?)&lt;\/o&gt;/g,'<span style="color:orange">$1</span>')
	str = String(str).replace(/&lt;y&gt;(.*?)&lt;\/y&gt;/g,'<span style="color:yellow">$1</span>')

	objReportWindow.document.body.innerHTML += str + '<br>'

	return
}
*/
function addSlashes(str)
{
	return String(str).replace(/[\'\"\\]/g,'\\' + RegExp.lastMatch)
}

function getObj(name)
{
	if (typeof name == 'object')
		return name

	var obj = null

	if (gBrowser.hasDOM)
	{
		obj = document.getElementById(name)

	} else if (gBrowser.hasDocumentAll) {

		obj = document.all(name)

	} else if (gBrowser.hasLayers) {

		obj = document.layers[name]
	}

	return obj
}

function unescapeHTML(str)
{
	return str
}

function escapeHTML(str)
{
	// Change the bare essentials for now
	str = str.replace(/&/g, '&amp;')
	str = str.replace(/</g, '&lt;')
	str = str.replace(/>/g, '&gt;')
	str = str.replace(/\'/g, '&apos;')
	str = str.replace(/\"/g, '&quot;')

	return str
}

function changeStyle(id, name, value)
{
	var obj = getObj(id)

	if (obj && obj.style)
		eval("obj.style." + name + " = '" + addSlashes(value) + "'")

	return
}

function getStyle(id, name)
{
	var obj = getObj(id)

	if (obj && obj.currentStyle)
		return eval("obj.style." + name)

	else if (obj && document.defaultView && document.defaultView.getCurrentStyle)
		return document.defaultView.getCurrentStyle(id, '').getPropertyValue(name)

	else if (obj && obj.style)
		return eval('obj.style.' + name)

	return null
}

function cancelBubbles(e)
{
	if (gBrowser.hasWndEvents())
		window.event.cancelBubble = true

	else if (e.stopPropagation)
		e.stopPropagation()

	return
}

function getProp(prop)
{
	var chunks	= prop.split(/\./)
	var ret		= true

	// We should watch out for numerical zero
	for (var i = 0; chunks[i] && ret; i++)
		ret = eval(arrayClone(chunks).splice(0, i).join('.'))

	return ret ? eval(prop) : null
}

function include(name)
{
}
