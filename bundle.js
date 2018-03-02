/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	// Require module
	__webpack_require__(1);
	__webpack_require__(3);
	
	var oTabs = window.oTabs = __webpack_require__(19);
	
	//const oExpanderObjects = window.oExpanderObjects = oExpander.init(document.body, {})
	
	var tabsObjects = window.tabsObjects = oTabs.init(document.body, {
		disablefocus: false
	});
	
	// Wait until the page has loaded
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
	}
	document.addEventListener('DOMContentLoaded', function () {
		// Dispatch a custom event that will tell all required modules to initialise
		document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
	});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var define = false;
	
	/*global module*/
	
	/**
	 * Detect IE 8 through injected conditional comments:
	 * no UA detection, no need for conditional compilation or JS check
	 * @return {Bool} true if the browser is IE 8
	 */
	var isIE8 = (function () {
		var b = document.createElement('B');
		var docElem = document.documentElement;
		var isIE = undefined;
	
		b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
		docElem.appendChild(b);
		isIE = !!document.getElementById('ie8test');
		docElem.removeChild(b);
		return isIE;
	})();
	
	/**
	 * Grab grid properties
	 * @return {Object} layout names and gutter widths
	 */
	function getGridProperties() {
		return getGridFromDoc('after');
	}
	
	/**
	 * Get all layout sizes
	 * @return {Object} layout names and sizes
	 */
	function getGridBreakpoints() {
		return getGridFromDoc('before');
	}
	
	/**
	 * Grab grid properties surfaced in html:after and html:before's content
	 * @param {String} position Whether to get all properties in :before, or current properties in :after
	 * @return {Object} layout names and gutter widths
	 */
	function getGridFromDoc(position) {
		// Contained in a try/catch as it should not error if o-grid styles are not (deliberately or accidentally) loaded
		// e.g. o-tracking will always try to read this property, but the page is not obliged to use o-grid for layout
		try {
			var gridProperties = window.getComputedStyle(document.documentElement, ':' + position).getPropertyValue('content');
			// Firefox computes: "{\"foo\": \"bar\"}"
			// We want readable JSON: {"foo": "bar"}
			gridProperties = gridProperties.replace(/'/g, '').replace(/\\/g, '').replace(/^"/, '').replace(/"$/, '');
			return JSON.parse(gridProperties);
		} catch (e) {
			return {};
		}
	}
	
	/**
	 * Grab the current layout
	 * @return {String} Layout name
	 */
	function getCurrentLayout() {
		if (isIE8) {
			return 'L';
		}
	
		return getGridProperties().layout;
	}
	
	/**
	 * Grab the current space between columns
	 * @return {String} Gutter width in pixels
	 */
	function getCurrentGutter() {
		if (isIE8) {
			return '20px';
		}
	
		return getGridProperties().gutter;
	}
	
	/**
	 * This sets MediaQueryListeners on all the o-grid breakpoints
	 * and fires a `o-grid.layoutChange` event on layout change.
	 */
	function enableLayoutChangeEvents() {
		// Create a map containing all breakpoints exposed via html:before
		var gridLayouts = getGridBreakpoints();
		if (gridLayouts.hasOwnProperty('layouts')) {
			(function () {
				var layouts = gridLayouts.layouts;
				var breakpoints = new Map(Object.keys(layouts).map(function (key) {
					return [key, layouts[key]];
				}));
				var decr1 = function decr1(val) {
					return Number(val.replace('px', '') - 1) + 'px';
				};
	
				// Generate media queries for each
				breakpoints.forEach(function (width, size) {
					var queries = [];
					if (size === 'S') {
						queries.push('(max-width: ' + width + ')');
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('M')) + ')');
					} else if (size === 'M') {
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('L')) + ')');
					} else if (size === 'L') {
						queries.push('(min-width: ' + width + ') and (max-width: ' + decr1(breakpoints.get('XL')) + ')');
					} else if (size === 'XL') {
						queries.push('(min-width: ' + width + ')');
					}
	
					// matchMedia listener handler: Dispatch `o-grid.layoutChange` event if a match
					var handleMQChange = function handleMQChange(mql) {
						if (mql.matches) {
							window.dispatchEvent(new CustomEvent('o-grid.layoutChange', {
								detail: {
									layout: size
								}
							}));
						}
					};
	
					// Create a new listener for each layout
					queries.forEach(function (mq) {
						var mql = window.matchMedia(mq);
						mql.addListener(handleMQChange);
						handleMQChange(mql);
					});
				});
			})();
		} else {
			console.error('To enable grid layout change events, include oGridSurfaceLayoutSizes in your Sass');
		}
	}
	
	exports['default'] = {
		getCurrentLayout: getCurrentLayout,
		getCurrentGutter: getCurrentGutter,
		getGridBreakpoints: getGridBreakpoints,
		enableLayoutChangeEvents: enableLayoutChangeEvents
	};
	module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require,module*/
	
	var oHierarchicalNav = __webpack_require__(5);
	var constructAll = function constructAll() {
		oHierarchicalNav.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	document.addEventListener('o.DOMContentLoaded', constructAll);
	
	module.exports = oHierarchicalNav;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require,module,document,HTMLElement*/
	
	var SquishyList = __webpack_require__(6);
	var DomDelegate = __webpack_require__(8);
	var oViewport = __webpack_require__(10);
	var Nav = __webpack_require__(15);
	
	function ResponsiveNav(rootEl) {
	
		var rootDelegate = undefined;
		var nav = undefined;
		var contentFilterEl = undefined;
		var contentFilter = undefined;
		var moreEl = undefined;
		var moreListEl = undefined;
		var clonedIdPrefix = 'o-hierarchical-nav__cloned-id-';
		var prefixedNodes = [];
	
		// Check if element is a controller of another DOM element
		function isMegaDropdownControl(el) {
			return el && el.hasAttribute('aria-controls');
		}
	
		// On resize, apply o-squishy-list, and, if it has a sub-level dom, populate more list
		function resize() {
			nav.resize();
	
			if (contentFilter) {
				contentFilter.squish();
				if (!isMegaDropdownControl(moreEl)) {
					populateMoreList(contentFilter.getHiddenItems());
				}
			}
		}
	
		// Empty the more list
		function emptyMoreList() {
			if (moreListEl) {
				moreListEl.innerHTML = '';
			}
		}
	
		// Get the information from the element and create a new li tag with the element's text to append more list
		function addItemToMoreList(text, href) {
			var itemEl = document.createElement('li');
			var aEl = document.createElement('a');
	
			if (typeof aEl.textContent !== 'undefined') {
				aEl.textContent = text;
			} else {
				aEl.innerText = text;
			}
	
			aEl.href = href;
			itemEl.appendChild(aEl);
			moreListEl.appendChild(itemEl);
		}
	
		function cloneItemToMoreList(el) {
			var cloneEl = el.cloneNode(true);
			// remove the attributes that are only applicable to higher level
			cloneEl.removeAttribute('data-priority');
			cloneEl.removeAttribute('aria-hidden');
			cloneEl.removeAttribute('data-o-hierarchical-nav-is-cloneable');
			// recurse through children and amend any id values to maintain uniqueness
			prefixIds(el);
	
			// increase level of nested menus
			incrementMenuDepths(cloneEl);
	
			moreListEl.appendChild(cloneEl);
		}
	
		function resetIds() {
			var nextNode = undefined;
			while (prefixedNodes.length > 0) {
				nextNode = prefixedNodes.pop();
				nextNode.setAttribute('id', nextNode.getAttribute('id').replace(clonedIdPrefix, ''));
			}
		}
	
		function incrementMenuDepths(el) {
			// data-o-hierarchical-nav-level attribute is incremented by one for each
			// of the children recursively. Modifies elements in place, assumes
			// cloned element to be passed in.
			var child = undefined;
			if (el.hasChildNodes()) {
				var children = el.childNodes;
				for (var i = 0, l = children.length; i < l; i++) {
					child = children[i];
					if (child instanceof HTMLElement) {
						if (child.hasAttribute('data-o-hierarchical-nav-level')) {
							// increment nav-level when attribute present
							var origNavLevel = parseInt(child.getAttribute('data-o-hierarchical-nav-level'), 10);
							var updatedNavLevel = (isNaN(origNavLevel) ? 0 : origNavLevel) + 1;
							child.setAttribute('data-o-hierarchical-nav-level', updatedNavLevel);
						}
						incrementMenuDepths(child);
					}
				}
			}
		}
	
		function prefixIds(el) {
			// id's are prefixed to ensure that any id based functionality uses the visible element
			// for example a 'label' tag with a 'for' attribute will not find the correct input it
			// relates to as it uses the first matching id in the document
			var child = undefined;
			if (el.hasChildNodes()) {
				var children = el.childNodes;
				for (var i = 0, l = children.length; i < l; i++) {
					child = children[i];
					if (child instanceof HTMLElement) {
						if (child.hasAttribute('id')) {
							prefixedNodes.push(child); // store to make the cleanup more performant
							child.setAttribute('id', clonedIdPrefix + child.getAttribute('id'));
						}
						prefixIds(child);
					}
				}
			}
		}
	
		// For every hidden item, add it to the more list
		function populateMoreList(hiddenEls) {
			emptyMoreList();
			resetIds();
	
			for (var c = 0, l = hiddenEls.length; c < l; c++) {
				var aEl = hiddenEls[c].querySelector('a');
				var ulEl = hiddenEls[c].querySelector('ul');
	
				if (hiddenEls[c].hasAttribute('data-o-hierarchical-nav-is-cloneable')) {
					cloneItemToMoreList(hiddenEls[c]);
				} else {
					var aText = typeof aEl.textContent !== 'undefined' ? aEl.textContent : aEl.innerText;
					addItemToMoreList(aText, aEl.href, ulEl);
				}
			}
		}
	
		// If all elements are hidden, add the all modifier, if not, the some modifier
		function setMoreElClass(remainingItems) {
			if (!moreEl) {
				return;
			}
	
			if (remainingItems === 0) {
				moreEl.classList.add('o-hierarchical-nav__more--all');
				moreEl.classList.remove('o-hierarchical-nav__more--some');
			} else {
				moreEl.classList.add('o-hierarchical-nav__more--some');
				moreEl.classList.remove('o-hierarchical-nav__more--all');
			}
		}
	
		// When there's an o-squishy-list change, collapse all elements and run the setMoreElClass method with number of non-hidden elements
		function contentFilterChangeHandler(ev) {
			if (ev.target === contentFilterEl && ev.detail.hiddenItems.length > 0) {
				nav.collapseAll();
				setMoreElClass(ev.detail.remainingItems.length);
			}
		}
	
		// If more button is clicked, populate it
		function navExpandHandler(ev) {
			if (ev.target === moreEl) {
				populateMoreList(contentFilter.getHiddenItems());
			}
		}
	
		function init() {
			if (!rootEl) {
				rootEl = document.body;
			} else if (!(rootEl instanceof HTMLElement)) {
				rootEl = document.querySelector(rootEl);
			}
	
			nav = new Nav(rootEl);
			rootDelegate = new DomDelegate(rootEl);
			contentFilterEl = rootEl.querySelector('ul');
			moreEl = rootEl.querySelector('[data-more]');
	
			if (contentFilterEl) {
				contentFilter = new SquishyList(contentFilterEl, { filterOnResize: false });
			}
	
			// If there's a more element, add a ul tag where hidden elements will be appended
			if (moreEl) {
				moreEl.setAttribute('aria-hidden', 'true');
	
				if (!isMegaDropdownControl(moreEl)) {
					moreListEl = document.createElement('ul');
					moreListEl.setAttribute('data-o-hierarchical-nav-level', '2');
					moreEl.appendChild(moreListEl);
					rootDelegate.on('oLayers.new', navExpandHandler);
				}
			}
	
			rootDelegate.on('oSquishyList.change', contentFilterChangeHandler);
	
			var bodyDelegate = new DomDelegate(document.body);
	
			// Force a resize when it loads, in case it loads on a smaller screen
			resize();
	
			oViewport.listenTo('resize');
			bodyDelegate.on('oViewport.resize', resize);
		}
	
		function destroy() {
			prefixedNodes = [];
			rootDelegate.destroy();
			rootEl.removeAttribute('data-o-hierarchical-nav--js');
		}
	
		init();
	
		this.resize = resize;
		this.destroy = destroy;
	}
	
	// Initializes all nav elements in the page or whatever element is passed to it
	ResponsiveNav.init = function (el) {
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}
	
		var navEls = el.querySelectorAll('[data-o-component="o-hierarchical-nav"]');
		var responsiveNavs = [];
	
		for (var c = 0, l = navEls.length; c < l; c++) {
			if (!navEls[c].hasAttribute('data-o-hierarchical-nav--js')) {
				// If it's a vertical nav, we don't need all the responsive methods
				if (navEls[c].getAttribute('data-o-hierarchical-nav-orientiation') === 'vertical') {
					responsiveNavs.push(new Nav(navEls[c]));
				} else {
					responsiveNavs.push(new ResponsiveNav(navEls[c]));
				}
			}
		}
	
		return responsiveNavs;
	};
	
	module.exports = ResponsiveNav;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var define = false;
	
	var SquishyList = (function () {
		function SquishyList(rootEl, opts) {
			_classCallCheck(this, SquishyList);
	
			this.element = rootEl;
			this.moreWidth = 0;
			this.options = opts || { filterOnResize: true };
	
			this.getPrioritySortedChildNodeEls();
			this.moreEl = this.element.querySelector('[data-more]');
			if (this.moreEl) {
				this.showEl(this.moreEl);
				this.moreWidth = this.moreEl.offsetWidth;
				this.hideEl(this.moreEl);
			}
			this.squish();
			if (this.options.filterOnResize) {
				window.addEventListener('resize', this.resizeHandler.bind(this), false);
			}
	
			this.dispatchCustomEvent('oSquishyList.ready');
		}
	
		_createClass(SquishyList, [{
			key: 'dispatchCustomEvent',
			value: function dispatchCustomEvent(name, data) {
				if (document.createEvent && this.element.dispatchEvent) {
					var _event = document.createEvent('Event');
					_event.initEvent(name, true, true);
					if (data) {
						_event.detail = data;
					}
					this.element.dispatchEvent(_event);
				}
			}
		}, {
			key: 'getItemEls',
			value: function getItemEls() {
				var itemEls = [];
				var childNodeEl = undefined;
	
				for (var c = 0, l = this.element.childNodes.length; c < l; c++) {
					childNodeEl = this.element.childNodes[c];
	
					// Make it flexible so that other product and modules can manually hide elements and o-squishy-list won't add it to it's list
					if (childNodeEl.nodeType === 1 && !childNodeEl.hasAttribute('data-more') && !childNodeEl.hasAttribute('data-o-squishy-list--ignore')) {
						itemEls.push(childNodeEl);
					}
				}
				return itemEls;
			}
		}, {
			key: 'showEl',
			value: function showEl(el) {
				// eslint-disable-line class-methods-use-this
				if (el) {
					el.removeAttribute('aria-hidden');
				}
			}
		}, {
			key: 'hideEl',
			value: function hideEl(el) {
				// eslint-disable-line class-methods-use-this
				if (el) {
					el.setAttribute('aria-hidden', 'true');
				}
			}
		}, {
			key: 'getElPriority',
			value: function getElPriority(el) {
				// eslint-disable-line class-methods-use-this
				return parseInt(el.getAttribute('data-priority'), 10);
			}
		}, {
			key: 'getPrioritySortedChildNodeEls',
			value: function getPrioritySortedChildNodeEls() {
				this.allItemEls = this.getItemEls();
				this.prioritySortedItemEls = [];
				var unprioritisedItemEls = [];
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					var thisItemEl = this.allItemEls[c];
					var thisItemPriority = this.getElPriority(thisItemEl);
					if (isNaN(thisItemPriority)) {
						unprioritisedItemEls.push(thisItemEl);
					} else if (thisItemPriority >= 0) {
						if (!Array.isArray(this.prioritySortedItemEls[thisItemPriority])) {
							this.prioritySortedItemEls[thisItemPriority] = [];
						}
						this.prioritySortedItemEls[thisItemPriority].push(thisItemEl);
					}
				}
				if (unprioritisedItemEls.length > 0) {
					this.prioritySortedItemEls.push(unprioritisedItemEls);
				}
				this.prioritySortedItemEls = this.prioritySortedItemEls.filter(function (v) {
					return v !== undefined;
				});
			}
		}, {
			key: 'showAllItems',
			value: function showAllItems() {
				this.hiddenItemEls = [];
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					this.showEl(this.allItemEls[c]);
				}
			}
		}, {
			key: 'hideItems',
			value: function hideItems(els) {
				// We want highest priority items to be at the beginning of the array
				for (var i = els.length - 1; i > -1; i--) {
					this.hiddenItemEls.unshift(els[i]);
					this.hideEl(els[i]);
				}
			}
		}, {
			key: 'getVisibleContentWidth',
			value: function getVisibleContentWidth() {
				var visibleItemsWidth = 0;
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					if (!this.allItemEls[c].hasAttribute('aria-hidden')) {
						visibleItemsWidth += this.allItemEls[c].offsetWidth; // Needs to take into account margins too
					}
				}
				return visibleItemsWidth;
			}
		}, {
			key: 'doesContentFit',
			value: function doesContentFit() {
				return this.getVisibleContentWidth() <= this.element.clientWidth;
			}
		}, {
			key: 'getHiddenItems',
			value: function getHiddenItems() {
				return this.hiddenItemEls;
			}
		}, {
			key: 'getRemainingItems',
			value: function getRemainingItems() {
				var _this = this;
	
				return this.allItemEls.filter(function (el) {
					return _this.hiddenItemEls.indexOf(el) === -1;
				});
			}
		}, {
			key: 'squish',
			value: function squish() {
				this.showAllItems();
				if (this.doesContentFit()) {
					this.hideEl(this.moreEl);
				} else {
					for (var p = this.prioritySortedItemEls.length - 1; p >= 0; p--) {
						this.hideItems(this.prioritySortedItemEls[p]);
						if (this.getVisibleContentWidth() + this.moreWidth <= this.element.clientWidth) {
							this.showEl(this.moreEl);
							break;
						}
					}
				}
				this.dispatchCustomEvent('oSquishyList.change', {
					hiddenItems: this.getHiddenItems(),
					remainingItems: this.getRemainingItems()
				});
			}
		}, {
			key: 'resizeHandler',
			value: function resizeHandler() {
				clearTimeout(this.debounceTimeout);
				this.debounceTimeout = setTimeout(this.squish.bind(this), 50);
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				for (var c = 0, l = this.allItemEls.length; c < l; c++) {
					this.allItemEls[c].removeAttribute('aria-hidden');
				}
				window.removeEventListener('resize', this.resizeHandler, false);
				this.element.removeAttribute('data-o-squishy-list-js');
			}
		}], [{
			key: 'init',
			value: function init(el, opts) {
				if (!el) {
					el = document.body;
				}
				if (!(el instanceof HTMLElement)) {
					el = document.querySelector(el);
				}
				if (/\bo-squishy-list\b/.test(el.getAttribute('data-o-component'))) {
					return new SquishyList(el, opts);
				}
				return [].map.call(el.querySelectorAll('[data-o-component="o-squishy-list"]'), function (el) {
					return new SquishyList(el, opts);
				});
			}
		}]);
	
		return SquishyList;
	})();
	
	exports['default'] = SquishyList;
	
	var constructAll = function constructAll() {
		SquishyList.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	
	if (typeof window !== 'undefined') {
		document.addEventListener('o.DOMContentLoaded', constructAll);
	}
	module.exports = exports['default'];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9);

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*jshint browser:true, node:true*/
	
	'use strict';
	
	module.exports = Delegate;
	
	/**
	 * DOM event delegator
	 *
	 * The delegator will listen
	 * for events that bubble up
	 * to the root node.
	 *
	 * @constructor
	 * @param {Node|string} [root] The root node or a selector string matching the root node
	 */
	function Delegate(root) {
	
	  /**
	   * Maintain a map of listener
	   * lists, keyed by event name.
	   *
	   * @type Object
	   */
	  this.listenerMap = [{}, {}];
	  if (root) {
	    this.root(root);
	  }
	
	  /** @type function() */
	  this.handle = Delegate.prototype.handle.bind(this);
	}
	
	/**
	 * Start listening for events
	 * on the provided DOM element
	 *
	 * @param  {Node|string} [root] The root node or a selector string matching the root node
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.root = function (root) {
	  var listenerMap = this.listenerMap;
	  var eventType;
	
	  // Remove master event listeners
	  if (this.rootElement) {
	    for (eventType in listenerMap[1]) {
	      if (listenerMap[1].hasOwnProperty(eventType)) {
	        this.rootElement.removeEventListener(eventType, this.handle, true);
	      }
	    }
	    for (eventType in listenerMap[0]) {
	      if (listenerMap[0].hasOwnProperty(eventType)) {
	        this.rootElement.removeEventListener(eventType, this.handle, false);
	      }
	    }
	  }
	
	  // If no root or root is not
	  // a dom node, then remove internal
	  // root reference and exit here
	  if (!root || !root.addEventListener) {
	    if (this.rootElement) {
	      delete this.rootElement;
	    }
	    return this;
	  }
	
	  /**
	   * The root node at which
	   * listeners are attached.
	   *
	   * @type Node
	   */
	  this.rootElement = root;
	
	  // Set up master event listeners
	  for (eventType in listenerMap[1]) {
	    if (listenerMap[1].hasOwnProperty(eventType)) {
	      this.rootElement.addEventListener(eventType, this.handle, true);
	    }
	  }
	  for (eventType in listenerMap[0]) {
	    if (listenerMap[0].hasOwnProperty(eventType)) {
	      this.rootElement.addEventListener(eventType, this.handle, false);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * @param {string} eventType
	 * @returns boolean
	 */
	Delegate.prototype.captureForType = function (eventType) {
	  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
	};
	
	/**
	 * Attach a handler to one
	 * event for all elements
	 * that match the selector,
	 * now or in the future
	 *
	 * The handler function receives
	 * three arguments: the DOM event
	 * object, the node that matched
	 * the selector while the event
	 * was bubbling and a reference
	 * to itself. Within the handler,
	 * 'this' is equal to the second
	 * argument.
	 *
	 * The node that actually received
	 * the event can be accessed via
	 * 'event.target'.
	 *
	 * @param {string} eventType Listen for these events
	 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
	 * @param {function()} handler Handler function - event data passed here will be in event.data
	 * @param {boolean} [useCapture] see 'useCapture' in <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener>
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.on = function (eventType, selector, handler, useCapture) {
	  var root, listenerMap, matcher, matcherParam;
	
	  if (!eventType) {
	    throw new TypeError('Invalid event type: ' + eventType);
	  }
	
	  // handler can be passed as
	  // the second or third argument
	  if (typeof selector === 'function') {
	    useCapture = handler;
	    handler = selector;
	    selector = null;
	  }
	
	  // Fallback to sensible defaults
	  // if useCapture not set
	  if (useCapture === undefined) {
	    useCapture = this.captureForType(eventType);
	  }
	
	  if (typeof handler !== 'function') {
	    throw new TypeError('Handler must be a type of Function');
	  }
	
	  root = this.rootElement;
	  listenerMap = this.listenerMap[useCapture ? 1 : 0];
	
	  // Add master handler for type if not created yet
	  if (!listenerMap[eventType]) {
	    if (root) {
	      root.addEventListener(eventType, this.handle, useCapture);
	    }
	    listenerMap[eventType] = [];
	  }
	
	  if (!selector) {
	    matcherParam = null;
	
	    // COMPLEX - matchesRoot needs to have access to
	    // this.rootElement, so bind the function to this.
	    matcher = matchesRoot.bind(this);
	
	    // Compile a matcher for the given selector
	  } else if (/^[a-z]+$/i.test(selector)) {
	      matcherParam = selector;
	      matcher = matchesTag;
	    } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
	      matcherParam = selector.slice(1);
	      matcher = matchesId;
	    } else {
	      matcherParam = selector;
	      matcher = matches;
	    }
	
	  // Add to the list of listeners
	  listenerMap[eventType].push({
	    selector: selector,
	    handler: handler,
	    matcher: matcher,
	    matcherParam: matcherParam
	  });
	
	  return this;
	};
	
	/**
	 * Remove an event handler
	 * for elements that match
	 * the selector, forever
	 *
	 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
	 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
	 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
	 * @returns {Delegate} This method is chainable
	 */
	Delegate.prototype.off = function (eventType, selector, handler, useCapture) {
	  var i, listener, listenerMap, listenerList, singleEventType;
	
	  // Handler can be passed as
	  // the second or third argument
	  if (typeof selector === 'function') {
	    useCapture = handler;
	    handler = selector;
	    selector = null;
	  }
	
	  // If useCapture not set, remove
	  // all event listeners
	  if (useCapture === undefined) {
	    this.off(eventType, selector, handler, true);
	    this.off(eventType, selector, handler, false);
	    return this;
	  }
	
	  listenerMap = this.listenerMap[useCapture ? 1 : 0];
	  if (!eventType) {
	    for (singleEventType in listenerMap) {
	      if (listenerMap.hasOwnProperty(singleEventType)) {
	        this.off(singleEventType, selector, handler);
	      }
	    }
	
	    return this;
	  }
	
	  listenerList = listenerMap[eventType];
	  if (!listenerList || !listenerList.length) {
	    return this;
	  }
	
	  // Remove only parameter matches
	  // if specified
	  for (i = listenerList.length - 1; i >= 0; i--) {
	    listener = listenerList[i];
	
	    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
	      listenerList.splice(i, 1);
	    }
	  }
	
	  // All listeners removed
	  if (!listenerList.length) {
	    delete listenerMap[eventType];
	
	    // Remove the main handler
	    if (this.rootElement) {
	      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Handle an arbitrary event.
	 *
	 * @param {Event} event
	 */
	Delegate.prototype.handle = function (event) {
	  var i,
	      l,
	      type = event.type,
	      root,
	      phase,
	      listener,
	      returned,
	      listenerList = [],
	      target,
	      /** @const */EVENTIGNORE = 'ftLabsDelegateIgnore';
	
	  if (event[EVENTIGNORE] === true) {
	    return;
	  }
	
	  target = event.target;
	
	  // Hardcode value of Node.TEXT_NODE
	  // as not defined in IE8
	  if (target.nodeType === 3) {
	    target = target.parentNode;
	  }
	
	  root = this.rootElement;
	
	  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);
	
	  switch (phase) {
	    case 1:
	      //Event.CAPTURING_PHASE:
	      listenerList = this.listenerMap[1][type];
	      break;
	    case 2:
	      //Event.AT_TARGET:
	      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
	      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
	      break;
	    case 3:
	      //Event.BUBBLING_PHASE:
	      listenerList = this.listenerMap[0][type];
	      break;
	  }
	
	  // Need to continuously check
	  // that the specific list is
	  // still populated in case one
	  // of the callbacks actually
	  // causes the list to be destroyed.
	  l = listenerList.length;
	  while (target && l) {
	    for (i = 0; i < l; i++) {
	      listener = listenerList[i];
	
	      // Bail from this loop if
	      // the length changed and
	      // no more listeners are
	      // defined between i and l.
	      if (!listener) {
	        break;
	      }
	
	      // Check for match and fire
	      // the event if there's one
	      //
	      // TODO:MCG:20120117: Need a way
	      // to check if event#stopImmediatePropagation
	      // was called. If so, break both loops.
	      if (listener.matcher.call(target, listener.matcherParam, target)) {
	        returned = this.fire(event, target, listener);
	      }
	
	      // Stop propagation to subsequent
	      // callbacks if the callback returned
	      // false
	      if (returned === false) {
	        event[EVENTIGNORE] = true;
	        event.preventDefault();
	        return;
	      }
	    }
	
	    // TODO:MCG:20120117: Need a way to
	    // check if event#stopPropagation
	    // was called. If so, break looping
	    // through the DOM. Stop if the
	    // delegation root has been reached
	    if (target === root) {
	      break;
	    }
	
	    l = listenerList.length;
	    target = target.parentElement;
	  }
	};
	
	/**
	 * Fire a listener on a target.
	 *
	 * @param {Event} event
	 * @param {Node} target
	 * @param {Object} listener
	 * @returns {boolean}
	 */
	Delegate.prototype.fire = function (event, target, listener) {
	  return listener.handler.call(target, event, target);
	};
	
	/**
	 * Check whether an element
	 * matches a generic selector.
	 *
	 * @type function()
	 * @param {string} selector A CSS selector
	 */
	var matches = (function (el) {
	  if (!el) return;
	  var p = el.prototype;
	  return p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
	})(Element);
	
	/**
	 * Check whether an element
	 * matches a tag selector.
	 *
	 * Tags are NOT case-sensitive,
	 * except in XML (and XML-based
	 * languages such as XHTML).
	 *
	 * @param {string} tagName The tag name to test against
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesTag(tagName, element) {
	  return tagName.toLowerCase() === element.tagName.toLowerCase();
	}
	
	/**
	 * Check whether an element
	 * matches the root.
	 *
	 * @param {?String} selector In this case this is always passed through as null and not used
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesRoot(selector, element) {
	  /*jshint validthis:true*/
	  if (this.rootElement === window) return element === document;
	  return this.rootElement === element;
	}
	
	/**
	 * Check whether the ID of
	 * the element in 'this'
	 * matches the given ID.
	 *
	 * IDs are case-sensitive.
	 *
	 * @param {string} id The ID to test against
	 * @param {Element} element The element to test with
	 * @returns boolean
	 */
	function matchesId(id, element) {
	  return id === element.id;
	}
	
	/**
	 * Short hand for off()
	 * and root(), ie both
	 * with no parameters
	 *
	 * @return void
	 */
	Delegate.prototype.destroy = function () {
	  this.off();
	  this.root();
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(11);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	// let debug;
	var utils = __webpack_require__(12);
	var throttle = utils.throttle;
	var debounce = utils.debounce;
	
	var listeners = {};
	var intervals = {
		resize: 100,
		orientation: 100,
		visibility: 100,
		scroll: 100
	};
	
	function setThrottleInterval(eventType, interval) {
		if (typeof arguments[0] === 'number') {
			setThrottleInterval('scroll', arguments[0]);
			setThrottleInterval('resize', arguments[1]);
			setThrottleInterval('orientation', arguments[2]);
			setThrottleInterval('visibility', arguments[3]);
		} else if (interval) {
			intervals[eventType] = interval;
		}
	}
	
	function listenToResize() {
		if (listeners.resize) {
			return;
		}
		var eventType = 'resize';
		var handler = debounce(function (ev) {
			utils.broadcast('resize', {
				viewport: utils.getSize(),
				originalEvent: ev
			});
		}, intervals.resize);
	
		window.addEventListener(eventType, handler);
		listeners.resize = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToOrientation() {
	
		if (listeners.orientation) {
			return;
		}
	
		var eventType = 'orientationchange';
		var handler = debounce(function (ev) {
			utils.broadcast('orientation', {
				viewport: utils.getSize(),
				orientation: utils.getOrientation(),
				originalEvent: ev
			});
		}, intervals.orientation);
	
		window.addEventListener(eventType, handler);
		listeners.orientation = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToVisibility() {
	
		if (listeners.visibility) {
			return;
		}
	
		var eventType = utils.detectVisiblityAPI().eventType;
		var handler = debounce(function (ev) {
			utils.broadcast('visibility', {
				hidden: utils.getVisibility(),
				originalEvent: ev
			});
		}, intervals.visibility);
	
		window.addEventListener(eventType, handler);
	
		listeners.visibility = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenToScroll() {
	
		if (listeners.scroll) {
			return;
		}
	
		var eventType = 'scroll';
		var handler = throttle(function (ev) {
			var scrollPos = utils.getScrollPosition();
			utils.broadcast('scroll', {
				viewport: utils.getSize(),
				scrollHeight: scrollPos.height,
				scrollLeft: scrollPos.left,
				scrollTop: scrollPos.top,
				scrollWidth: scrollPos.width,
				originalEvent: ev
			});
		}, intervals.scroll);
	
		window.addEventListener(eventType, handler);
		listeners.scroll = {
			eventType: eventType,
			handler: handler
		};
	}
	
	function listenTo(eventType) {
		if (eventType === 'resize' || eventType === 'all') {
			listenToResize();
		}
	
		if (eventType === 'scroll' || eventType === 'all') {
			listenToScroll();
		}
	
		if (eventType === 'orientation' || eventType === 'all') {
			listenToOrientation();
		}
	
		if (eventType === 'visibility' || eventType === 'all') {
			listenToVisibility();
		}
	}
	
	function stopListeningTo(eventType) {
		if (eventType === 'all') {
			Object.keys(listeners).forEach(stopListeningTo);
		} else if (listeners[eventType]) {
			window.removeEventListener(listeners[eventType].eventType, listeners[eventType].handler);
			delete listeners[eventType];
		}
	}
	
	module.exports = {
		debug: function debug() {
			// debug = true;
			utils.debug();
		},
		listenTo: listenTo,
		stopListeningTo: stopListeningTo,
		setThrottleInterval: setThrottleInterval,
		getOrientation: utils.getOrientation,
		getSize: utils.getSize,
		getScrollPosition: utils.getScrollPosition,
		getVisibility: utils.getVisibility
	};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/* jshint devel: true */
	var oUtils = __webpack_require__(13);
	
	var _debug = undefined;
	
	function broadcast(eventType, data, target) {
		target = target || document.body;
	
		if (_debug) {
			console.log('o-viewport', eventType, data);
		}
	
		target.dispatchEvent(new CustomEvent('oViewport.' + eventType, {
			detail: data,
			bubbles: true
		}));
	}
	
	function getHeight(ignoreScrollbars) {
		return ignoreScrollbars ? document.documentElement.clientHeight : Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	}
	
	function getWidth(ignoreScrollbars) {
		return ignoreScrollbars ? document.documentElement.clientWidth : Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	}
	
	function getSize(ignoreScrollbars) {
		return {
			height: module.exports.getHeight(ignoreScrollbars),
			width: module.exports.getWidth(ignoreScrollbars)
		};
	}
	
	function getScrollPosition() {
		var de = document.documentElement;
		var db = document.body;
	
		// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY
		var isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';
	
		var ieX = isCSS1Compat ? de.scrollLeft : db.scrollLeft;
		var ieY = isCSS1Compat ? de.scrollTop : db.scrollTop;
		return {
			height: db.scrollHeight,
			width: db.scrollWidth,
			left: window.pageXOffset || window.scrollX || ieX,
			top: window.pageYOffset || window.scrollY || ieY
		};
	}
	
	function getOrientation() {
		var orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation || undefined;
		if (orientation) {
			return typeof orientation === 'string' ? orientation.split('-')[0] : orientation.type.split('-')[0];
		} else if (window.matchMedia) {
			return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
		} else {
			return getHeight() >= getWidth() ? 'portrait' : 'landscape';
		}
	}
	
	function detectVisiblityAPI() {
		var hiddenName = undefined;
		var eventType = undefined;
		if (typeof document.hidden !== 'undefined') {
			hiddenName = 'hidden';
			eventType = 'visibilitychange';
		} else if (typeof document.mozHidden !== 'undefined') {
			hiddenName = 'mozHidden';
			eventType = 'mozvisibilitychange';
		} else if (typeof document.msHidden !== 'undefined') {
			hiddenName = 'msHidden';
			eventType = 'msvisibilitychange';
		} else if (typeof document.webkitHidden !== 'undefined') {
			hiddenName = 'webkitHidden';
			eventType = 'webkitvisibilitychange';
		}
	
		return {
			hiddenName: hiddenName,
			eventType: eventType
		};
	}
	
	function getVisibility() {
		var hiddenName = detectVisiblityAPI().hiddenName;
		return document[hiddenName];
	}
	
	module.exports = {
		debug: function debug() {
			_debug = true;
		},
		broadcast: broadcast,
		getWidth: getWidth,
		getHeight: getHeight,
		getSize: getSize,
		getScrollPosition: getScrollPosition,
		getVisibility: getVisibility,
		getOrientation: getOrientation,
		detectVisiblityAPI: detectVisiblityAPI,
		debounce: oUtils.debounce,
		throttle: oUtils.throttle
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var define = false;
	
	/**
	*
	* Debounces function so it is only called after n milliseconds
	* without it not being called
	*
	* @example
	* Utils.debounce(myFunction() {}, 100);
	*
	* @param {Function} func - Function to be debounced
	* @param {number} wait - Time in miliseconds
	*
	* @returns {Function} - Debounced function
	*/
	function debounce(func, wait) {
		var timeout = undefined;
		return function () {
			var _this = this;
	
			var args = arguments;
			var later = function later() {
				timeout = null;
				func.apply(_this, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}
	
	/**
	*
	* Throttle function so it is only called once every n milliseconds
	*
	* @example
	* Utils.throttle(myFunction() {}, 100);
	*
	* @param {Function} func - Function to be throttled
	* @param {number} wait - Time in miliseconds
	*
	* @returns {Function} - Throttled function
	*/
	function throttle(func, wait) {
		var timeout = undefined;
		return function () {
			var _this2 = this;
	
			if (timeout) {
				return;
			}
			var args = arguments;
			var later = function later() {
				timeout = null;
				func.apply(_this2, args);
			};
	
			timeout = setTimeout(later, wait);
		};
	}
	
	exports.debounce = debounce;
	exports.throttle = throttle;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	
	var DomDelegate = __webpack_require__(8);
	var oDom = __webpack_require__(16);
	var utils = __webpack_require__(18);
	
	function Nav(rootEl) {
	
		var bodyDelegate = new DomDelegate(document.body);
		var rootDelegate = new DomDelegate(rootEl);
	
		// Get sub-level element
		function getChildListEl(el) {
			return el.querySelector('ul');
		}
	
		// Check if element has sub-level nav
		function hasChildList(el) {
			return !!getChildListEl(el);
		}
	
		// Get controlled element
		function getMegaDropdownEl(itemEl) {
			if (itemEl.hasAttribute('aria-controls')) {
				return document.getElementById(itemEl.getAttribute('aria-controls'));
			}
		}
	
		// Check if element is a controller of another DOM element
		function isControlEl(el) {
			return !!(getChildListEl(el) || getMegaDropdownEl(el));
		}
	
		// Check if element has been expanded
		function isExpanded(el) {
			return el.getAttribute('aria-expanded') === 'true';
		}
	
		// Check if a certain element is inside the root nav
		function isElementInsideNav(el) {
			var expandedLevel1El = rootEl.querySelector('[data-o-hierarchical-nav-level="1"] > [aria-expanded="true"]');
			var expandedMegaDropdownEl = undefined;
			var allLevel1Els = undefined;
	
			if (expandedLevel1El) {
				expandedMegaDropdownEl = getMegaDropdownEl(expandedLevel1El);
				if (expandedMegaDropdownEl && expandedMegaDropdownEl.contains(el)) {
					return true;
				}
			}
	
			allLevel1Els = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li');
	
			for (var c = 0, l = allLevel1Els.length; c < l; c++) {
				if (allLevel1Els[c].contains(el)) {
					return true;
				}
			}
			return false;
		}
	
		// Get the level a nav is in
		function getLevel(el) {
			return parseInt(el.parentNode.getAttribute('data-o-hierarchical-nav-level'), 10);
		}
	
		// Check if a level 2 nav will fit in the window
		function level2ListFitsInWindow(l2El) {
			return l2El.getBoundingClientRect().right < window.innerWidth;
		}
	
		// Check if an element will have enough space to its right
		function elementFitsToRight(el1, el2) {
			return el1.getBoundingClientRect().right + el2.offsetWidth < window.innerWidth;
		}
	
		// Depending on if an element fits to its right or not, change its class to apply correct css
		function positionChildListEl(parentEl, childEl) {
			parentEl.classList.remove('o-hierarchical-nav--align-right');
			parentEl.classList.remove('o-hierarchical-nav__outside-right');
			parentEl.classList.remove('o-hierarchical-nav--left');
	
			if (!childEl) {
				return;
			}
	
			if (getLevel(parentEl) === 1) {
				if (!level2ListFitsInWindow(childEl)) {
					parentEl.classList.add('o-hierarchical-nav--align-right');
				}
			} else {
				if (elementFitsToRight(parentEl, childEl)) {
					parentEl.classList.add('o-hierarchical-nav__outside-right');
				}
			}
		}
	
		// Hide an element
		function hideEl(el) {
			if (el) {
				el.setAttribute('aria-hidden', 'true');
			}
		}
	
		// Display an element
		function showEl(el) {
			if (el) {
				el.removeAttribute('aria-hidden');
			}
		}
	
		// Collapse all items from a certain node list
		function collapseAll(nodeList) {
			if (!nodeList) {
				nodeList = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="1"] > li[aria-expanded=true]');
			}
	
			utils.nodeListToArray(nodeList).forEach(function (childListItemEl) {
				if (isExpanded(childListItemEl)) {
					collapseItem(childListItemEl);
				}
			});
		}
	
		// Set an element as not expanded, and if it has children, do the same to them
		function collapseItem(itemEl) {
			itemEl.setAttribute('aria-expanded', 'false');
	
			if (utils.isIE8) {
				itemEl.classList.add('forceIErepaint');
				itemEl.classList.remove('forceIErepaint');
			}
	
			if (hasChildList(itemEl)) {
				collapseAll(getChildListEl(itemEl).children);
			}
	
			hideEl(getMegaDropdownEl(itemEl));
			dispatchCloseEvent(itemEl);
		}
	
		// Get same level items and collapse them
		function collapseSiblingItems(itemEl) {
			var listLevel = oDom.getClosestMatch(itemEl, 'ul').getAttribute('data-o-hierarchical-nav-level');
			var listItemEls = rootEl.querySelectorAll('[data-o-hierarchical-nav-level="' + listLevel + '"] > li[aria-expanded="true"]');
	
			for (var c = 0, l = listItemEls.length; c < l; c++) {
				collapseItem(listItemEls[c]);
			}
		}
	
		// Expand a nav item
		function expandItem(itemEl) {
			collapseSiblingItems(itemEl);
			itemEl.setAttribute('aria-expanded', 'true');
			positionChildListEl(itemEl, getChildListEl(itemEl));
			showEl(getMegaDropdownEl(itemEl));
			dispatchExpandEvent(itemEl);
		}
	
		// Helper method to dispatch o-layers new event
		function dispatchExpandEvent(itemEl) {
			utils.dispatchCustomEvent(itemEl, 'oLayers.new', { 'zIndex': 10, 'el': itemEl });
		}
	
		// Helper method to dispatch o-layers close event
		function dispatchCloseEvent(itemEl) {
			utils.dispatchCustomEvent(itemEl, 'oLayers.close', { 'zIndex': 10, 'el': itemEl });
		}
	
		// Handle clicks ourselved by expanding or collapsing selected element
		function handleClick(ev) {
			var itemEl = oDom.getClosestMatch(ev.target, 'li');
	
			if (itemEl && isControlEl(itemEl)) {
				ev.preventDefault();
	
				if (!isExpanded(itemEl)) {
					expandItem(itemEl);
				} else {
					collapseItem(itemEl);
				}
			}
		}
	
		// Position a level 3 nav and deeper
		function positionExpandedLevels() {
			// find deepest expanded menu element
			var openMenus = rootEl.querySelectorAll('li[aria-expanded="true"] > ul[data-o-hierarchical-nav-level]');
	
			// find the deepest level currently open
			var deepestLevel = -1;
			for (var c = 0, l = openMenus.length; c < l; c++) {
				deepestLevel = Math.max(deepestLevel, openMenus[c].getAttribute("data-o-hierarchical-nav-level"));
			}
	
			// start checking space / collapsing where needed
			for (var l = 2; l <= deepestLevel; l++) {
				var openLevelParentEl = rootEl.querySelector('[data-o-hierarchical-nav-level="' + l + '"] > [aria-expanded="true"]');
				var openLevelChildEl = rootEl.querySelector('[data-o-hierarchical-nav-level="' + l + '"] > [aria-expanded="true"] > ul');
	
				if (openLevelParentEl && openLevelChildEl) {
					positionChildListEl(openLevelParentEl, openLevelChildEl);
				}
			}
		}
	
		// Position level 3 and below on resize
		function resize() {
			positionExpandedLevels();
		}
	
		// Set all tabIndexes of a tags to 0
		function setTabIndexes() {
			var aEls = rootEl.querySelectorAll('li > a');
	
			for (var c = 0, l = aEls.length; c < l; c++) {
				if (!aEls[c].hasAttribute('href')) {
					if (aEls[c].tabIndex === 0) {
						// Don't override tabIndex if something else has set it, but otherwise set it to zero to make it focusable.
						aEls[c].tabIndex = 0;
					}
				}
			}
		}
	
		function setLayersContext() {
			// We'll use the body as the default context
			bodyDelegate.on('oLayers.new', function (e) {
				if (!isElementInsideNav(e.detail.el)) {
					collapseAll();
				}
			});
		}
	
		function init() {
			if (!rootEl) {
				rootEl = document.body;
			} else if (!(rootEl instanceof HTMLElement)) {
				rootEl = document.querySelector(rootEl);
			}
	
			rootEl.setAttribute('data-o-hierarchical-nav--js', '');
			setTabIndexes();
			setLayersContext();
			rootDelegate.on('click', handleClick);
			rootDelegate.on('keyup', function (ev) {
				// Pressing enter key on anchors without @href won't trigger a click event
				if (!ev.target.hasAttribute('href') && ev.keyCode === 13 && isElementInsideNav(ev.target)) {
					handleClick(ev);
				}
			});
	
			// Collapse all elements if the user clicks outside the nav
			bodyDelegate.on('click', function (ev) {
				if (!isElementInsideNav(ev.target)) {
					collapseAll();
				}
			});
		}
	
		function destroy() {
			rootDelegate.destroy();
			bodyDelegate.destroy();
			rootEl.removeAttribute('data-o-hierarchical-nav--js');
		}
	
		init();
	
		this.resize = resize;
		this.collapseAll = collapseAll;
		this.destroy = destroy;
	}
	
	module.exports = Nav;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(17);

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global exports*/
	
	function getClosestMatch(el, selector) {
		while (el) {
			if (el.matches(selector)) {
				return el;
			} else {
				el = el.parentElement;
			}
		}
		return false;
	}
	
	function getIndex(el) {
		var i = 0;
		if (el && typeof el === 'object' && el.nodeType === 1) {
			while (el.previousSibling) {
				el = el.previousSibling;
				if (el.nodeType === 1) {
					++i;
				}
			}
			return i;
		}
	}
	
	exports.getClosestMatch = getClosestMatch;
	exports.getIndex = getIndex;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global exports*/
	
	// Helper function that converts a list of elements into an array
	function nodeListToArray(nl) {
		return [].map.call(nl, function (element) {
			return element;
		});
	}
	
	// Helper function to dispatch events
	function dispatchCustomEvent(el, name, data) {
		if (document.createEvent && el.dispatchEvent) {
			var _event = document.createEvent('Event');
			_event.initEvent(name, true, true);
	
			if (data) {
				_event.detail = data;
			}
	
			el.dispatchEvent(_event);
		}
	}
	
	function isIE8() {
		var b = document.createElement('B');
		var docElem = document.documentElement;
		var isIE = undefined;
	
		b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
		docElem.appendChild(b);
		isIE = !!document.getElementById('ie8test');
		docElem.removeChild(b);
		return isIE;
	}
	
	exports.isIE8 = isIE8();
	exports.nodeListToArray = nodeListToArray;
	exports.dispatchCustomEvent = dispatchCustomEvent;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(20);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	var define = false;
	
	/*global require, module*/
	
	var Tabs = __webpack_require__(21);
	
	var constructAll = function constructAll() {
		Tabs.init();
		document.removeEventListener('o.DOMContentLoaded', constructAll);
	};
	
	document.addEventListener('o.DOMContentLoaded', constructAll);
	
	module.exports = Tabs;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var define = false;
	
	/*global module, require*/
	var oDom = __webpack_require__(16);
	
	var Tabs = (function () {
		function Tabs(rootEl, config) {
			_classCallCheck(this, Tabs);
	
			this.rootEl = rootEl;
			this.rootEl.setAttribute('data-o-tabs--js', '');
	
			this.updateUrl = rootEl.getAttribute('data-o-tabs-update-url') !== null;
			this.selectedTabIndex = -1;
	
			this.tabEls = this.rootEl.querySelectorAll('[role=tab]');
			this.tabEls = [].slice.call(this.tabEls).filter(this.tabHasValidUrl);
			this.tabpanelEls = this.getTabPanelEls(this.tabEls);
	
			this.boundClickHandler = this.clickHandler.bind(this);
			this.rootEl.addEventListener('click', this.boundClickHandler, false);
			this.boundKeyPressHandler = this.keyPressHandler.bind(this);
			this.rootEl.addEventListener('keypress', this.boundKeyPressHandler, false);
			this.boundHashChangeHandler = this.hashChangeHandler.bind(this);
			window.addEventListener('hashchange', this.boundHashChangeHandler, false);
	
			if (!config) {
				config = {};
				Array.prototype.forEach.call(this.rootEl.attributes, function (attr) {
					if (attr.name.includes('data-o-tabs')) {
						// Remove the unnecessary part of the string the first
						// time this is run for each attribute
						var key = attr.name.replace('data-o-tabs-', '');
	
						try {
							// If it's a JSON, a boolean or a number, we want it stored like that,
							// and not as a string. We also replace all ' with " so JSON strings
							// are parsed correctly
							config[key] = JSON.parse(attr.value.replace(/\'/g, '"'));
						} catch (e) {
							config[key] = attr.value;
						}
					}
				});
			}
	
			this.config = config;
			this.dispatchCustomEvent('ready', {
				tabs: this
			});
			this.selectTab(this.getSelectedTabIndex());
		}
	
		_createClass(Tabs, [{
			key: 'getTabTargetId',
			value: function getTabTargetId(tabEl) {
				// eslint-disable-line class-methods-use-this
				var linkEls = tabEl.getElementsByTagName('a');
				return linkEls && linkEls[0] ? linkEls[0].getAttribute('href').replace('#', '') : '';
			}
		}, {
			key: 'getTabPanelEls',
			value: function getTabPanelEls(tabEls) {
				var panelEls = [];
	
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;
	
				try {
					for (var _iterator = tabEls[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var tab = _step.value;
	
						var tabTargetId = this.getTabTargetId(tab);
						var targetEl = document.getElementById(tabTargetId);
	
						if (targetEl) {
							tab.setAttribute('aria-controls', tabTargetId);
							tab.setAttribute('tabindex', '0');
	
							var label = tab.getElementsByTagName('a')[0];
							var labelId = tabTargetId + '-label';
							label.setAttribute('tabindex', '-1');
							label.id = labelId;
							targetEl.setAttribute('aria-labelledby', labelId);
							targetEl.setAttribute('role', 'tabpanel');
							targetEl.setAttribute('tabindex', '0');
							panelEls.push(targetEl);
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator['return']) {
							_iterator['return']();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
	
				return panelEls;
			}
		}, {
			key: 'getTabElementFromHash',
			value: function getTabElementFromHash() {
				var tabLink = this.rootEl.querySelector('[href="' + location.hash + '"]');
				return tabLink && tabLink.parentNode ? tabLink.parentNode : null;
			}
		}, {
			key: 'getTabIndexFromElement',
			value: function getTabIndexFromElement(el) {
				// eslint-disable-line class-methods-use-this
				return oDom.getIndex(el);
			}
		}, {
			key: 'getSelectedTabElement',
			value: function getSelectedTabElement() {
				return this.rootEl.querySelector('[aria-selected=true]');
			}
		}, {
			key: 'getSelectedTabIndex',
			value: function getSelectedTabIndex() {
				var selectedTabElement = this.updateUrl && location.hash ? this.getTabElementFromHash() : this.getSelectedTabElement();
				return selectedTabElement ? this.getTabIndexFromElement(selectedTabElement) : 0;
			}
		}, {
			key: 'isValidTab',
			value: function isValidTab(index) {
				return !isNaN(index) && index >= 0 && index < this.tabEls.length;
			}
		}, {
			key: 'hidePanel',
			value: function hidePanel(panelEl) {
				// eslint-disable-line class-methods-use-this
				panelEl.setAttribute('aria-expanded', 'false');
				panelEl.setAttribute('aria-hidden', 'true');
			}
		}, {
			key: 'showPanel',
			value: function showPanel(panelEl, disableFocus) {
				panelEl.setAttribute('aria-expanded', 'true');
				panelEl.setAttribute('aria-hidden', 'false');
	
				// Remove the focus ring for sighted users
				panelEl.style.outline = 0;
	
				if (disableFocus) {
					return;
				}
	
				// update the url to match the selected tab
				if (panelEl.id && this.updateUrl) {
					location.href = '#' + panelEl.id;
				}
	
				// Get current scroll position
				var x = window.scrollX || window.pageXOffset;
				var y = window.scrollY || window.pageYOffset;
	
				// Give focus to the panel for screen readers
				// This might cause the browser to scroll up or down
				panelEl.focus();
	
				// Scroll back to the original position
				window.scrollTo(x, y);
			}
		}, {
			key: 'dispatchCustomEvent',
			value: function dispatchCustomEvent(event) {
				var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
				var namespace = arguments.length <= 2 || arguments[2] === undefined ? 'oTabs' : arguments[2];
	
				this.rootEl.dispatchEvent(new CustomEvent(namespace + '.' + event, {
					detail: data,
					bubbles: true
				}));
			}
		}, {
			key: 'selectTab',
			value: function selectTab(newIndex) {
				if (this.isValidTab(newIndex) && newIndex !== this.selectedTabIndex) {
					for (var i = 0; i < this.tabEls.length; i++) {
						if (newIndex === i) {
							this.tabEls[i].setAttribute('aria-selected', 'true');
							this.showPanel(this.tabpanelEls[i], this.config.disablefocus);
						} else {
							this.tabEls[i].setAttribute('aria-selected', 'false');
							this.hidePanel(this.tabpanelEls[i]);
						}
					}
	
					this.dispatchCustomEvent('tabSelect', {
						tabs: this,
						selected: newIndex,
						lastSelected: this.selectedTabIndex
					});
	
					this.selectedTabIndex = newIndex;
				}
			}
		}, {
			key: 'clickHandler',
			value: function clickHandler(ev) {
				var tabEl = oDom.getClosestMatch(ev.target, '[role=tab]');
	
				if (tabEl && this.tabHasValidUrl(tabEl)) {
					ev.preventDefault();
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'keyPressHandler',
			value: function keyPressHandler(ev) {
				var tabEl = oDom.getClosestMatch(ev.target, '[role=tab]');
				// Only update if key pressed is enter key
				if (tabEl && ev.keyCode === 13 && this.tabHasValidUrl(tabEl)) {
					ev.preventDefault();
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'hashChangeHandler',
			value: function hashChangeHandler() {
				if (!this.updateUrl) {
					return;
				}
	
				var tabEl = this.getTabElementFromHash();
	
				if (tabEl) {
					this.updateCurrentTab(tabEl);
				}
			}
		}, {
			key: 'updateCurrentTab',
			value: function updateCurrentTab(tabEl) {
				var index = this.getTabIndexFromElement(tabEl);
				this.selectTab(index);
				this.dispatchCustomEvent('event', {
					category: 'tabs',
					action: 'click',
					tab: tabEl.textContent.trim()
				}, 'oTracking');
			}
		}, {
			key: 'tabHasValidUrl',
			value: function tabHasValidUrl(tabEl) {
				// eslint-disable-line class-methods-use-this
				var linkEls = tabEl.getElementsByTagName('a');
				if (!linkEls || !linkEls[0].hash) {
					return false;
				}
				return linkEls[0].pathname === location.pathname;
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				this.rootEl.removeEventListener('click', this.boundClickHandler, false);
				this.rootEl.removeEventListener('keypress', this.boundKeyPressHandler, false);
				window.removeEventListener('hashchange', this.boundHashChangeHandler, false);
				this.rootEl.removeAttribute('data-o-tabs--js');
	
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;
	
				try {
					for (var _iterator2 = this.tabpanelEls[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var tabPanelEl = _step2.value;
	
						this.showPanel(tabPanelEl);
					}
	
					// unset the bound event handlers
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2['return']) {
							_iterator2['return']();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}
	
				this.boundClickHandler = undefined;
				this.boundKeyPressHandler = undefined;
				this.boundHashChangeHandler = undefined;
				// Destroy ALL the things!
				this.tabEls = undefined;
				this.tabpanelEls = undefined;
				this.updateUrl = undefined;
				this.selectedTabIndex = undefined;
				this.rootEl = undefined;
				this.config = undefined;
			}
		}], [{
			key: 'init',
			value: function init(rootEl, config) {
				if (!rootEl) {
					rootEl = document.body;
				}
				if (!(rootEl instanceof HTMLElement)) {
					rootEl = document.querySelector(rootEl);
				}
	
				if (rootEl instanceof HTMLElement && /\bo-tabs\b/.test(rootEl.getAttribute('data-o-component'))) {
					if (!rootEl.matches('[data-o-tabs-autoconstruct=false]') && !rootEl.hasAttribute('data-o-tabs--js')) {
						return new Tabs(rootEl, config);
					}
				}
	
				if (rootEl.querySelectorAll) {
					var tabElements = rootEl.querySelectorAll('[data-o-component=o-tabs]:not([data-o-tabs-autoconstruct=false]):not([data-o-tabs--js])');
	
					return Array.from(tabElements, function (tabEl) {
						return new Tabs(tabEl, config);
					});
				}
			}
		}]);
	
		return Tabs;
	})();
	
	exports['default'] = Tabs;
	module.exports = exports['default'];

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map
//# sourceMappingURL=bundle.js.map
