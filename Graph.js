//Module for creating SVG graphs quickly and easily (HIGHLY flexible, everything is optional/changeable)
/*
	See example page: index.html
	--------------------------------------
	Coming soon: (* denotes current focus)
	scatter graphs,
	x/y axis names,
	finish plugin, *
	average lines for bar and scatter graphs,
*/
var Graph = Graph || (function($) {
	"use strict";
	var Private = {};
	Private.count = 0;
	var Graph = function(obj) {
		Private.setOptions.call(this, obj);
		++Private.count;
	};
	Private.defaults = function() {
		return {
			//default options
			x: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			y: 10,
			attachTo: 'body',
			points: [0, 26, 33, 74, 12, 49, 18]
		};
	};
	//important stuff you might want automatically
	Private.basics = function(height, width, graphHeight, graphWidth) {
		//basically, if no graph height/width is given we just make it equal the svg height/width
		height = graphHeight || height || 300;
		width = graphWidth || width || 550;
		//make sure we can take substring
		height = height.toString();
		width = width.toString();
		//so we can let them use percentages, we need the CSS of container
		Private.attachTo = Private.attachTo || 'body';
		var containerHeight = $(Private.attachTo).css('height');
		var containerWidth = $(Private.attachTo).css('width');
		//if its a percentage they probably mean fill the graph, so use it
		height = (height.substring(height.length - 1) === '%') ? containerHeight : height;
		width = (width.substring(width.length - 1) === '%') ? containerWidth : width;
		return {
			//if user inputed a % or px, chop it off with parseFloat
			Gheight: parseFloat(height),
			Gwidth: parseFloat(width),
			//Distances between lines
			xDist: 60,
			yDist: 30,
			scale: 10,
			//leave space for labels:
			xOffset: 25,
			yOffset: 20,
			yStart: 0, // what number do we want to start from for y labels
			mainOffset: 35, //to seperate everything from the ylabels
			padding: 10, //keep labels from touching edges
			//single points
			xOfPoints: [], //get x and y coordinates of points
			yOfPoints: [],
			//multiple points
			mxOfPoints: [],
			myOfPoints: [],
			multiplePoints: false,
			legend: false,
			interactive: true,
			grid: true,
			xGrid: true,
			yGrid: true,
			xName: null,
			yName: null,
			special: null,
			showPoints: true,
			noLines: false,
			pointRadius: 5,
			pieSize: 200,
			//add some html before append
			before: '',
			//after append:
			after: '',
			title: '', //title of graph to be written in SVG
			id: 'SVGGraph' + Private.count
		};
	};
	//create jquery css header
	Private.parseS = function(id, then) {
		return 'svg[id="' + id + '"] ' + then;
	};
	//turn an id into jQuery selector format
	Private.id2selector = function(id) {
		var stuff = id.split(' '); //split into components
		id = stuff[0]; //only want the first word (id)
		var selector = 'svg[id="';
		if (id.charAt(0) === '#') { //make sure it's an id
			selector += id.substring(1) + '"]';
			//append everything else to the end
			for (var i = 1; i < stuff.length; ++i) {
				selector += ' ' + stuff[i];
			}
		} else {
			return id;
		}
		return selector;
	};
	Private.styles = function(obj) {
		//first way to style is by creating an object representing the CSS
		obj.byCSS = obj.byCSS || {};
		//second way to style something is by modifying default styles
		obj.styles = obj.styles || {};
		var xAnchor = (obj.type === 'bar') ? 'start' : 'middle';
		//which replaces defaults below
		var height = obj.height || '100%';
		var width = obj.width || '100%';
		var styling = {};
		styling.style = {};
		styling.style[this.parseS(obj.id, '')] = {
			"height": height,
			"width": width
		};
		styling.style[this.parseS(obj.id, '.grid')] = {
			"stroke": obj.styles.gridStroke || "#000",
			"stroke-width": obj.styles.gridStrokeWidth || "1"
		};
		styling.style[this.parseS(obj.id, '.points')] = {
			"stroke": obj.styles.pointStroke || "grey",
			"stroke-width": obj.styles.strokeWidth || "4",
			"cursor": 'pointer'
		};
		styling.style[this.parseS(obj.id, 'circle')] = {
			"opacity": 0.7
		};
		styling.style[this.parseS(obj.id, '.inset')] = {
			"fill": obj.styles.pointFill || "lightblue"
		};
		styling.style[this.parseS(obj.id, '.labels')] = {
			"fill": obj.styles.labelFill || "#000",
			"stroke": obj.styles.labelStroke || "none",
			"font-family": obj.styles.labelFont || "Arial",
			"font-size": obj.styles.labelFontSize || "12px",
			"kerning": obj.styles.labelKerning || "2"
		};
		styling.style[this.parseS(obj.id, '.lines')] = {
			"stroke": obj.styles.lineStroke || "darkgrey",
			"stroke-width": obj.styles.lineStokeWidth || "2"
		};
		styling.style[this.parseS(obj.id, '.line-of-1')] = {
			"stroke": obj.styles.lineStroke || "green",
			"stroke-width": obj.styles.lineStokeWidth || "2"
		};
		styling.style[this.parseS(obj.id, '.rect')] = {
			"stroke": obj.styles.lineStroke || "grey",
			"stroke-width": obj.styles.lineStokeWidth || "2",
			'fill': 'blue',
			'opacity': 0.7
		};
		styling.style[this.parseS(obj.id, '.SVG-tooltip')] = {
			"fill": obj.styles.tooltipFill || "#000",
			"stroke": obj.styles.tooltipStroke || "none",
			"font-family": obj.styles.tooltipFont || "Arial",
			"font-size": obj.styles.tooltipFontSize || "12px",
			"display": 'none',
			"opacity": '1'
		};
		styling.style[this.parseS(obj.id, '.SVG-tooltip-box')] = {
			"display": 'none',
			"opacity": "0.7",
			"fill": 'blue',
			"stroke": obj.styles.lineStroke || "grey",
			"stroke-width": obj.styles.lineStokeWidth || "2"
		};
		styling.style[this.parseS(obj.id, '.area')] = {
			"opacity": "0.5",
			"fill": 'blue'
		};
		styling.style[this.parseS(obj.id, '.slice')] = {
			"opacity": "0.7"
		};
		styling.style[this.parseS(obj.id, '.labels.x-labels')] = {
			"text-anchor": obj.styles.xLabelAnchor || xAnchor
		};
		styling.style[this.parseS(obj.id, '.labels.y-labels')] = {
			"text-anchor": obj.styles.yLabelAnchor || "end"
		};
		styling.style['table[id="' + obj.id + '"]'] = {
			"height": height,
			"width": width,
			"border-collapse": 'collapse',
			"text-align": 'center'
		};
		//when using multiple lines make them different colors automatically
		var colors = obj.colors || ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'brown'];
		if (obj.colors) obj.colors.push(''); //so bar spaces dont takeup colors
		for (var i = 0; i < colors.length; ++i) {
			styling.style[this.parseS(obj.id, '.line-of-' + i)] = {
				"stroke": obj.styles.lineStroke || colors[i],
				"stroke-width": obj.styles.lineStokeWidth || "2"
			};
			styling.style[this.parseS(obj.id, '.path-of-' + i)] = {
				"fill": colors[i],
				"opacity": 0.7
			};
			styling.style[this.parseS(obj.id, '.rect-of-' + i)] = {
				"fill": colors[i],
				"opacity": 0.7
			};
		}
		//for styling completely with your own object
		for (var name in obj.byCSS) {
			//make sure id is in proper form
			styling.style[this.id2selector(name)] = obj.byCSS[name]; //make styling = users object
		}
		return styling;
	};
	//handle this.obj
	Private.setOptions = function(obj) {
		obj = obj || {};
		if (obj.attachTo) {
			obj.attachTo = (obj.attachTo.charAt(0) === '#') ? obj.attachTo : '#' + obj.attachTo; //make hash optional (attchTo)
			Private.attachTo = obj.attachTo; //for basics(), which cant access this.obj.attachTo in time
		}
		if (obj.id) obj.id = (obj.id.charAt(0) === '#') ? obj.id.substring(1) : obj.id; //make hash optional (id)
		//do basic setup automatically
		if (obj.basic === true || typeof obj.basic === 'undefined') {
			this.obj = Private.basics(obj.height, obj.width, obj.graphHeight, obj.graphWidth);
		}
		//merge with defaults
		if ((obj && obj.example === true) || !$.isEmptyObject(obj)) { //if example chosen or no options given
			obj.id = obj.id || this.obj.id;
			//everything user did not specify is filled with defaults + basics + style
			//style needs id passed in so it can be replaced from basics().id
			$.extend(this.obj, Private.defaults(), obj, Private.styles(obj)); //ORDER MATTERS WITH $.EXTEND
			this.obj.addStyle = true;
		} else if (obj && obj.addStyle === true) { //only add styling
			$.extend(this.obj, Private.styles(obj), obj);
		} else if (obj) {
			this.obj = obj; //only use given args
		}
	};
	Graph.prototype.save = function() { //save a graph as stringified JSON (can expand later)
		return JSON.stringify(this.obj);
	};
	Graph.prototype.genToFunc = function(str) {
		//turn generic string into function name
		return 'Graph' + str.charAt(0).toUpperCase() + str.substring(1);
	};
	Graph.prototype.expand = function(obj, thing) { //expand JSON into a graph (requires 'type' property of 'obj')
		var obj = (typeof obj === 'string') ? jQuery.parseJSON(obj) : obj; //if in string form parse it
		var graph;
		var graph = new window[this.genToFunc(this.obj.type)](obj);
		thing = thing || '';
		graph.init(thing);
	};
	Graph.prototype.update = function(obj) { //recall script file to update graph with new obj
		obj = obj || {};
		obj.byCSS = this.obj.byCSS;
		//reset options with new stuff
		this.expand(obj, 'update'); //recreate graph
	};
	//turn one type of graph into another  (can also make changes with obj)
	Graph.prototype.to = function(what) {
		//update graph as a new type
		this.obj.type = what;
		this.expand(this.obj, 'update');
	};
	Graph.prototype.createGrid = function(xLines, yLines) {
		var self = this.obj;
		var xGrid = '',
			yGrid = '',
			weird = self.yDist - 30;
		//make sure they want the grid
		if (self.grid && !self.noLines) {
			//save final x of xlines so ylines dont pass that boundary
			var finalY = (self.height) - yLines * (self.yDist);
			var nxt;
			//X-GRID LINES
			if (self.xGrid) {
				for (var i = 0; i < xLines; ++i) {
					//x1 and x2 must be the same (dist. from left), 
					//start at very top (y1 = 0), all the way to the bottom (y = height)
					nxt = i * self.xDist + self.mainOffset;
					xGrid += '<line x1="' + nxt + '" x2="' + nxt + '" y1="' + (self.height - self.yOffset - self.padding - weird) +
						'" y2="' + (finalY) + '"></line>';
				}
			}
			var finalX = (xLines - 1) * self.xDist + self.mainOffset;
			//Y-GRID LINES
			if (self.yGrid) {
				for (var i = 1; i <= yLines; ++i) {
					//y1 and y2 must be the same (dist. from top),
					//ALL x1's & x2's must be the same so we start at same dist. from left & right
					nxt = (self.height) - i * (self.yDist);
					//finalX need not be added to mainoffset because nxt already accounts for it mathematically
					yGrid += '<line x1="' + self.mainOffset + '" x2="' + (finalX) + '" y1="' + nxt + '" y2="' + nxt + '"></line>';
				}
			}
		} else {
			//leave the first vert. and horiz. line for them for obvious styling purposes
			//they still have the option to remove this with noLines
			if (self.noLines === false) {
				xGrid += '<line x1="' + self.mainOffset + '" x2="' + self.mainOffset +
					'" y1="' + (self.height - self.yOffset - self.padding - weird) + '" y2="' + ((self.height) - yLines * (self.yDist)) + '"></line>';
				yGrid += '<line x1="' + self.mainOffset + '" x2="' + ((xLines - 1) * self.xDist + self.mainOffset) +
					'" y1="' + (self.height - self.yDist) + '" y2="' + (self.height - self.yDist) + '"></line>';
			}
		}
		return {
			xGrid: xGrid,
			yGrid: yGrid
		};
	};
	Graph.prototype.applyStyling = function() {
		//Add CSS as value for every key in style
		if (this.obj.addStyle) {
			for (var i in this.obj.style) {
				$(i).css(this.obj.style[i]);
			}
		}
	};
	//initialize global tags
	Graph.prototype.openTags = function() {
		return {
			SVG: '<svg id="' + this.obj.id + '"class="graph"style="' + (this.obj.css || '') + '">', //begin all groups
			xGrid: '<g class="grid x-grid" id="xGrid">',
			yGrid: '<g class="grid y-grid" id="yGrid">',
			xLabels: '<g class="labels x-labels">',
			yLabels: '<g class="labels y-labels">',
			title: '<g class="labels title">'
		};
	};
	//add X and Y labels to graph
	Graph.prototype.addLabels = function() {
		var self = this.obj;
		var xLabels = '',
			yLabels = '';
		//xLABELS
		for (var i = 0; i < self.x.length; ++i) {
			xLabels += '<text x="' + (i * self.xDist + self.mainOffset) + '" y="' +
				(self.height - self.padding) + '">' + self.x[i] + '</text>';
		}
		//name of X-Axis:
		// if (self.xName !== null) {
		// 	xLabels += '<text x="' + (self.width/2 - self.mainOffset - self.padding - self.yOffset) + '" y="' +
		// 		(self.height) + '">' + self.xName + '</text>';
		// }
		//yLABELS
		for (var i = 1; i <= self.y + 1; ++i) {
			var digit = (i * self.scale - self.scale + self.yStart); //get multiple of scale as number displayed
			var x = (digit >= 10) ? self.xOffset : self.xOffset - 10; //clean it up: move 1 digit numbers 1 place to the left
			//y subtracted from height to invert graph
			yLabels += '<text x="' + x + '" y="' + ((self.height - (self.yDist * i - self.padding)) - 5) +
				'">' + digit + '</text>';
		}
		//name of Y-Axis:
		// if (self.yName !== null) {
		// 	yLabels += '<text transform="rotate(-90)"x="' + (-self.height/2) + '" y="' + (self.yDist - self.padding) +
		// 		'">' + self.yName + '</text>';
		// }
		return {
			xLabels: xLabels,
			yLabels: yLabels
		};
	};
	Graph.prototype.addTitle = function(yLines) {
		return '<text x="' + (this.obj.mainOffset) + '" y="' +
			((this.obj.height) - yLines * (this.obj.yDist) - this.obj.yOffset) +
			'">' + this.obj.title + '</text>';
	};
	//close all tags, append to DOM, and add styling (SVG only
	Graph.prototype.finishGraph = function(xLines, yLines, E, thing) {
		if (this.obj.type !== 'pie') {
			//build grid
			E.xGrid += this.createGrid(xLines, yLines).xGrid;
			E.yGrid += this.createGrid(xLines, yLines).yGrid;
			//LABELS
			E.xLabels += this.addLabels().xLabels;
			E.yLabels += this.addLabels().yLabels;
		}
		E.title += this.addTitle(yLines);
		if (this.obj.legend) E.legend = this.addLegend(thing);
		//COMBINING DYNAMICALLY
		E.points = E.points || '';
		for (var i in E) {
			if (E[i] !== E.points) { //so we can add last to increase z-index
				if (i !== 'SVG') E.SVG += E[i] + '</g>';
			}
		}
		E.SVG += E.points + '</svg>';
		//"thing" will determine where to put the new graph
		var finish = this.obj.before + E.SVG + this.obj.after;
		this.handleAppend(thing, finish);
		//STYLING
		this.applyStyling();
		return E.SVG;
	};
	Graph.prototype.handleAppend = function(thing, finish) {
		switch (thing) {
			case 'update':
				$('#' + this.obj.id).replaceWith(finish); //replace old graph with this one
				break;
			default:
				$(this.obj.attachTo).append(finish);
		}
	};
	Graph.prototype.addLegend = function(thing) {
		var self = this.obj;
		var hoverHandle = function(what) {
			var to = (what === 'add') ? 1 : 0.7;
			var clas = $(this).attr('class').substring(6);
			var selector = '[class$="' + clas + '"][id^="' + $(this).attr('id').split('-')[1] + '"]';
			$('line' + selector + ', rect' + selector + ', path' + selector).each(function() {
				$(this).css('opacity', to);
			});
		}
		if (self.interactive && self.multiplePoints) {
			$(function() {
				$(document).on('mouseover', 'g[id^="legend-"]', function() {
					hoverHandle.call(this, 'add');
				});
				$(document).on('mouseout', 'g[id^="legend-"]', function() {
					hoverHandle.call(this, 'take');
				});
			});
		}
		var xDist = self.xDist;
		var legend = '<g class="legend">';
		var x = self.legendX || (self.Gwidth - self.xDist);
		var width = 30; //width of rect
		var height = 30;
		self.dataNames = self.dataNames || [];
		if (self.multiplePoints || self.type === 'pie') {
			var y = self.yOffset;
			for (var i = 0; i < self.points.length; ++i) {
				legend += '<g id="legend-' + self.id + '"class="legend-of-' + i + '">';
				//RECT
				legend += '<rect class="rect-of-' + i + '"x="' + (x) +
					'" y="' + (y) + '"width="' + width + '"height="' + height + '"></rect>';
				//TEXT
				legend += '<text style="cursor:default;"class="legend-of-' + i + '"x="' + (x + width + 5) +
					'"y="' + (y + height / 2) + '">' + (self.dataNames[i] || 'Data' + (i === 0 ? '' : ' ' + i)) + '</text>';
				legend += '</g>';
				y += self.yDist + self.padding;
			}
		}
		return legend;
	};
	Graph.prototype.help = function() { // show a popup with help information
		alert("Someday this will actually be helpful.");
	};
	return Graph;
})(jQuery);
var GraphLinear = GraphLinear || (function($) {
	"use strict";
	var GraphLinear = function(obj) { //extends "Graph"
		obj = obj || {};
		obj.type = 'linear';
		Graph.call(this, obj);
		var pointHandle = function(action) {
			var $nat = $(this).attr('id');
			var matcher = $nat.split('-');
			var id = matcher[0];
			var num = matcher[1];
			var thiz = this; //reference the point that called us
			$('svg line[id^="' + id + '"], svg path[id^="' + id + '"]').each(function() {
				if ($(this).attr('id').split('-')[1] === num) {
					var tooltip = '#' + $(thiz).attr('class') + '-tooltip';
					var tooltipRect = '#' + $(thiz).attr('class') + '-tooltip-rect';
					var s = parseFloat($(this).css('stroke-width'));
					if (action === 'add') {
						$(this).css('stroke-width', obj.lineStrokeWidth || 3);
						$(this).css('opacity', 1);
						$(tooltip).show();
						$(tooltipRect).show();
					} else {
						$(this).css('stroke-width', obj.lineStrokeWidth - 1 || 2);
						$(this).css('opacity', 0.7);
						$(tooltip).hide();
						$(tooltipRect).hide();
					}
				}
			});
		}
		//set click handlers for tooltips
		if (this.obj.interactive) {
			var thiz = this;
			$(function() {
				$(document).on('mouseover', 'svg circle[id$="point"]', function(e) {
					pointHandle.call(this, 'add');
					$(this).css('opacity', 1);
				});
				$(document).on('mouseleave', 'svg circle[id$="point"]', function(e) {
					pointHandle.call(this, 'sub');
					$(this).css('opacity', thiz.obj.style['svg[id="' + thiz.obj.id + '"] circle'].opacity || 0.7);
				});
			});
		}
	};
	GraphLinear.prototype = Object.create(Graph.prototype);
	GraphLinear.prototype.constructor = GraphLinear;
	GraphLinear.prototype.buildPoints = function(arr) {
		var inc, x, j, points, str, html, mult, num, i, r = this.obj.pointRadius,
			self = this.obj;
		//stuff that changes based on multiple points:
		if (arr.length === 1) {
			//only have "i" var
			points = self.points[arr[0]];
			str = arr[0];
			i = arr[0];
			mult = false;
		} else if (arr.length === 2) {
			//have "i" and then "t" var
			points = self.points[arr[0]][arr[1]];
			str = '' + arr[0] + arr[1]; //to get proper identifier
			i = arr[1];
			mult = true;
		}
		inc = self.height - ((points + self.scale) * (self.yDist / self.scale)); //subtract from height to invert graph
		x = i * self.xDist + self.mainOffset;
		num = (mult === false) ? 0 : arr[0];
		//circles
		html = '<circle id="' + self.id + '-' + num + '-point"class="' + self.id + '-point' + str +
			'"cx="' + x + '" cy="' + inc + '" r="' + r + '"></circle>'; //cx is always on a vert. line
		//TOOLTIPS
		//rectangle
		html += '<g><rect class="SVG-tooltip-box"id="' + self.id + '-point' +
			str + '-tooltip-rect"rx="10"x="' + (x - self.padding * 2) + '"y="' + (inc - self.yDist - self.padding * 2) +
			'"height="' + (self.yDist + self.padding / 2) + '"width="' + (50) + '"/>';
		//text
		html += '<text class="SVG-tooltip"id="' + self.id + '-point' + str + '-tooltip" x="' +
			(x - self.padding) + '" y="' + (inc - self.yDist) + '">' + points + '</text></g>';
		return html;
	};
	GraphLinear.prototype.init = function(thing) {
		var self = this.obj; //shorthand from here on...
		//correct values (atm has user inputed version, whereas G... is clean)
		self.width = self.Gwidth;
		self.height = self.Gheight;
		var E = this.openTags(); //elements
		E.lines = '<g class="lines">'; //connecting points
		E.points = '<g class="inset points">';
		var area = self.special === 'area';
		if (area && !self.multiplePoints) E.path = '<g class="area"><path id="' + self.id + '-0-path"class="path-of-0"d="';
		//*remember: xLines are vertical, yLines are horizontal
		var xLines = self.x.length;
		var yLines = self.y + 1; //+1 because line 1 is at origin
		var r = 5; //radius of circle
		var hmdist = self.height - self.yDist;
		if (!self.multiplePoints) { //single line graph
			//POINTS (INDIVIDUAL)
			var inc, x, j;
			for (var i = 0; i < xLines; ++i) {
				inc = self.height - ((self.points[i] + self.scale) * (self.yDist / self.scale)); //subtract from height to invert graph
				//set our x coor depending on i due to offset (first and last are special) :/;
				x = i * self.xDist + self.mainOffset;
				if (self.showPoints === true) {
					E.points += this.buildPoints([i]);
				}
				//store coordinates so we can easily connect them with lines
				self.xOfPoints.push(x);
				self.yOfPoints.push(inc);
			}
			//LINES
			for (var i = 0; i < self.points.length - 1; ++i) {
				j = i + 1; //get next point coordinate
				//to connect two points: x1 = (x of first point), x2 = (x of second point),
				//y1 = (y of first point), y2 = (y of second point)
				E.lines += '<line id="' + self.id + '-0-line" x1="' + self.xOfPoints[i] + '" x2="' +
					self.xOfPoints[j] + '" y1="' + self.yOfPoints[i] + '" y2="' + self.yOfPoints[j] + '"></line>';
			}
			if (area) {
				//PATHS 
				//building SVG path params
				//handling seprately because Moveto is important
				E.path += 'M' + self.xOfPoints[0] + ',' + (hmdist) + ' '; //make sure origin is included
				E.path += 'L' + self.xOfPoints[0] + ',' + self.yOfPoints[0] + ' '; //draw from origin to first point
				for (var i = 1; i < self.xOfPoints.length; ++i) {
					E.path += 'L' + self.xOfPoints[i] + ',' + self.yOfPoints[i] + ' '; //draw line to next point
				}
				E.path += 'L' + self.xOfPoints[self.xOfPoints.length - 1] + ',' + (hmdist) + ' Z"></path>';
			}
		} else {
			var inc, x, j;
			//we need to push the right # of empty arrays into the multi arrays for points
			for (var i = 0; i < self.points.length; ++i) {
				self.mxOfPoints.push([]);
				self.myOfPoints.push([]);
			}
			if (area) {
				E.path = '<g class="area">';
				var paths = [];
			}
			//multiple points are in a multi-dimensional array, so treat it as such with double loops
			for (var i = 0; i < self.points.length; ++i) {
				//chain of index vars: i -> t
				//POINTS (INDIVIDUAL)
				for (var t = 0; t < self.points[i].length; ++t) {
					inc = self.height - ((self.points[i][t] + self.scale) * (self.yDist / self.scale));
					x = t * self.xDist + self.mainOffset;
					if (self.showPoints === true) {
						E.points += this.buildPoints([i, t]);
					}
					self.mxOfPoints[i].push(x);
					self.myOfPoints[i].push(inc);
				}
				//LINES
				for (var t = 0; t < self.points[i].length - 1; ++t) {
					j = t + 1; //get next point coordinate
					//number class name for different colors
					E.lines += '<line id="' + self.id + '-' + i + '-line" class="line-of-' + i +
						'" x1="' + self.mxOfPoints[i][t] + '" x2="' + self.mxOfPoints[i][j] +
						'" y1="' + self.myOfPoints[i][t] + '" y2="' + self.myOfPoints[i][j] + '"></line>';
				}
				if (area) {
					//PATHS
					paths.push('<path id="' + self.id + '-' + i + '-path"class="path-of-' + i + '" d="');
					paths[i] += 'M' + self.mxOfPoints[i][0] + ',' + (hmdist) + ' ';
					paths[i] += 'L' + self.mxOfPoints[i][0] + ',' + self.myOfPoints[i][0] + ' ';
					for (var t = 0; t < self.points[i].length; ++t) {
						paths[i] += 'L' + self.mxOfPoints[i][t] + ',' + self.myOfPoints[i][t] + ' ';
					}
					paths[i] += 'L' + self.mxOfPoints[i][self.mxOfPoints[i].length - 1] + ',' + (hmdist) + ' Z"></path>';
				}
			}
			if (area) {
				E.path += paths.join('');
			}
		}
		this.finishGraph(xLines, yLines, E, thing); //close tags, style, and append
	};
	return GraphLinear;
})(jQuery);
var GraphBar = GraphBar || (function($) {
	"use strict";
	var GraphBar = function(obj) {
		obj = obj || {};
		obj.type = 'bar';
		Graph.call(this, obj);
		//set click handlers for tooltips
		if (this.obj.interactive) {
			var thiz = this;
			$(function() {
				$(document).on('mouseover', 'svg rect', function(e) {
					$('#' + $(this).attr('id') + '-tooltip').show();
					$('#' + $(this).attr('id') + '-tooltip-rect').show();
					$(this).css('opacity', 0.8);
				});
				$(document).on('mouseleave', 'svg rect', function(e) {
					$('#' + $(this).attr('id') + '-tooltip').hide();
					$('#' + $(this).attr('id') + '-tooltip-rect').hide();
					$(this).css('opacity', thiz.obj.style['svg[id="' + thiz.obj.id + '"] .rect'].opacity || 0.7);
				});
			});
		}
	};
	GraphBar.prototype = Object.create(Graph.prototype);
	GraphBar.prototype.constructor = GraphBar;
	GraphBar.prototype.init = function(thing) {
		var self = this.obj;
		self.width = self.Gwidth;
		self.height = self.Gheight;
		var xLines = self.x.length + 1; //needs one more because each x label takes entire column
		var yLines = self.y + 1;
		var E = this.openTags();
		E.rects = '<g class="rects">';
		var inc, x, y, weird; //increment
		weird = self.yDist - 30;
		if (!self.multiplePoints) {
			for (var i = 0; i < xLines - 1; ++i) {
				//height must = last section of "y"
				//if i = 0, let inc = 1 so we can at least see at line at origin
				inc = (self.points[i] !== 0) ? ((self.points[i] + self.scale) * (self.yDist / self.scale)) - self.yDist : 2;
				x = (i * self.xDist + self.mainOffset);
				y = (self.height - self.padding - self.yOffset - (inc));
				//bars
				E.rects += '<rect class="rect"id="' + self.id + '-point-' + i + '" x="' + x +
					'" y="' + (y - weird) +
					'" width="' + self.xDist + '" height="' + (inc) + '"/>';
				//tooltip box
				E.rects += '<g><rect class="SVG-tooltip-box"id="' + self.id + '-point-' +
					i + '-tooltip-rect"rx="1"x="' + (x + self.padding / 2) + '"y="' + (y - weird - self.yDist - self.padding * 2) +
					'"height="' + (self.yDist + self.padding / 2) + '"width="' + (self.xDist - self.padding) + '"/>';
				//tooltip text
				E.rects += '<text class="SVG-tooltip"id="' + self.id + '-point-' + i +
					'-tooltip" x="' + (x + (self.xDist) / 2 - self.padding) + '" y="' +
					(y - weird - self.yDist / 2 - self.padding) + '">' + self.points[i] + '</text></g>';
			}
		} else {
			E.points += '<g class="lines">';
			//okay, so we need to get the first point of each array
			//then display them side by side and so on
			var max = 0;
			for (var i = 0; i < self.points.length; ++i) { //get longest array of points:
				if (max < self.points[i].length) max = self.points[i].length;
			}
			//add spaces between data sets
			var spaces = [];
			for (var i = 0; i < max; ++i) {
				spaces.push(0);
			}
			self.points.push(spaces);
			var xDist = self.xDist / self.points.length;
			var j = 0;
			var all;
			var ref;
			var avgs = []; //to store averages for average line
			for (var i = 0; i < max; ++i) { //so we get throguh the length of every array
				for (var t = 0; t < self.points.length; ++t) { //this lets us loop array td instead of lr with j
					if (t !== self.points.length - 1) { //skip over spaces array
						all = t + j + (i * (self.points.length - 1));
						ref = t + j + i * 2;
						inc = (self.points[t][j] !== 0) ? ((self.points[t][j] + self.scale) * (self.yDist / self.scale)) - self.yDist : 2;
						x = ((all) * (xDist) + self.mainOffset);
						self.xOfPoints.push(x);
						y = (self.height - self.padding - self.yOffset - (inc));
						//bars
						E.rects += '<rect class="rect-of-' + t + '"id="' + self.id + '-point-' + (ref) + '" x="' + x +
							'" y="' + (y - weird) +
							'" width="' + (xDist) + '" height="' + (inc) + '"/>';
						//tooltip box
						E.rects += '<g><rect class="rect-of-' + t + ' SVG-tooltip-box "id="' + self.id + '-point-' +
							(ref) + '-tooltip-rect"rx="1"x="' + (x) + '"y="' + (y - weird - self.yDist - self.padding * 2) +
							'"height="' + (self.yDist + self.padding / 2) + '"width="' + (xDist) + '"/>';
						//tooltip text
						E.rects += '<text class="SVG-tooltip"id="' + self.id + '-point-' + (ref) +
							'-tooltip" x="' + (x + (xDist) / 2 - self.padding) + '" y="' +
							(y - weird - self.yDist / 2 - self.padding) + '">' + self.points[t][j] + '</text></g>';
						if (j === i) {
							//grouping each X value
							avgs.push(y - inc);
						}
					}
				}
				++j;
			}
			self.points.pop(); //remove spacing array
			//AVERAGE LINES
			/*var avgPts = [];
			for (var i = 0; i < avgs.length; i += self.points.length) {
				avgPts.push((function() {
					var sums = 0;
					//add up points tb then return avg.
					for (var t = 0; t < self.points.length; ++t) {
						sums += avgs[i + t];
					}
					return sums / self.points.length;
				})());
			}
			//so now avgPts holds our avg points for every nth bar; lets draw line to each one from loop
			console.log(avgPts);
			for (var i = 0; i < avgPts.length; ++i) {
				var j = i + 1;
				E.points += '<line id="' + self.id + '-0-line" x1="' + (self.xOfPoints[i] + xDist + xDist/self.points.length) + '" x2="' +
					(self.xOfPoints[j] + xDist) + '" y1="' + avgPts[i] + '" y2="' + avgPts[j] + '"></line>';
			}*/
		}
		this.finishGraph(xLines, yLines, E, thing);
	};
	return GraphBar;
})(jQuery);
var GraphTable = GraphTable || (function($) {
	"use strict";
	var GraphTable = function(obj) {
		obj = obj || {};
		obj.type = 'table';
		Graph.call(this, obj);
	};
	GraphTable.prototype = Object.create(Graph.prototype);
	GraphTable.prototype.constructor = GraphTable;
	GraphTable.prototype.init = function(thing) {
		var self = this.obj;
		var headers = '<th>' + (self.yName || 'Data') + '</th>'; //first header will always just be name of y
		//within each row is [num | x | y] <td>'s
		var row = '<tr>';
		if (!self.multiplePoints) {
			for (var i = 0; i < self.x.length; ++i) {
				row += '<td>' + i + '</td><td>' + self.x[i] + '</td><td>' + self.points[i] + '</td></tr><tr>';
			}
		} else {
			var data = [];
			for (var i = 0; i < self.points.length; ++i) {
				for (var t = 0; t < self.points[i].length; ++t) {
					data.push('<td>' + self.points[i][t] + '</td>'); //stick every single point into data[]
				}
				data.push('|'); //seperate each entry
			}
			var all = {}; //to hold formatted data
			//now split array with '|'
			var tick = 0;
			for (var i = 0; i < data.length; ++i) { //add entries to all{} numerically
				if (!all[tick]) all[tick] = []; //if arr hasnt been set set it
				if (data[i] !== '|') all[tick].push(data[i]); //add next entry
				else ++tick; //we are now in a new data layer
			}
			var tds; //build with 
			for (var i = 0; i < self.x.length; ++i) {
				if (i < self.points.length - 1) headers += '<th>' + (self.yName || 'Data') + ' ' + (i + 1) + '</th>'; //add headers numerically
				tds = '';
				for (var t = 0; t < self.points.length; ++t) {
					tds += all[t][i];
				}
				row += '<td>' + i + '</td><td>' + self.x[i] + '</td>' + tds + '</tr><tr>';
			}
		}
		var table = '<table class="SVG-table"id="' + self.id + '" border="1"cellpadding="5"><tr><th>#</th><th>' +
			(self.xName || 'X') + '</th>' + headers + '</tr>';
		table += row + '</tr>';
		this.handleAppend(thing, table);
		this.applyStyling();
	};
	return GraphTable;
})(jQuery);
var GraphPie = GraphPie || (function($) {
	"use strict";
	var Private = {};
	var GraphPie = function(obj) {
		obj = obj || {};
		obj.type = 'pie';
		Graph.call(this, obj);
		if (this.obj.interactive) {
			var thiz = this;
			$(function() {
				$(document).on('mouseover', 'svg path[id^="' + thiz.obj.id + '"]', function(e) {
					$(this).css('opacity', 1);
				});
				$(document).on('mouseleave', 'svg path[id^="' + thiz.obj.id + '"]', function(e) {
					$(this).css('opacity', 0.7);
				});
			});
		}
	};
	GraphPie.prototype = Object.create(Graph.prototype);
	GraphPie.prototype.constructor = GraphPie;
	Private.bindToolTip = function() {
		$('svg[id="' + this.obj.id + '"]').tooltip({
			show: {
				delay: 250
			}
		});
	};
	Private.lineTo = function(x, y) {
		return 'L' + x + ',' + y;
	};
	Private.percent = function(dec) {
		return Math.round(dec * 100) + '%';
	};
	GraphPie.prototype.init = function(thing) {
		if (!this.obj.multiplePoints) {
			var self = this.obj;
			var E = this.openTags();
			E.pie = '<g class="paths">';
			var fullPie = 2 * Math.PI; //360 deg
			var max = 0; //sum of all points
			var center = self.pieSize || 200;
			var radius = center - 20; //leave padding for pie
			var CENTER = 'M' + center + ',' + center;
			var ARC = 'A' + radius + ',' + radius;
			var STD = '0 0,1'; //arc options
			var HORZ; //x component of line
			var VERT; //y component of line
			var sizing = 20;
			var LINETO = Private.lineTo(sizing, center); //intiial starting point
			var howMuchOfPie = 0;
			var howMuchOfPieInRadians;
			var howMuchUp;
			var howMuchLeft;
			var x;
			var y;
			if (self.shadow) {
				E.pie += '<defs><filter id="dropshadow" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>' +
					'<circle cx="' + (center + 5) + '" cy="' + (center + 5) + '" r="' + radius + '"style="fill: black; fill-opacity:0.6; stroke:none;filter:url(#dropshadow)"/>';
			}
			for (var i = 0; i < self.points.length; ++i) {
				max += self.points[i];
			}
			for (var i = 0; i < self.points.length; ++i) {
				if (i !== 0) LINETO = Private.lineTo(HORZ, VERT);
				howMuchOfPie += self.points[i] / max;
				howMuchOfPieInRadians = howMuchOfPie * fullPie;
				howMuchUp = Math.sin(howMuchOfPieInRadians);
				howMuchLeft = Math.cos(howMuchOfPieInRadians);
				HORZ = center - (radius * howMuchLeft); //x component of line
				VERT = center - (radius * howMuchUp); //y component of line
				//path
				E.pie += '<path title="' + self.points[i] + ' (' + Private.percent(self.points[i] / max) +
					')"id="' + self.id + '-point-' + i + '"class="path-of-' + i +
					'" d="' + CENTER + LINETO + ARC + ' ' + STD + HORZ + ',' + VERT + 'Z"/>';
			}
			//add percentages to names for legend
			self.dataNames = self.x.slice(0);
			if (self.dataNames) {
				for (var i = 0; i < self.dataNames.length; ++i) {
					self.dataNames[i] += ' (' + Private.percent(self.points[i] / max) + ')';
				}
			}
			this.finishGraph(0, 0, E, thing);
			Private.bindToolTip.call(this);
		}
	};
	return GraphPie;
})(jQuery);

//UI/jQuery plugin for displaying SVGGraph.js graphs with all their functionality
(function($) {
	$.fn.graphify = $.fn.graphify || function(options) {
		options = options || {};
		//SETUP
		var opts = $.extend({
			height: this.css('height'),
			width: this.css('width'),
			start: 'linear', //type of graph to start with
			pos: 'top',
			obj: {} //actual obj for module
		}, options);
		var data = {
			types: ['linear', 'bar', 'table', 'area', 'pie']
		};
		var id = opts.obj.id;
		var SVG = new Graph(); //so we can use general functions
		var graph;
		switch (options.action) {
			case 'save':
				graph = new window[SVG.genToFunc(opts.start)](opts.obj);
				return graph.save();
				break;
			case 'expand':
				SVG.expand(opts.obj);
				break;
			case 'update':

				break;
			default: //jsut make graph
				//if graph has multiple datasets we can not make a pie graph:
				if (opts.obj.multiplePoints) data.types.pop();
				var wrapper = this.attr('id') + '-wrapper';
				this.append('<div id="' + wrapper + '"style="border:1px solid grey;padding:10px;"></div>');
				opts.obj.attachTo = wrapper;
				//UI
				var buttons = (function() {
					var btns = '';
					for (var i = 0; i < data.types.length; ++i) {
						btns += '<button id="' + id + '-graphify-button-' + data.types[i] + '">' +
							data.types[i].charAt(0).toUpperCase() + data.types[i].substring(1) +
							'</button>&emsp;';
					}
					return btns;
				})();
				if (opts.pos === 'top') $('#' + wrapper).append(buttons + '<br/><br />');
				graph = new window[SVG.genToFunc(opts.start)](opts.obj);
				graph.init();
				if (opts.pos === 'bottom') this.append(buttons);
				if (opts.options) {
					var formID = id + 'graphify-form';
					var checked = (opts.obj.legend) ? 'checked' : '';
					var form = ['<div id="' + formID + '"><hr />',
						'<input type="text"value="' + opts.obj.title + '"placeholder="Title" />&emsp;',
						'<input type="checkbox" ' + checked + '/>Legend&emsp;',
						'Type: <select name="" id=""><option value="">Linear</option></select>&emsp;',
						'Grid: <select name="" id=""><option value="">Full</option></select>&emsp;',
						'Scale: <input style="width:20px"value="10" />',
						'<br />',
						'X-axis: <input style="width:20px"/><input style="width:20px"/><input style="width:20px"/><input style="width:20px"/><input style="width:20px"/><input style="width:20px"/> <span style="font-weight:bold;cursor:pointer;">+ | -</span>',
						'<br />',
						'<button>New Dataset</button><br />',
						'<span style="font-weight:bold;cursor:pointer;">-</span> <input type="text"placeholder="Dataset 1"style="width:75px" /> <input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /> <span style="font-weight:bold;cursor:pointer;">+ | -</span>',
						'<br /><span style="font-weight:bold;cursor:pointer;">-</span> <input type="text"placeholder="Dataset 2"style="width:75px" /> <input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /> <span style="font-weight:bold;cursor:pointer;">+ | -</span>',
						'<br /><span style="font-weight:bold;cursor:pointer;">-</span> <input type="text"placeholder="Dataset 3"style="width:75px" /> <input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /><input style="width:20px" /> <span style="font-weight:bold;cursor:pointer;">+ | -</span>',
						'<br /><button id="' + id + '-graphify-update">Update</button> | <button id="' + id + '-graphify-restore">Restore</button>',
						'</div>'
					].join('');
					//NOTE: also allow them to specify colors (maybe pie shadow?) allow pie graph dataNames, allow sizing options
					$('#' + wrapper).append(form);
				}
		}
		//click handlers
		$(function() {
			//changing graph type
			$(document).on('click', 'button[id^="' + id + '-graphify-button-"]', function() {
				var type = $(this).attr('id').split('-')[3];
				if (type !== 'area') graph.to(type);
				else { //area graphs are a subset of linear graphs...
					opts.obj.special = 'area';
					graph.to('linear');
					graph.update(opts.obj);
				}
				opts.obj.type = type;
			});
		});
	};
})(jQuery);