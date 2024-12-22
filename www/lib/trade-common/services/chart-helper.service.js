angular.module('starter.trade')

.service('ChartHelper', function(VMin, $rootScope)
{
	var iconSize = VMin(4);

	var images = {};

	var siteUrl = window.location.href.split('localhost#').join('localhost/#'); // fix for ios
	var imgRoot = siteUrl.split('#').shift().split('/').slice(0, -1).join('/') + '/img/';
	imgRoot = imgRoot.split('ionic://img').join('ionic://localhost/img');

	var labelOverlapCheck = [];

	var defaultFont = 'RobotoBold';

	var lineLabelSize = VMin(3);

	var lineLabelOffset = 0;

	var sideLabelImage = null;

	var sideLabelOffset = 0;

	var roundRadius = 0;

	var rateLineFunction = 'drawSolidCustomLine';

	var rateLineColor = null;

	var chartTextCache = {};

	var canvasWidth = 0;

	return {
		setDefaultFont: function(font)
		{
			defaultFont = font;
		},

		setDefaultImgRoot: function(string)
		{
			imgRoot = string;
		},

		getDefaultFont: function()
		{
			return defaultFont;
		},

		setLineLabelSize: function(size)
		{
			lineLabelSize = size;
		},

		getLineLabelSize: function()
		{
			return lineLabelSize;
		},

		setLineLabelOffset: function(offset)
		{
			lineLabelOffset = offset;
		},

		getLineLabelOffset: function()
		{
			return lineLabelOffset;
		},

		setSideLabelImage: function(img)
		{
			sideLabelImage = img;
			this.loadCanvasImage(img);
		},

		getSideLabelImage: function()
		{
			return sideLabelImage;
		},

		setSideLabelOffset: function(offset)
		{
			sideLabelOffset = offset;
		},

		getSideLabelOffset: function(ctx, x, y, label, color)
		{
			if (sideLabelOffset instanceof Function) {
				return sideLabelOffset(ctx, x, y, label, color);
			} else {
				return sideLabelOffset;
			}
		},

		setSideLabelFont: function(font)
		{
			sideLabelFont = font;
		},

		getSideLabelFont: function()
		{
			return sideLabelFont;
		},

		setRoundRectRadius: function(radius)
		{
			roundRadius = radius;
		},

		getRoundRectRadius: function(ctx, x, y, label, color)
		{
			if (roundRadius instanceof Function) {
				return roundRadius(ctx, x, y, label, color);
			} else {
				return roundRadius;
			}
		},

		setRateLineFunction: function(func)
		{
			rateLineFunction = func;
		},

		getRateLineFunction: function()
		{
			return rateLineFunction;
		},

		setRateLineColor: function(col)
		{
			rateLineColor = col;
		},

		getRateLineColor: function()
		{
			return rateLineColor;
		},

		loadCanvasImage: function(src, ext)
		{
			images[src] = new Image();
			images[src].src = imgRoot + src + '.' + (ext || 'png');
		},

		loadExternalImage: function(url, id)
		{
			if (images[id])
			{
				return;
			}

			try
			{
				images[id] = new Image();
				images[id].src = url;
				images[id].onerror = function()
				{
					images[id].hasError = true;
				}
			}
			catch (e)
			{
				delete images[id];
			}
		},

		noop: function() {

		},

		drawSolidLine: function(ctx, x, y, toX, toY, color)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash([]);
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.restore();
		},

		drawSolidCustomLine: function(ctx, x, y, toX, toY, color, lineWidth, alpha)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash([]);
			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;
			ctx.globalAlpha = alpha;
			ctx.stroke();
			ctx.restore();
		},

		drawDashLine: function(ctx, x, y, toX, toY, color)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash(window.appConfig.lineDash || [4, 2]);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.restore();
		},

		drawDashLineB: function(ctx, x, y, toX, toY, color)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash([7, 4]);/*dashes are 7px and spaces are 4px*/
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.restore();
		},

		drawVerticalDashLine: function(ctx, x, topX, color, height)
		{
			ctx.beginPath();
			ctx.moveTo(x, topX);
			ctx.lineTo(x, height || 2000);
			ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
			ctx.strokeStyle = color || '#000000';
			ctx.lineWidth = 1;
			ctx.globalAlpha = 1;
			ctx.stroke();
		},

		drawSpreadLine: function(ctx, x, y, toX, toY, color)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash([4, 2]);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.restore();
		},

		drawDottedLine: function(ctx, x, y, toX, toY, color)
		{
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(toX, toY);
			ctx.setLineDash([1, 1]);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.globalAlpha = 1;
			ctx.stroke();
			ctx.restore();
		},

		drawIcon: function(x, y, src, ctx, size, noCenter)
		{
			var img = this.getImage(src);

			if (!img) {
				console.error(src);
				return;
			}

			size = size || iconSize;
			sizeY = img.height / (img.width / size);
			try
			{
				ctx.drawImage(img, x - (noCenter ? 0 : (size / 2)), y - (noCenter ? 0 : (sizeY / 2)), size, sizeY);
			} catch (e)
			{
				//~ console.log(e);
			}
		},

		getImage: function(src)
		{
			return images[src];
		},

		resetOverlapCheck: function()
		{
			labelOverlapCheck = [];
		},

		fillTextAndCache: function(canvas, text, y, scale) {

			var cropCanvas = (sourceCanvas,left,top,width,height) => {
				let destCanvas = document.createElement('canvas');
				destCanvas.width = width;
				destCanvas.height = height;
				destCanvas.getContext("2d").drawImage(
					sourceCanvas,
					left,top,width,height,  // source rect with content to crop
					0,0,width,height);      // newCanvas, same size as source rect
				return destCanvas;
			}

			// window.setTimeout(function (){
			// 	document.getElementById('currency-container').appendChild(canvas);
			// }, 0);

			var ctx = canvas.getContext('2d');

			text = '|  ' + text;
			ctx.fillText(text, 0, y);

			// scan the ctx to pick up the pieces of the rendered text
			var parts = text.split('  ');

			chartTextCache[y.toString()] = {};

			var startX = 0;
			var height = null;

			var cWidth = 1000 * scale;

			var imageData = ctx.getImageData(0, y * scale, cWidth, 45 * scale).data;

			var loopCnt = 0;
			var scanStep = 1;
			var yFound = null;

			for (var p = 0; p < parts.length; p++) {
				var textStartX = null;
				for (var x = startX; x < cWidth; x = x + 1) {
					yFound = null;

					for (var yy = 0; yy < (height ? height : 45) * scale; yy = yy + (height ? scale : 1)) {
						loopCnt++;

						var c = (yy * (cWidth * 4)) + (x * 4);
						if (imageData[c]) {
							yFound = Math.max(yy, 1);

							// found a filled pixel in column, can move on to the next one
							if (height) {
								break;
							}
						}
						// found the text height (scan of the first column)
						else if (yFound && !height) {
							break;
						}
					};

					if (yFound && textStartX === null) {
						textStartX = x;
					}

					if (yFound && !height) {
						height = yFound;
					}

					if (!yFound && textStartX !== null) {
						startX = x + 1;
						break;
					}
				}

				var w = x - textStartX;

				var cropped = cropCanvas(canvas, textStartX, y * scale, w, height);

				// ctx.beginPath();
				// ctx.rect(textStartX / scale, y, (w / scale), (height / scale));
				// ctx.lineWidth = "1";
				// ctx.strokeStyle = "red";
				// ctx.stroke();
				// console.log(y, parts[p], 'w', w, 'h', height, 'start', textStartX, yFound);

				var tmp = document.createElement('img');
				tmp.style.display = 'none'
				tmp.src = cropped.toDataURL();
				document.body.appendChild(tmp);

				chartTextCache[y.toString()][parts[p]] = [w, height, tmp, textStartX, y];

				// console.log(y, parts[p], w, height, textStartX);
			}

			// console.log(y, 'loop count', loopCnt);
		},

		prepareCanvasTextCache: function() {
			var mainFont = window.appConfig.chartFontFamily || 'BebasBold';
			var labelFont = window.appConfig.chartFontFamily || 'BebasRegular';
			var sideLabelFont = (window.appConfig.rateSideLabelFontFamily || 'BebasBold');

			var c = function (font) {
				return document.fonts && document.fonts.check && document.fonts.check('1em ' + font);
			};

			if ((Date.now() - window.startTime < 4000) && (!c(mainFont) || !c(labelFont) || !c(sideLabelFont))) {
				return;
			}

			var canvas = document.createElement('canvas');
			canvas.className = 'text-cache';
			canvas.style = 'position: absolute; z-index: 10000; border: 1px solid green;';
			var ctx = canvas.getContext('2d');
			var scale = ctx.webkitBackingStorePixelRatio ||
						ctx.mozBackingStorePixelRatio ||
						ctx.msBackingStorePixelRatio ||
						ctx.oBackingStorePixelRatio ||
						ctx.backingStorePixelRatio || 1;

			scale = Math.max(scale, 3);

			window.ctxScale = scale;

			canvas.width = 1000 * scale;
			canvas.height = 260 * scale;

			var self = this;
			window.measureChartLabel = function(label) {
				return self.measureText(label, 80);
			};

			window.renderChartLabel = function(label, x, y, chartX, width, ctx, isX) {
				var resize = 1;
				var renderIndex = 80;
				if ('::' == label.substr(0, 2)) {
					label = label.substr(2, label.length);
					renderIndex = 100;
				}

				var chart = window.chart;
				var scope = chart.scope;

				if (isX && (chartX + width + 15 > ctx.canvas.clientWidth) && scope.isEnd) {
					return;
				}

				if (isX) {
					// x += 4;
				}

				return self.renderTextFromCache(label, x, y, renderIndex, false, resize);
			};

			ctx.scale(scale, scale);
			ctx.globalAlpha = 1;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 0;
			ctx.shadowColor = 'transparent';

			ctx.textBaseline = "top";
			ctx.font = this.getLineLabelSize() + "px " + mainFont;

			ctx.fillStyle = '#81cab8';
			this.fillTextAndCache(canvas, 'B  U  Y  P  R  I  C  E', 1, scale);

			ctx.fillStyle = '#ee586c';
			this.fillTextAndCache(canvas, 'S  E  L  P  R  I  C', 40, scale);

			ctx.fillStyle = window.appConfig.chartFontColor || '#c7c6c0';
			ctx.font = window.appConfig.chartFontSize + "px " + labelFont;
			this.fillTextAndCache(canvas, 'A  B  C  D  E  F  G  H  I  J  L  M  N  O  P  R  S  T  U  V  Y  0  1  2  3  4  5  6  7  8  9  .  ,  :  >  <  %', 80, scale);

			ctx.fillStyle = '#050505';
			ctx.font = window.appConfig.chartFontSize + "px " + labelFont;
			this.fillTextAndCache(canvas, 'A  B  C  D  E  F  G  H  I  J  L  M  N  O  P  R  S  T  U  V  Y  0  1  2  3  4  5  6  7  8  9  .  ,  :  >  <  %', 100, scale);

			ctx.fillStyle = '#ffffff';
			ctx.font = (window.appConfig.rateSideLabelFontSize || VMin(4)) + "px " + sideLabelFont;
			this.fillTextAndCache(canvas, '0  1  2  3  4  5  6  7  8  9  .  $  ,  :  -  %  ' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').join('  ')  + '  v  e  r  b  o  u  g  h  t  s  l  d', 120, scale);

			ctx.fillStyle = '#000000';
			// ctx.font = window.appConfig.chartFontSize + "px " + labelFont;
			this.fillTextAndCache(canvas, 'O  V  E  R  B  O  U  G  H  T  S  L  D', 180, scale);

			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},

		prepareTextCacheOnce() {
			if (!chartTextCache['80']) {
				this.prepareCanvasTextCache();
			}
		},

		renderTextFromCache: function(text, x, y, cacheY, justMeasure, resize) {
			if (!chartTextCache[cacheY.toString()]) {
				this.prepareCanvasTextCache();
			}

			var scale = window.ctxScale;

			if (resize) {
				scale = scale * resize;
			}

			x = Math.floor(x);

			cacheY = String(cacheY);
			var ctx = chart.ctx.canvas.getContext("2d");

			if (!text || !text.split) {
				return;
			}

			var letters = text.split('');
			var wordBreak = 10;
			var spacing = 2;
			var startX = x;
			var height = 0;
			for (k = 0; k < letters.length; k++) {
				var letter = chartTextCache[cacheY.toString()][letters[k]];

				if (!letter) {

					if ([' ', '_', '-'].indexOf(letters[k]) == -1) {
						console.error(letters[k], 'not found in ', cacheY, text);
					}

					x = x + (wordBreak / scale);
					continue;
				}

				height = Math.max(height, letter[1]);

				if (!justMeasure) {
					ctx.drawImage(letter[2], x, y, letter[0] / scale, letter[1] / scale);
				}

				x = x + (letter[0] / scale);

				if (k < letters.length - 1) {
					x = x + (spacing / scale);
				}
			}

			return {width: x - startX, height: height};
		},

		measureText: function(text, cacheY, scale) {
			return this.renderTextFromCache(text, 0, 0, cacheY, true, scale);
		},

		fillText: function(label, y, color, scope, size, offset, cacheY, scale)
		{
			this.renderTextFromCache(label, offset, y, cacheY || '0', false, scale);
		},

		drawLineLabel: function(label, y, color, scope, size, offset, cacheY)
		{
			var chart = scope.getChart();
			var yAxis = chart.axisY2[0] || chart.axisY[0];
			var offset = offset || lineLabelOffset;

			if(!size)
			{
				var size = VMin(2.5);
			}
			if ((y > size) && (y < yAxis.bounds.y2))
			{
				if (_.filter(labelOverlapCheck, function(i) { return (i > y - (size * 1.5)) && (i < y + (size * 1.5)); }).length)
				{
					return;
				}

				this.fillText(label, y, color, scope, size, offset, cacheY)

				labelOverlapCheck.push(y);
			}
		},

		drawRateSideLabel: function(label, y, color, ctx, cs, font, fontColor, priceNowLabel, customFontSize, breakEvenLabel, pos)
		{
			var breakEvenLabelScale = 1.2;
			var scale = window.ctxScale;

			var chart = cs.getChart();
			var yAxis = chart.axisY2[0] || chart.axisY[0];

			if ((y < -100) || (y > yAxis.bounds.y2 + 100))
			{
				return;
			}

			var cache = cs.getLabelCache('y');
			var lastLabel = (cache && cache[1]) ? cache[1] : label;

			if (_.isNumber(label))
			{
				var labelAmt = label;
				if (label > 10000) {
					label = $rootScope.formatRate(Math.floor(label)).slice(0, -3);
				} else {
					label = $rootScope.formatRate(label);
				}
			}

			ctx.save();

			var textSize = this.measureText(label, 120);

			var sideLabelWidth = textSize.width;
			var sideLabelHeight = textSize.height / 3;

			var padding = window.appConfig.sideLabelPadding ? window.appConfig.sideLabelPadding(ctx, chart._axes[0].bounds.x1, y, label, color) : 3;
			var leftPadding = window.appConfig.sideLabelLeftPadding ? window.appConfig.sideLabelLeftPadding(ctx, chart._axes[0].bounds.x1, y, label, color) : 0;
			var rightPadding = window.appConfig.sideLabelRightPadding ? window.appConfig.sideLabelRightPadding(ctx, chart._axes[0].bounds.x1, y, label, color) : 0;

			if(priceNowLabel && !breakEvenLabel)
			{
				var size = this.measureText(label, 120);
				sideLabelHeight = (size.height / scale);
				sideLabelWidth = Math.max(size.width + (padding * 2), sideLabelWidth);
			}

			var width = sideLabelWidth + (2 * padding) + leftPadding;
			var height = sideLabelHeight + (2 * padding);

			// more space, looks cleaner
			var x = chart._axes[0].bounds.x1; // * scale

			if(priceNowLabel)
			{
				var priceLabelWidth = 60;

				if (!canvasWidth) {
					canvasWidth = ctx.canvas.scrollWidth;
				}

				var x = canvasWidth - priceLabelWidth;
			}
			else
			{
				x = lineLabelOffset;
			}

			var rectY = y - (height * 0.5);

			if(breakEvenLabel || !priceNowLabel)
			{
				rectY = rectY + 2;

				// saving this to check later 'for solidCustomLine to not go over left breakEvenLabel vai checking y coordinates'
				height = height / breakEvenLabelScale;
				width = this.measureText(label, 120, breakEvenLabelScale).width;
				// cs.breakEvenLabelWidth = Math.max(width + (padding * 2), cs.breakEvenLabelWidth || 0);
				cs.breakEvenLabelHeight = height;
				cs.breakEvenLabelY = rectY;
				// width = cs.breakEvenLabelWidth + leftPadding;
				width += leftPadding + rightPadding;
			}

			var labelOffset = this.getSideLabelOffset(ctx, x, y, label, color);
			var retX = x + labelOffset;

			if (!window.isGoforex) {
				retX += 4;
			}

			var retY = y;

			if (sideLabelImage && priceNowLabel)
			{
				retX = x;
				width = width * 0.8;
				this.drawIcon(x + (width / 2), retY, sideLabelImage, ctx, width);
			}
			else
			{
				if ((x < 50) && (width > (canvasWidth / 2)))
				{
					console.log('Label too wide', label);
					return;
				}

				x = x + labelOffset;
				this.roundRect(ctx, x, rectY, width + 3, height, this.getRoundRectRadius(ctx, x, y, label, color), color, color);
			}

			// removing dot at the end if there is one
			if(label.indexOf('.') == label.length - 1)
			{
				label = label.substr(0, label.length - 1);
			}

			if(priceNowLabel && !breakEvenLabel)
			{
				if ("" !== label) {
					textWidth = this.measureText(label, 120).width;
					x = x + ((priceLabelWidth - textWidth) / 2) - padding;

					if (!pos)
					{
						if (!cs.priceLabelX) {
							cs.priceLabelX = x;
						}

						x = Math.min(x, cs.priceLabelX);
						cs.priceLabelX = x;
					}

					this.fillText(label, rectY + padding, color, null, null, x + 4, 120);
				}
			}
			else
			{
				label = ' ' + label + ' ';
				textSize = this.measureText(label, 120, breakEvenLabelScale);
				this.fillText(label, rectY + padding - 1, color, null, null, x + ((width - textSize.width) / 2) + leftPadding, 120, breakEvenLabelScale);
			}

			if (window.appConfig.sideLabelCustomFunction) {
				window.appConfig.sideLabelCustomFunction(ctx, x, y, label, color, textSize.width);
			}

			ctx.restore();

			return [retX, retY];
		},

		drawTriangle: function(ctx, color, markerX, trLeft, trTop, trSize)
		{
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.moveTo(trLeft, trTop); // pick up "pen," reposition at 300 (horiz), 200 (vert)
			ctx.lineTo(markerX, trTop + trSize); // draw straight down by 200px (200 + 200)
			ctx.lineTo(trLeft + trSize, trTop); // draw up toward left (100 less than 300, so left)
			ctx.fill(); // connect and fill
		},

		drawTriangleCustom: function(ctx, color, a, b, c, d, e, f)
		{
			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.moveTo(a, b); // pick up "pen," reposition at 300 (horiz), 200 (vert)
			ctx.lineTo(c, d); // draw straight down by 200px (200 + 200)
			ctx.lineTo(e, f); // draw up toward left (100 less than 300, so left)
			ctx.fill(); // connect and fill
		},

		drawFilledCircle: function(ctx, x, y, radius, color)
		{
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2*Math.PI);
			ctx.fill();
		},

		/**
		 * Draws a rounded rectangle using the current state of the canvas.
		 * If you omit the last three params, it will draw a rectangle
		 * outline with a 5 pixel border radius
		 * @param {CanvasRenderingContext2D} ctx
		 * @param {Number} x The top left x coordinate
		 * @param {Number} y The top left y coordinate
		 * @param {Number} width The width of the rectangle
		 * @param {Number} height The height of the rectangle
		 * @param {Number} [radius = 5] The corner radius; It can also be an object
		 *                 to specify different radii for corners
		 * @param {Number} [radius.tl = 0] Top left
		 * @param {Number} [radius.tr = 0] Top right
		 * @param {Number} [radius.br = 0] Bottom right
		 * @param {Number} [radius.bl = 0] Bottom left
		 * @param {Boolean} [fill = false] Whether to fill the rectangle.
		 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
		 */
		 roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
			if (typeof stroke == 'undefined') {
				stroke = true;
			}
			if (typeof radius === 'undefined') {
				radius = 5;
			}
			if (typeof radius === 'number') {
				radius = {tl: radius, tr: radius, br: radius, bl: radius};
			} else {
				var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
				for (var side in defaultRadius) {
					radius[side] = radius[side] || defaultRadius[side];
				}
			}
			ctx.beginPath();
			ctx.setLineDash([]);

			ctx.moveTo(x + radius.tl, y);
			ctx.lineTo(x + width - radius.tr, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
			ctx.lineTo(x + width, y + height - radius.br);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
			ctx.lineTo(x + radius.bl, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
			ctx.lineTo(x, y + radius.tl);
			ctx.quadraticCurveTo(x, y, x + radius.tl, y);
			ctx.closePath();
			if (fill) {
				ctx.fillStyle = fill;
				ctx.fill();
			}
			if (stroke) {
				ctx.strokeStyle = stroke;
				ctx.stroke();
			}
		 },
	};
});