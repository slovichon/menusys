/*
 * Browser object to probe supported faetures
 * of the user's browser
 */
function Browser()
{
	this.hasDOM		= document.getElementById
	this.hasImages		= document.images
	this.hasLayers		= document.layers
	this.hasDocumentAll	= document.all

	/*
	 * Some browsers' `width' CSS attribute corresponds
	 * to *actual* container width, while in others it
	 * inappropriately includes the container width and
	 * nearby attributes, such as padding and borders
	 */
	this.hasCorrectSpacing	= true

	this.isIE		= navigator.appName == 'Microsoft Internet Explorer'

	this.isNN4		=	navigator.appName == 'Netscape' &&
					parseInt(window.navigator.appVersion) == 4

	return this
}

Browser.prototype.width		= function()
{
	if (window.innerWidth)
	{
		return window.innerWidth

	} else if (	document.body &&
			document.body.parentElement &&
			document.body.parentElement.clientWidth) {

		return document.body.parentElement.clientWidth

	} else if (document.body && document.body.clientWidth) {

		return document.body.clientWidth
	}

	return null
}

Browser.prototype.height	= function()
{
	if (window.innerWidth)
	{
		return window.innerHeight

	} else if (	document.body &&
			document.body.parentElement &&
			document.body.parentElement.clientHeight) {

		return document.body.parentElement.clientHeight

	} else if (document.body && document.body.clientWidth) {

		return document.body.clientHeight
	}
}

Browser.prototype.mouseX	= function(e)
{
	if (e && e.mouseX)
	{
		return e.mouseX

	} else if (e && e.pageX) {

		return e.pageX

	} else if (gBrowser.hasWndEvents()) {

		return window.event.clientX
	}
}

Browser.prototype.mouseY	= function(e)
{
	if (e && e.mouseY)
	{
		return e.mouseY

	} else if (e && e.pageY) {

		return e.pageY

	} else if (gBrowser.hasWndEvents()) {

		return window.event.clientY
	}
}

Browser.prototype.offsetX	= function(e)
{
	if (gBrowser.hasWndEvents())
		return window.event.offsetX
}

Browser.prototype.offsetY	= function(e)
{
	if (gBrowser.hasWndEvents())
		return window.event.offsetY
}

Browser.prototype.hasFilters	= function()
{
	return document.body && document.body.filters
}

Browser.prototype.hasWndEvents	= function()
{
	return window.event
}

var gBrowser = new Browser()

/*
 * CSS constants to provide cross-browser
 * compatibility
 */
var	kCSSVisibilityHide,
	kCSSVisibilityShow

if (gBrowser.isNN4)
{
	kCSSVisibilityHide = 'hide'
	kCSSVisibilityShow = 'show'
} else {
	kCSSVisibilityHide = 'hidden'
	kCSSVisibilityShow = 'visible'
}

function Menu(name,menuItem)
{
	this.name		= name
	this.domID		= 'menu' + name
	this.menuItem		= menuItem
	this.title		= null
	this.styles		= []
	this.items		= []
	this.parent		= null
	this.timeout		= null
	this.drag		= false
	this.allowDrag		= true
	this.mouseXCache	= null
	this.mouseYCache	= null
	this.timeoutInterval	= 100

	this.tweenTime		= null
	this.tweenSmooth	= null

	this.leftChild		= false

	this.blankImageURI	= null
	this.alwaysVisible	= false

	return this
}

// Adds a `spacer' menu item
Menu.prototype.addSpace = function()
{
	var menuSpace		= new MenuSpace()

	menuSpace.styles.height	= 1
	menuSpace.styles.margin	= 1
	menuSpace.menu		= this

	this.addItem(menuSpace)

	return
}

Menu.prototype.addItem = function(obj)
{
	obj.menu = this

	this.items[this.items.length++] = obj

	return
}

Menu.prototype.addSubMenu = function(menu)
{
	menu.parentMenu		= this
	menu.menuItem.menu	= this
	menu.styles.zIndex	= (this.styles.zIndex || 0) + 5
	menu.styles.visibility	= kCSSVisibilityHide

	// These will get changed on show() (and reposition())
	menu.styles.left	= 0
	menu.styles.top		= 0

	this.addItem(menu)

	return
}

Menu.prototype.isVisible = function()
{
	return getStyle(this.domID,'visibility') == kCSSVisibilityShow
}

Menu.prototype.isHidden = function()
{
	return getStyle(this.domID,'visibility') == kCSSVisibilityHide
}

Menu.prototype.hideMenu = function()
{
	// Hide child menus
	for (var i in this.items)
		if (this.items[i].constructor == Menu)
		{
			this.items[i].hideMenu()
			this.items[i].menuItem.deHighlight()
		}

	if (!this.alwaysVisible && getStyle(this.domID,'visibility') != kCSSVisibilityHide)
	{
		if (gBrowser.hasFilters() && this.styles.filter)
			for (var i = 0; i < getObj(this.domID).filters.length; i++)
				getObj(this.domID).filters[i].apply()

		changeStyle(this.domID,'visibility',kCSSVisibilityHide)

		if (gBrowser.hasFilters() && this.styles.filter)
			for (var i = 0; i < getObj(this.domID).filters.length; i++)
				getObj(this.domID).filters[i].play()
	}

	return
}

/*
 * Time wrapper to allow user to leave a menu to
 * move to a child menu without having both
 * disappear
 */
Menu.prototype.hide = function()
{
	this.timeout = window.setTimeout(this.name + '.hideMenu()',this.timeoutInterval)

	return
}

// Clears the timeout to hide a menu
Menu.prototype.clear = function()
{
	if (this.timeout)
	{
		window.clearTimeout(this.timeout)
		this.timeout = null
	}

	return
}

Menu.prototype.show = function()
{
	// Clear the timeout that would otherwise hide the menu
	this.clear()

	// Show parent menus
	if (this.parentMenu)
		this.parentMenu.show()

	// Hide siblings
	if (this.parentMenu)
		for (var i in this.parentMenu.items)
			if (this.parentMenu.items[i].constructor == Menu && this.parentMenu.items[i] != this)
			{
				this.parentMenu.items[i].hideMenu()
				this.parentMenu.items[i].menuItem.deHighlight()
			}

	if (getStyle(this.domID,'visibility') != kCSSVisibilityShow)
	{
		// Sync child menus
		this.reposition()

		if (gBrowser.hasFilters() && this.styles.filter)
			for (var i = 0; i < getObj(this.domID).filters.length; i++)
				getObj(this.domID).filters[i].apply()

		changeStyle(this.domID,'visibility',kCSSVisibilityShow)

		if (gBrowser.hasFilters() && this.styles.filter)
			for (var i = 0; i < getObj(this.domID).filters.length; i++)
				getObj(this.domID).filters[i].play()
	}

	return
}

Menu.prototype.build = function()
{
	var	html		= '',	// Generated output
		xHTML		= '',	// External HTML
		e			// Temporary element object

	// Calculate menu height
	this.styles.height	= (this.styles.borderTopHeight			|| 0)
				+ (this.styles.borderBottomHeight		|| 0)

	// Adjust for title bar
	if (this.title)
		this.styles.height	+=	(this.titleBorderTopHeight	|| 0)
					+	(this.titleBorderBottomHeight	|| 0)
					+	(this.titlePaddingTop		|| 0)
					+	(this.titlePaddingBottom	|| 0)
					+	this.titleHeight

	// The height depends on all the menu items
	for (i in this.items)
	{
		var item = this.items[i]

		if (item.constructor == Menu)
			item = item.menuItem

		this.styles.height += item.styles.height

		// Don't count last item spacer
		if (i != this.items.length - 1)
			 this.styles.height += (item.styles.space || 0)
	}

	if (this.styles.height > gBrowser.height())
	{
		// Serious hack -- have to shrink the menu and add scroll up/down buttons
	}

	// Temporary function to generate output for border images
	var fGenImage = function(menu,pos)
	{
		if (eval('menu.styles.border' + pos + 'Image'))
		{
			var img = new HTMLElement('img')
			with (e)
			{
				addAttribute('src',	eval('menu.styles.border' + pos + 'Image'))
				addAttribute('border',	'0')
				addAttribute('alt',	'')
				addAttribute('hspace',	'0')
				addAttribute('vspace',	'0')
			}

			return img.build()
		}

		return ''
	}

	// Temporary function to generate output for item/menu borders
	var fGenBorder = function(menu,pos,item,id)
	{
		var html = ''

		// Top/Bottom left image
		if (pos == 'Top' || pos == 'Bottom')
			html += fGenImage(menu,pos + 'Left')

		var e = new HTMLElement('div')
		with (e)
		{
			addAttribute('id',id)

			/*
			 * Some browser won't display elements with
			 * empty values correctly, e.g., <tag></tag>,
			 * so we'll just throw a dummy image inside
			 */
			var eImage = new HTMLElement('img')
			eImage.addAttribute('src',(menu.blankImageURI || null))

			if (pos == 'Left' || pos == 'Right')
			{
				addStyle('width',(eval('menu.styles.border' + pos + 'Width') || 0) + 'px')
				addStyle('height',item.styles.height + 'px')
				//addStyle('display','inline')
				addStyle('float',pos.toLowerCase())
//				addStyle('clear','both')
				addStyle('vertical-align','top')

				eImage.addAttribute('width',eval('menu.styles.border' + pos + 'Width' || 0) + 'px')
			} else {
				addStyle('width',item.styles.width + 'px')
				addStyle('font-size','0px')
				addStyle('height',(eval('menu.styles.border' + pos + 'Height') || 0) + 'px')

				eImage.addAttribute('width',item.styles.width + 'px')
			}

			eImage.addAttribute('height',item.styles.height + 'px')

			setValue(eImage.build())

			if (eval('menu.styles.border' + pos + 'BackgroundImage'))
				addStyle('background-image','url(' + eval('menu.styles.border' + pos + 'BackgroundImage') + ')')

			if (eval('menu.styles.border' + pos + 'Color'))
				addStyle('background-color',eval('menu.styles.border' + pos + 'Color'))
		}

		html += e.build()

		// Top/Bottom right image
		if (pos == 'Top' || pos == 'Bottom')
			html += fGenImage(menu,pos + 'Right')

		return html
	}

	// Temporary function for verbose output
	var fComment = function(str)
	{
		return ''
//		return '\n<!-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ' + str + ' @@@@@@@@@@@@@@@@@@@@@@@@@@@@@ -->\n'
	}

	// Dummy objects to simulate items for top/bottom borders
	var dummytop		= new Object()
	var dummybot		= new Object()

	dummytop.styles		= new Object()
	dummybot.styles		= new Object()

	dummytop.styles.height	= this.styles.borderTopHeight
	dummybot.styles.height	= this.styles.borderBottomHeight

	if (gBrowser.hasCorrectSpacing)
	{
		dummytop.styles.width	=	this.styles.width -
						(this.styles.paddingLeft	|| 0) -
						(this.styles.paddingRight	|| 0) -
						(this.styles.borderLeftWidth	|| 0) -
						(this.styles.borderRightWidth	|| 0)
		dummybot.styles.width	= dummytop.styles.width
	} else {
		dummytop.styles.width	= this.styles.width
		dummybot.styles.width	= dummytop.styles.width
	}

	// Top border
	html += fGenBorder(this,'Top',dummytop,this.domID + 'BorderTop')

	for (var i = 0; this.items[i]; i++)
	{
		var	t		= '',
			item		= this.items[i],
			domID		= this.domID + 'Item' + i,
			t_subMenu	= '',	// Temporary sub-menu output
			t_onMouseOver	= '',	// Temporary onmouseover output
			t_onMouseOut	= ''	// Temporary onmouseout output

		switch (item.constructor)
		{
			case Menu:
			{
				xHTML	+=	fComment('Start sub-menu')
					+	item.build()
					+	fComment('End sub-menu')

				item.menuItem.divDOMID	= domID

				t_onMouseOver	= item.name + '.clear();'
						+ item.name + '.show();'
						+ this.name + '.items[' + i + '].menuItem.highlight();'

				t_onMouseOut	= item.name + '.clear();'
						+ item.name + '.hide();'
						+ this.name + '.items[' + i + '].menuItem.deHighlight();'

				// Let the MenuItem case handle this, as it will be identical
				item = item.menuItem.clone()

				// For the `expand'/sub menu denoter
				if (item.subMenuMarkerImageURI)
				{
					var eImage = new HTMLElement('img')
					eImage.addAttribute('src',item.subMenuMarkerImageURI)
					eImage.addAttribute('border',0)
					eImage.addStyle('float','right')
					eImage.addAttribute('vspace',item.subMenuMarkerImageVSpace || 0)

					item.value = eImage.build() + item.value
				}
			}

			case MenuItem:
			{
				// Calculate the width/height of menu item
				var innerWidth	=	this.styles.width -
							(this.styles.borderLeftWidth	|| 0) -
							(this.styles.borderRightWidth	|| 0)

				var innerHeight	=	item.styles.height -
							(item.styles.borderTopHeight	|| 0) -
							(item.styles.borderBottomHeight	|| 0)

				if (gBrowser.hasCorrectSpacing)
				{
					innerWidth -=	(item.styles.paddingLeft	|| 0) +
							(item.styles.paddingRight	|| 0)

					innerHeight -=	(item.styles.paddingTop		|| 0) +
							(item.styles.paddingBottom	|| 0)
				}

				item.divDOMID = domID

				/*
				 * `t_subMenu' will either hold the
				 * output of the generated sub menu if
				 * our item is actually a sub menu or `'
				 */
				e = new HTMLElement('div',item.build() + t_subMenu)
				with (e)
				{
					addAttribute('id',domID)
					addStyle('width',innerWidth + 'px')
					addStyle('height',innerHeight + 'px')
//					addStyle('display','inline')
					addStyle('vertical-align','top')
					addStyle('cursor',item.styles.cursor)

					t	= 'if (' + this.name + '.items[' + i + '].highlight)'
						+ '{'
						+	this.name + '.items[' + i + '].highlight();'
						+ '}'
						+ t_onMouseOver
//						+ 'cancelBubbles(event);'
					addAttribute('onmouseover',t)

					t	= 'if (' + this.name + '.items[' + i + '].deHighlight)'
						+ '{'
						+	this.name + '.items[' + i + '].deHighlight();'
						+ '}'
						+ t_onMouseOut
//						+ 'cancelBubbles(event);'
					addAttribute('onmouseout',t)

					/*
					 * We need cancelBubbles() to prevent
					 * distraction from extensions
					 */
					t	= "window.location = '" + item.href + "';"
						+ 'cancelBubbles(event);'
					addAttribute('onclick',t)

					if (item.styles.paddingLeft)
						addStyle('padding-left',item.styles.paddingLeft + 'px')

					if (item.styles.paddingRight)
						addStyle('padding-right',item.styles.paddingRight + 'px')

					if (item.styles.paddingTop)
						addStyle('padding-top',item.styles.paddingTop + 'px')

					if (item.styles.paddingBottom)
						addStyle('padding-bottom',item.styles.paddingBottom + 'px')

					if (item.styles.fontSize)
						addStyle('font-size',item.styles.fontSize + 'px')

					if (item.styles.fontFamily)
						addStyle('font-family',item.styles.fontFamily)

					if (item.styles.backgroundColor)
						addStyle('background-color',item.styles.backgroundColor)
				}

				html	+=
					 fComment('Start menu item')

					// Left border
					+ fGenBorder(this,'Left',item,domID + 'BorderLeft')

					// Right border
					+ fGenBorder(this,'Right',item,domID + 'BorderRight')

					// MenuItem content
					+ e.build(false)

					+ fComment('End menu item')

				break
			}

			case MenuSpace:	// Item is a menu space
			{
				// NOTE - Temporary fix
				html += new HTMLElement('hr').build()

				break
			}

			default:
			{
				report('Unknown menu item type in menu creation: ' + item.constructor)
			}
		}

		// Spacer (for all items except the last)
		if (i != this.items.length - 1 && item.styles.space)
		{
			// Dummy image content
			e = new HTMLElement('img')
			e.addAttribute('src',this.blankImageURI)
			e.addAttribute('height',item.styles.space + 'px')

			// Start space
			e = new HTMLElement('div',e.build())
			with (e)
			{
				addAttribute('id',this.domID + 'Item' + i + 'Border')

				addStyle('width',this.styles.width + 'px')
				addStyle('height',item.styles.space + 'px')
				addStyle('background-color',item.styles.spaceColor)
			}

			html	+=	fComment('Start space')
				+	e.build()
				+	fComment('End space')
			// End space

		}
	}

	// Bottom border
	html += fGenBorder(this,'Bottom',dummybot,this.domID + 'BorderBottom')

	// Menu title
	if (this.title)
	{
		e = new HTMLElement('div',this.title)

		// Install event handlers for dragging
		if (this.allowDrag)
		{
			with (e)
			{
				addAttribute
				(
					'onmousedown',
					  this.name + '.initDrag(event);'
					+ 'cancelBubbles(event);'
				)
							
				addAttribute
				(
					'onmousemove',
					  this.name + '.moveMenu(event);'
					+ 'cancelBubbles(event);'
				)
							
				addAttribute('onmouseup',	this.name + '.drag = false;')
				addAttribute('onmouseout',	this.name + '.moveMenu(event);')
				addAttribute('onselectstart',	'return false;')
			}
		}

		e.addStyle('font-family',			this.titleFontFamily)
		e.addStyle('font-size',				this.titleFontSize + 'px')
		e.addStyle('cursor',				this.titleCursor)

		e.addStyle('padding-top',			(this.titlePaddingTop		|| 0) + 'px')
		e.addStyle('padding-left',			(this.titlePaddingLeft		|| 0) + 'px')
		e.addStyle('padding-right',			(this.titlePaddingRight		|| 0) + 'px')
		e.addStyle('padding-bottom',			(this.titlePaddingBottom	|| 0) + 'px')

		if (this.titleBorderTopHeight)
		{
			e.addStyle('border-top-width',		(this.titleBorderTopHeight	|| 0) + 'px')
			e.addStyle('border-top-style',		 this.titleBorderTopStyle	|| 'solid')
			e.addStyle('border-top-color',		 this.titleBorderTopColor	|| 'black')
		}

		if (this.titleBorderLeftWidth)
		{
			e.addStyle('border-left-width',		(this.titleBorderLeftWidth	|| 0) + 'px')
			e.addStyle('border-left-style',		 this.titleBorderLeftStyle	|| 'solid')
			e.addStyle('border-left-color',		 this.titleBorderLeftColor	|| 'black')
		}

		if (this.titleBorderRightWidth)
		{
			e.addStyle('border-right-width',	(this.titleBorderRightWidth	|| 0) + 'px')
			e.addStyle('border-right-style',	 this.titleBorderRightStyle	|| 'solid')
			e.addStyle('border-right-color',	 this.titleBorderRightColor	|| 'black')
		}

		if (this.titleBorderBottomHeight)
		{
			e.addStyle('border-bottom-width',	(this.titleBorderBottomHeight	|| 0) + 'px')
			e.addStyle('border-bottom-style',	 this.titleBorderBottomStyle	|| 'solid')
			e.addStyle('border-bottom-color',	 this.titleBorderBottomColor	|| 'black')
		}

		html	= fComment('Start menu title')
			+ e.build()
			+ fComment('End menu title')
			+ html
	}

	// Outside container
	e = new HTMLElement('div',html)
	with (e)
	{
		addAttribute('id',	this.domID)
		addStyle('visibility',	this.styles.visibility)

		if (gBrowser.hasCorrectSpacing)
		{
			/*
			 * In this case, 'width' is deceiving --
			 * the 'width' we refer to is the *total*
			 * width, and the 'width' as CSS  knows it
			 * is *just* the content container width --
			 * not including padding/borders/etc.
			 */
			addStyle
			(
				'width',
				(
					this.styles.width -
					(this.styles.borderLeftWidth	|| 0) -
					(this.styles.borderRightWidth	|| 0) -
					(this.styles.paddingLeft	|| 0) -
					(this.styles.paddingRight	|| 0)
				) + 'px'
			)
			addStyle
			(
				'height',
				(
					this.styles.height -
					(this.styles.borderTopHeight	|| 0) -
					(this.styles.borderBottomHeight	|| 0) -
					(this.styles.paddingTop		|| 0) -
					(this.styles.paddingBottom	|| 0)
				) + 'px'
			)
		} else {
			addStyle('width',	this.styles.width + 'px')
			addStyle('height',	this.styles.height + 'px')
		}

		addStyle('z-index',	this.styles.zIndex)
		addStyle('position',	'absolute')
		addStyle('top',		this.styles.top + 'px')
		addStyle('left',	this.styles.left + 'px')

		addAttribute
		(	
			'onmouseover',
			  this.name + '.show();'
			+ 'if (' + this.name + '.menuItem)'
			+ '{'
			+ 	this.name + '.menuItem.highlight();'
			+ '}'
		)

		addAttribute
		(
			'onmouseout',
			  this.name + '.hide();'
			+ 'if (' + this.name + '.menuItem)'
			+ '{'
			+ 	this.name + '.menuItem.deHighlight();'
			+ '}'
		)

		if (this.styles.filter && gBrowser.hasFilters())
			addStyle('filter',this.styles.filter)

		if (this.styles.backgroundColor)
			addStyle('background-color',this.styles.backgroundColor)

		if (this.styles.backgroundImage)
			addStyle('background-image','url(' + this.styles.backgroundImage + ')')
	}

	html = e.build()
/*
	html	=	fComment('Start menu')

		// Tabbing looks good during debugging
		+	html.replace(/\n/g,'\n\t')
		+	fComment('End menu')
*/
	return html + xHTML
}

{
	/*
	 * Currently selected menu -- required because when
	 * the mouse leaves the menu while dragging very quickly,
	 * we lose the target object, so we must be able to save
	 * it somewhere
	 */
	var gCurrentMenu = null

	function updateDrag(e)
	{
		/*
		 * If there's a menu currently being dragged, update
		 * its location
		 */
		if (gCurrentMenu)
			gCurrentMenu.moveMenu(e)

		return
	}

	function endDrag()
	{
		if (gCurrentMenu)
		{
			gCurrentMenu.drag	= false
			gCurrentMenu		= null
		}

		return
	}

	Menu.prototype.initDrag = function(e)
	{
		gCurrentMenu 	= this

		this.drag 	= true

		this.mouseXCache = gBrowser.mouseX(e) - parseInt(getStyle(this.domID,'left')) + 2
		this.mouseYCache = gBrowser.mouseY(e) - parseInt(getStyle(this.domID,'top')) + 2

		return
	}
}

// Register (but don't override) event handlers
if (document.onmousemove)
{
	// Save old event handler
	var func = document.onmousemove

	document.onmousemove	= new Function(e)
	{
		updateDrag(e)

		// Reinstate previous event handler
		func(e)
	}
} else {
	document.onmousemove = updateDrag
}

if (document.onmouseup)
{
	var func = document.onmouseup

	document.onmouseup	= new Function(e)
	{
		endDrag(e)
		func(e)
	}
} else {
	document.onmouseup = endDrag
}

Menu.prototype.tween = function(x,y,time,smoothness)
{
	if (this.tweenTimeout)
	{
		window.clearTimeout(this.tweenTimeout)

		this.tweenTimeout = null

		return
	}

	var objLeft	= parseInt(getStyle(this.domID,'left'))
	var objTop	= parseInt(getStyle(this.domID,'top'))

	if (objLeft == x && objTop == y)
		return

	var diffX = x - objLeft
	var diffY = y - objTop

	var dispX,dispY
	var smooth = smoothness / 100

	dispX = diffX > 0 ? Math.ceil(smooth * diffX) : Math.floor(smooth * diffX)
	dispY = diffY > 0 ? Math.ceil(smooth * diffY) : Math.floor(smooth * diffY)

	changeStyle(this.domID,'left',	(objLeft + dispX) + 'px')
	changeStyle(this.domID,'top',	(objTop  + dispY) + 'px')

	// Reposition children menus
	for (var i in this.items)
		if (this.items[i].constructor == Menu && this.items[i].isVisible())
			this.items[i].reposition()

	this.tweenTimeout = 	window.setTimeout
				(
					// Reset tweening from timing out
					this.name + '.tweenTimeout = null;' +
					this.name + '.tween(' + x + ',' + y + ',' + time + ',' + smoothness + ')',
					time
				)

	return
}

Menu.prototype.moveMenu = function(e)
{
	if (!this.drag)
		return

	var destX	= 0
	var destY	= 0

	// Update x coordinates
	if (gBrowser.mouseX(e) - this.mouseXCache < 0)
		destX = 0

	else if (gBrowser.mouseX(e) + this.styles.width - this.mouseXCache > gBrowser.width())
		destX = gBrowser.width() - this.styles.width

	else
		destX = gBrowser.mouseX(e) - this.mouseXCache

	// Update y coordinates
	if (gBrowser.mouseY(e) - this.mouseYCache < 0)
		destY = 0

	else if (gBrowser.mouseY(e) + this.styles.height - this.mouseYCache > gBrowser.height())
		destY = gBrowser.height() - this.styles.height

	else
		destY = gBrowser.mouseY(e) - this.mouseYCache

	changeStyle(this.domID,'left',	destX + 'px')
	changeStyle(this.domID,'top',	destY + 'px')

	// Move children
	for (var i in this.items)
		if (this.items[i].constructor == Menu)
			this.items[i].reposition()

	return
}

Menu.prototype.reposition = function()
{
	if (!this.parentMenu)
		return

	var destX = parseInt(getStyle(this.parentMenu.domID,'left'))

	if (destX + this.parentMenu.styles.width - 10 + this.styles.width < gBrowser.width())
		destX += this.parentMenu.styles.width - 10
	else
		destX -= this.styles.width - 10

	var destY = parseInt(getStyle(this.parentMenu.domID,'top'))

	var lastItemSpace = 0

	for (var i in this.parentMenu.items)
	{
		// Only count to whichever item we are
		if (this.parentMenu.items[i] == this)
			break

		// Menus must have their menu item counted
		var item =	this.parentMenu.items[i].constructor == Menu ?
				this.parentMenu.items[i].menuItem :
				this.parentMenu.items[i]

		destY += item.styles.height + item.styles.space

		lastItemSpace = item.styles.space
	}

	destY -= lastItemSpace

	if (destY + this.styles.height > gBrowser.height())
		destY = gBrowser.height() - this.styles.height

	if (this.isVisible())
	{
		if (this.tweenTimeout)
		{
			window.clearTimeout(this.tweenTimeout)

			this.tweenTimeout = null
		}

		this.tween(destX,destY,this.tweenTime,this.tweenSmooth)
	} else {
		changeStyle(this.domID,'left',	destX + 'px')
		changeStyle(this.domID,'top',	destY + 'px')
	}

	return
}

function MenuItem(value,href)
{
	this.menu		= null
	this.divDOMID		= null
	this.value		= value
	this.href		= href
	this.styles		= new Object()
	this.hoverStyles	= new Object()

	return this
}

MenuItem.prototype.highlight = function()
{
	// Dehighlight siblings
	for (var i in this.menu.items)
		if (this.menu.items[i].constructor == MenuItem && this.menu.items[i] != this)
		{
			this.menu.items[i].deHighlight()

		} else if (this.menu.items[i].constructor == Menu && this.menu.items[i].menuItem != this) {

			this.menu.items[i].menuItem.deHighlight()
			this.menu.items[i].hideMenu()
		}

	changeStyle(this.divDOMID,'backgroundColor',	this.hoverStyles.backgroundColor)
	changeStyle(this.divDOMID,'color',		this.hoverStyles.color)

	return
}

MenuItem.prototype.deHighlight = function(obj)
{
	changeStyle(this.divDOMID,'backgroundColor',	this.styles.backgroundColor)
	changeStyle(this.divDOMID,'color',		this.styles.color)

	return
}

MenuItem.prototype.build = function()
{
	var e = new HTMLElement('a',this.value)

	e.addAttribute('id',	this.id)
	e.addAttribute('href',	this.href)

	return e.build()
}

MenuItem.prototype.clone = function()
{
	var item = new MenuItem(this.value,this.href)

	for (i in this)
		item[i] = this[i]

	return item
}

function MenuSpace()
{
	this.styles	= new Object()

	return this
}

function StyleList(match)
{
	this.match	= match
	this.styles	= []

	return this
}

StyleList.prototype.addStyle = function(name,value)
{
	this.styles[name] = value

	return
}

StyleList.prototype.build = function()
{
	var t = ''

	for (var style in this.styles)
		t += style + ':' + this.styles[style] + ';'

	if (this.match != null)
		t = this.match + '{' + t + '}'

	return t
}

function HTMLElement(name,value)
{
	this.name	= name
	this.value	= value
	this.styles	= new StyleList()
	this.attributes	= []

	return
}

HTMLElement.prototype.addStyle = function(name,value)
{
	this.styles.addStyle(name,value)

	return
}

HTMLElement.prototype.addAttribute = function(name,value)
{
	this.attributes[name] = value

	return
}

HTMLElement.prototype.setValue = function(value)
{
	this.value = value

	return
}

HTMLElement.prototype.build = function(escape)
{
	var	html	= '',
		t	= ''	// Temporary storage variable

	if (escape == null)
		escape = false

	html += '<' + this.name

	// Build styles
	var styleAttribute = this.styles.build()

	if (styleAttribute.length)
		this.addAttribute('style',styleAttribute)

	// Build attributes
	for (var attribute in this.attributes)
	{
		html	+=	' '
			+	attribute
			+	'="'

		if (this.attributes[attribute] == null)
		{
			html += attribute
		} else {
			if (escape)
			{
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
	str = str.replace(/&/g,'&amp;')
	str = str.replace(/</g,'&lt;')
	str = str.replace(/>/g,'&gt;')
	str = str.replace(/\'/g,'&apos;')
	str = str.replace(/\"/g,'&quot;')

	return str
}

function changeStyle(id,name,value)
{
	var obj = getObj(id)

	if (obj && obj.style)
		eval("obj.style." + name + " = '" + addSlashes(value) + "'")

	return
}

function getStyle(id,name)
{
	var obj = getObj(id)

	if (obj && obj.currentStyle)
		return eval("obj.style." + name)

	else if (obj && document.defaultView && document.defaultView.getCurrentStyle)
		return document.defaultView.getCurrentStyle(id,'').getPropertyValue(name)

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
		ret = eval(arrayClone(chunks).splice(0,i).join('.'))

	return ret ? eval(prop) : null
}

/*
 * Adding elements to array isn't very desirable
 * because 
 *
 *	for (i in arr) // adds `clone' method
*/
//Array.prototype.clone = function()
function cloneArray(arr)
{
	var t

	for (var i in this)
		t[i] = arr[i]//this[i]

	return t
}
