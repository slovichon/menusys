/* $Id$ */

/*
 * Adding methods to Array.prototype isn't very desirable
 * because it becomes a member of the array:
 *
 *	for (i in arr)
 *
 * Adding Array.prototype.clone() would yield in an extra
 * loop iteration above with `i' set to "clone."
 */
function cloneArray(arr)
{
	var t
	for (var i in this)
		t[i] = arr[i]
	return t
}

/*
Array.prototype.clone = function() {
	var t
	for (var i in this)
		t[i] = this[i]
	return t
}
*/
