angular.module('starter.trade')

.service('CandleData', function(SymbolData, OnlineStatus, CANDLESTICK_COUNT, LoaderOverlay, ChartRef, RSI, MarketStatus, VolumeData, ChartHelper, VMin)
{
    var ChartData = null;
    var getChartData = function()
    {
		if (!ChartData)
		{
			ChartData = angular.element(document.getElementById('app')).injector().get('ChartData');
		}

		return ChartData;
	};

    var data = {};
	var permanentData = {};
    var baseTime = (new Date(Date.UTC(2011, 1, 1, 0, 0, 0, 0))).getTime();

	var grans = {
		// '5s'  : 5,
		'15s'  : 15,
		'1m'  : 60,
		'5m'  : 300,
		'15m'  : 900,
		'30m'  : 1800,
		'1h'  : 3600,
		'1d'  : 86400,
		'1mo'  : 86400 * 30
	};

    var periodIndex = _.values(grans);

    var liveUpdate = {};
	var dataLoading = {};

	var decompressCandles = function(sval)
	{
		try
		{
			return JSON.parse(RawDeflate.inflate(sval));
		}
		catch (e)
		{
			console.log('Cannot decompress candles', sval);
			return;
		}
	};

	var decompressCandles_new = function(sval)
	{
		try
		{
			var json = RawDeflate.inflate(sval);

			json = json.split('B').join(',0.');
			json = json.split('A').join(',-0.');
			json = json.split('|').join('],[');

			var candles = JSON.parse(json);

			_.each(candles, function(periodCandles, period) {
				var lastX = 0;
				for (var k = 1; k < periodCandles.length; k++) {
					var c = periodCandles[k];
					var pr = periodCandles[k - 1];

					var y = pr.y[0] + c[0];

					var x = c.length > 4 ? c[4] : lastX;
					lastX = x;

					var candle = {y: [y, c[1] + y, c[2] + y, c[3] + y], x: pr.x + x };

					periodCandles[k] = candle;
				}

				candles[period] = periodCandles;
			});

			return candles;
		}
		catch (e)
		{
			console.log('Cannot decompress candles', e, sval);
			return;
		}
	};

	var compressX = function(candles)
	{
		if (!candles.length)
		{
			return;
		}

		var x = candles[candles.length - 1].x;
		for (var k = candles.length - 2; k >= 0; k--)
		{
			var newX = x - (candles.length - k - 1);
			if (candles[k].x == newX)
			{
				break;
			}

			candles[k].x = newX;
		}
	};

	var fetchBaseCandles = function(sym, callback, period) {
		// period can be 0, if defaultLineChartPeriod is not 0, then this messes up in specific cases
		if (!period && period !== 0) {
			period = window.localStorage.defaultLineChartPeriod || 0;
		}

		var pe = periodIndex[period];

		if (_.get(dataLoading, [sym, period])) {
			return;
		}

		_.set(dataLoading, [sym, period], 1);

		var id = Math.random();
		VolumeData.fetchChart(sym, pe, function(res)
		{
			var stream = res.split('|||').filter(a => a);

			var allCandles = decompressCandles_new(res);

			var main = '';
			while (stream.length > 0) {
				try {
					main = (main ? '|||' : '') + stream.shift();
					var allCandles = decompressCandles_new(main);
					break;
				} catch (e) {
					// rare decoding error, as ||| might appear naturally in the compressed data
					// in such case we just append the next item and retry decoding
				}
			}

			var next = '';
			while (stream.length > 0) {
				next = (next ? '|||' : '') + stream.shift();

				try {
					var streamCandle = decompressCandles(next);
					next = '';
					allCandles[pe].push(streamCandle);
				} catch (e) {
					// same as above
					console.log('caught.....', e);
				}
			}

			// connect candle opening point with previous candles closing point
			for (var k = 1; k < allCandles[pe].length; k++) {
				allCandles[pe][k].y[0] = allCandles[pe][k - 1].y[3];
			}

			var mergeWithLiveData = function() {
				var live = SymbolData.getSymbol(sym);
				if (true || live && (live.realX || !MarketStatus.isOpen(sym))) {
					window.clearInterval(waitForLiveData);
					window.clearTimeout(abortTimeout);
					_.set(dataLoading, [sym, period], null);

					_.each(allCandles, function(candles, interval)
					{
						_.each(candles, function(candle)
						{
							candle.time = candle.x;
						});
					});

					// drop candle(s) that are too new (considering the delay)
					if (MarketStatus.isOpen(sym)) {
						_.each(allCandles, function(candles, interval)
						{
							var cObj = {};
							for (var i = 0; i < candles.length; i++) {
								var c = candles[i];

								if (i > 0) {
									var diff = c.x - candles[i - 1].x;
									if (diff < interval) {
										c.x = candles[i - 1].x;
										continue;
									}
								}

								cObj[c.x] = c;
							}

							candles = Object.values(cObj);

							// to get the live candle going right after the loading
							if ((interval == pe) && live) {
								var intv = parseInt(interval);
								var lastC = candles[candles.length - 1];

								if(!candles || !candles[candles.length - 1])
								{
									return;
								}

								var liveX = lastC.time;
								var pnt = {y: lastC.y[3], x: liveX, realX: liveX};
								getChartData().prependPoint(sym, pnt);

								var open = lastC.y[3];
								var close = live.mid;
								var newX = liveX + intv;
								var newCandle = {y: [open, Math.max(open, close), Math.min(open, close), close], x: newX, time: newX, dynamic: true, timestamp: getChartData().getDate(newX).getTime() / 1000, addedX: newX, debug: getChartData().getDate(newX)};
								candles.push(newCandle);

								// console.log(JSON.parse(JSON.stringify(candles)));
							}

							allCandles[interval] = candles;
						});
					}

					_.each(allCandles, function(candles, interval)
					{
						compressX(candles);
						allCandles[interval] = candles;
					});

					callback(allCandles);
				}
			}

			var waitForLiveData = window.setInterval(function() {
				mergeWithLiveData();
			}, 50);

			var abortTimeout = window.setTimeout(function() {
				console.log('abort waiting for live data', waitForLiveData, sym);
				window.clearInterval(waitForLiveData);
			}, 10000);

			mergeWithLiveData();

		});

		LoaderOverlay.show(sym, candlePublicVar, null, period);
	};

	var init = function(sym, force, oncomplete, period)
	{
		// period can be 0, if defaultLineChartPeriod is not 0, then this messes up in specific cases
		if (!period && period !== 0) {
			period = window.localStorage.defaultLineChartPeriod || 0;
		}

		if (_.get(dataLoading, [sym, period])) {
			// console.log('candles already loading for', sym, period);
			return;
		}

		getChartData().watchCompressed(sym);

		var completeCallback = function() {
			if (oncomplete) {
				oncomplete();
			}

			window.clearTimeout(liveUpdate[sym]);
			liveUpdate[sym] = null;
			initDynamicUpdate(sym);
		}

		if (!data[sym] || !data[sym][periodIndex[period]] || force)
		{
			fetchBaseCandles(sym, function(allCandles) {
				_.set(dataLoading, [sym, period], null);

				if (!data[sym]) {
					data[sym] = {};
				}

				_.each(allCandles, function(cn, period) {
					data[sym][period] = cn;
				});

				completeCallback();
			}, period);
		}
		else
		{
			// console.log('not reinitializing candles for ', sym, data[sym]);
			completeCallback();
		}
	};

	var candleDate = function(candle)
	{
		if (!candle)
		{
			return;
		}

		return new Date(baseTime + candle.time);
	};

	var supports = function(sym)
	{
		return true;
	};

    var prevOnlineStatus = true;
    var lastOnline = Date.now();
    OnlineStatus.addWatch(function(status)
    {
		if (!status || (status == prevOnlineStatus))
		{
			if (status)
			{
				lastOnline = Date.now();
			}

			prevOnlineStatus = status;
			return;
		}

		prevOnlineStatus = status;

		if (Date.now() - lastOnline < 4000)
		{
			console.log('Offline for ', Date.now() - lastOnline, 'ms. Ignoring.');
			return;
		}

		lastOnline = Date.now();
		console.log('resetting after coming back online');

		getChartData().resetAll();
	});

	var fastUpdate = null;

	var initDynamicUpdate = function(sym)
	{
		if (liveUpdate[sym])
		{
			// console.log(':( Live candle update already initialized', sym);
			return;
		}

		var update = function()
		{
			if (!data[sym] || window.isPaused)
			{
				// console.log('No data yet, skipping live update for ', sym);
				window.clearTimeout(liveUpdate[sym]);
				liveUpdate[sym] = window.setTimeout(update, 100);
				return;
			}

			// console.log('Processing live candle update for ', sym);
			window.clearTimeout(liveUpdate[sym]);
			liveUpdate[sym] = window.setTimeout(update, fastUpdate == sym ? 50 : 1000);

			var rate = SymbolData.getSymbol(sym);

			if(!rate)
			{
				// console.log('no rate yet');
				return;
			}

			var price = rate.mid;
			var x = rate.realX;

			if (!x || !data[sym])
			{
				// console.log('no X', x, rate);
				return;
			}

			// console.log('live candle update', sym, price, x, ChartData.getLastXRealTimeUnsafeDebugOnly(sym), JSON.parse(JSON.stringify(ChartData.getAllData(sym))));

			// add new candles
			if (!data[sym][5])
			{
				return;
			}

			var five = data[sym][5][data[sym][5].length - 1];

			if (!five)
			{
				return;
			}

			var candleX = Math.floor(x);

			if (!(candleX % 5) && (five.time < candleX))
			{
				for (var k = -1; k < periodIndex.length; k++)
				{
					var intv = -1 == k ? 5 : periodIndex[k];
					var candles = data[sym][intv];
					if (candles && candles.length)
					{
						var lastCandle = candles[candles.length - 1];
						var newTime = lastCandle.time + intv;

						if (newTime < candleX)
						{
							while (newTime < candleX - intv) {
								newTime += intv;
							}

							var candle = {x: newTime, time: newTime, y: [price, price, price, price], dynamic: true};

							candles.push(candle);
							compressX(candles);
						}
					}
				}
			}

			// update last candle
			_.each(periodIndex, function(k)
			{
				var candles = data[sym][k];

				if (!candles)
				{
					return;
				}

				var lastCandle = candles[candles.length - 1];

				if (((5 == k) && !lastCandle.dynamic) || !lastCandle)
				{
					return;
				}

				var last = lastCandle.y;

				// max / high
				last[1] = Math.max(last[1], price);

				// min / low
				last[2] = Math.min(last[2], price);

				// close
				last[3] = price;
			});
		}

		update();
	};

	var findClosest = function(sym, period, index, field)
	{
		field = field ? field : 'x';
		var d = data[sym][period];

		if (!d || !d.length)
		{
			return null;
		}

		var lastFrom = null;
		var lastTo = null;
		var from = 0;
		var to = d.length - 1;
		var dirUp = null;

		var iterations = 0;
		while ((from != to) && (++iterations < 50))
		{
			var mid = Math.round(from + ((to - from) / 2));

			var dirUp = d[mid][field] <= index;
			if (dirUp)
			{
				from = mid;
			}
			else
			{
				to = mid;
			}

			if ((lastFrom == from) && (lastTo == to))
			{
				break;
			}

			lastFrom = from;
			lastTo = to;
		}

		return Math.abs(d[from][field] - index) < Math.abs(d[to][field] - index) ? from : to;
	};

	var hasRendered = {};

	var candlePublicVar = {
		supports: supports,

		markAsRendered: function(sym, period, state) {
			_.set(hasRendered, [sym, String(period)], state);
		},

		setFastUpdate: function(sym)
		{
			fastUpdate = sym;
		},

		getFastUpdateInstrument: function()
		{
			return fastUpdate;
		},

		resetAll: function()
		{
			_.each(data, function(symData, sym) {
				permanentData[sym] = JSON.parse(JSON.stringify(symData));
			});

			data = {};
			_.each(liveUpdate, window.clearTimeout);
			liveUpdate = {};
			refs = {};
			updates = {};
			dataLoading = {};
			dataLoaded = {};

			VolumeData.reset();
		},

		getSpan: function(sym, from, to, period, field)
		{
			if (!data[sym]) {
				return;
			}

			field = field || 'x';

			from = Math.ceil(from);
			to = Math.ceil(to);

			var idx = periodIndex[period];

			var dataSet = data[sym][idx];

			if (!dataSet || !dataSet.length)
			{
				return;
			}

			if (!to || isNaN(to))
			{
				to = dataSet[dataSet.length - 1][field];
			}

			if (to)
			{
				from = Math.min(from, to - CANDLESTICK_COUNT - 8);
			}

			to += 3;

			var fromIndex = 0;
			var toIndex = 0;
			_.each(dataSet, function(item, i)
			{
				if ((item[field] >= from) && !fromIndex)
				{
					fromIndex = i;
				}

				if ((to <= item[field]) && !toIndex)
				{
					toIndex = i;
				}

			});

			for (var k = 0; k < dataSet.length; k++)
			{
				if (dataSet[k][field] == from)
				{
					break;
				}
			}

			if (!toIndex)
			{
				toIndex = dataSet.length;
			}

			if (toIndex - fromIndex < CANDLESTICK_COUNT)
			{
				fromIndex = toIndex - CANDLESTICK_COUNT;
			}

			fromIndex = Math.max(fromIndex, 0);

			var ret = cloneObj(dataSet.slice(fromIndex, toIndex));

			// check if all pricepoints are not the same (the candle is invisible)
			var minRange = ret[0].y[0];
			var maxRange = ret[ret.length - 1].y[3];
			var emptyCandlePadding = Math.abs((maxRange - minRange) / 100);

			for (var k = 0; k < ret.length; k++)
			{
				var y = ret[k].y;
				if ((y[0] == y[1]) && (y[2] == y[3]) && (y[1] == y[2])) {
					y[0] -= emptyCandlePadding;
				}
			}

			var spread = SymbolData.getPositionSpread(sym);
			if (spread)
			{
				for (var k = 0; k < ret.length; k++)
				{
					ret[k].y[0] += spread;
					ret[k].y[1] += spread;
					ret[k].y[2] += spread;
					ret[k].y[3] += spread;
				}
			}

			return ret;
		},

		simpleMovingAverage: function(sym, from, to, period, contextData)
		{
			var pi = periodIndex[period]

			if (!data[sym] || !data[sym][pi] || !data[sym][pi].length)
			{
				return;
			}

			var c = contextData[0].dataPoints;
			var from = c[0].x;
			var to = c[c.length - 1].x;

			var spread = SymbolData.getPositionSpread(sym);

			var candles = data[sym][pi];

			// number of previous data points to use when calculating the moving average
			// higher value = flatter line, more lag
			var prevAvgPoints = 5;

			var conf = [
				// 15sec/10min view => 1min avg
				4,

				// 1min/40min view => 5min avg
				5,

				// 5min/200min view => 30min avg
				6,

				// 15min/10h view => 1h avg
				4,

				// 30min/20h view => 4h avg
				8,

				// 1h/40h view => 12h avg
				12,

				// 1d/40d view => 5d avg
				5,

				// 1m/40m view => 90d avg
				3
			][period];

			if (conf) {
				prevAvgPoints = conf;
			}

			var sideLabel = ['1MIN', '5MIN', '30MIN', '1H', '4H', '12H', '5D', '90D'];

			// calculate the moving averages
			var ret = [];
			for (var k = candles.length - 1; k >= 0; k--) {
				var x = candles[k].x
				if ((x > to + 3) || (x < from - 1)) {
					continue;
				}

				var sum = 0;
				var range = Math.max(0, k - prevAvgPoints + 1);
				for (var i = k; i >= range; i--) {
					// use the candle closing price
					sum += candles[i].y[3];
				}

				ret.push({x: x, y: (sum / (k - range + 1)) + spread})
			}

			return {data: ret.reverse(), label: 'MA-' + sideLabel[period]};
		},

		bollinger: function (sym, from, to, period, contextData) {
			var pi = periodIndex[period];
			
			if (!data[sym] || !data[sym][pi] || !data[sym][pi].length) {
				return;
			}
			
			var c = contextData[0].dataPoints;
			var from = c[0].x;
			var to = c[c.length - 1].x;
			
			var spread = SymbolData.getPositionSpread(sym);
			
			var candles = data[sym][pi];
			
			// Number of previous data points to use when calculating the moving average
			// Higher value = flatter line, more lag
			var prevAvgPoints = 5;
			
			var conf = [
				// 15sec/10min view => 1min avg
				4,

				// 1min/40min view => 5min avg
				5,

				// 5min/200min view => 30min avg
				6,

				// 15min/10h view => 1h avg
				4,

				// 30min/20h view => 4h avg
				8,

				// 1h/40h view => 12h avg
				12,

				// 1d/40d view => 5d avg
				5,

				// 1m/40m view => 90d avg
				3
			][period];
			
			if (conf) {
				prevAvgPoints = conf;
			}
			
			var sideLabel = ['1MIN', '5MIN', '30MIN', '1H', '4H', '12H', '5D', '90D'];
			
			// Calculate the moving average
			var middleBand = [];
			var standardDeviation = [];
			
			for (var k = 0; k < candles.length; k++) {
				var x = candles[k].x;
				if (x > to + 3 || x < from - 1) {
					continue;
				}
			
				var range = Math.max(0, k - prevAvgPoints + 1);
				var values = [];
			
				for (var i = k; i >= range; i--) {
					values.push(candles[i].y[3]);
				}
			
				var avg = values.reduce(function (sum, value) {
					return sum + value;
				}, 0) / values.length;
			
				var variance = values.reduce(function (sum, value) {
					return sum + Math.pow(value - avg, 2);
				}, 0) / values.length;
			
				middleBand.push({ x: x, y: avg + spread });
				standardDeviation.push({ x: x, y: Math.sqrt(variance) });
			}
			
			// Calculate the upper and lower Bollinger Bands
			var upperBand = middleBand.map(function (point, i) {
				return { x: point.x, y: point.y + standardDeviation[i].y };
			});
			
			var lowerBand = middleBand.map(function (point, i) {
				return { x: point.x, y: point.y - standardDeviation[i].y };
			});

			// Create the filled area chart series for the area between upper and lower bands
			var filledAreaData = [];
			for (var i = 0; i < middleBand.length; i++) {
				filledAreaData.push({ x: middleBand[i].x, y: [lowerBand[i].y, upperBand[i].y] });
			}
			
			return [
				{ data: middleBand, label: '' },
				// { data: upperBand, label: '' },
				// { data: lowerBand, label: '' },
				{
					chartType: 'rangeSplineArea',
					data: filledAreaData,
					fillOpacity: 0.11,
					color: '#FFFF00',
					lineColor: '#206eff',
				}
			];
		},

		rsi: function(sym, from, to, period, contextData, chartScope)
		{
			// standard number of previous periods to use for RSI calculation
			var prevAvgPoints = 14;

			var pi = periodIndex[period]

			if (!data[sym] || !data[sym][pi] || !data[sym][pi].length)
			{
					return;
			}

			var c = contextData[0].dataPoints;
			var from = c[0].x;
			var to = c[c.length - 1].x;

			var dataPoints = data[sym][pi];

			var rsiGains = [];
			for (var k = 0; k < dataPoints.length; k++) {
					var p = dataPoints[k];
					rsiGains.push([p.y[3] - p.y[0], p]);
			}

			var rsiData = RSI.get(JSON.parse(JSON.stringify(rsiGains)), prevAvgPoints, chartScope);
			if (!rsiData) {
				return;
			}

			// calculate the moving averages
			var ret = [];
			var rsi = rsiData.data;
			for (var k = rsi.length - 1; k >= 0; k--) {
				var x = rsi[k].x
				if ((x > to + 3) || (x < from - 1)) {
					continue;
				}

				ret.push(rsi[k])
			}

			rsiData.data = rsi;

			return rsiData;
		},

		volume: function(sym, from, to, period, contextData, chartScope)
		{
			// convert X to timestamps
			var c = contextData[0].dataPoints;
			var lastDp = c[c.length - 1];
			var timeFrom = getChartData().getDate(c[0].time) / 1000;
			var timeTo = getChartData().getDate(lastDp.time) / 1000;

			var pi = periodIndex[period];
			var vol = VolumeData.get(sym, timeFrom, timeTo, pi, contextData, chartScope);

			if (!vol || !vol.length) {
				var loading = [];

				var amplitude = 5;
				var frequency = 2;
				var height = 15;
				if (!window.volumeLoaderWave) {
					window.volumeLoaderWave = 0;
				}

				window.volumeLoaderWave++;

				var isLoading = VolumeData.isLoading(sym, pi);

				for (var k = 0; k < c.length; k++) {
					var i = JSON.parse(JSON.stringify(c[k]));

					if (isLoading) {
						i.pct = height/2 + amplitude * Math.sin((k + window.volumeLoaderWave)/frequency);
						i.color = '#cccccc';
					} else {
						i.pct = 4;
						i.color = '#eeeeee';
					}

					loading.push(i);
				}

				vol = loading;
			} else {
				var min = 0.2;
				for (var k = 0; k < vol.length; k++) {
					var i = vol[k];
					i.pct = Math.max(min, i.pct);
				}

				var noGaps = [];
				for (var k = 0; k < vol.length; k++) {
					noGaps.push(vol[k]);

					if (k === vol.length - 1) {
						break;
					}

					var next = vol[k + 1];
					var curr = vol[k];
					var diff = next.x - curr.x;
					if (diff < 10 && diff > 1) {

						var timeStep = (next.time - curr.time) / diff;
						var xTimeStep = (next.xTime - curr.xTime) / diff;
						var origTimeStep = (next.origTime - curr.origTime) / diff;

						for (c = 0; c < diff; c++) {
							var fill = JSON.parse(JSON.stringify(vol[k]));
							fill.x = fill.x + c + 1;

							fill.time = fill.time + (timeStep * c);
							fill.xTime = fill.xTime +  (xTimeStep * c);
							fill.origTime = fill.origTime + (origTimeStep * c);
							fill.pct = 0.2;

							noGaps.push(fill);
						}
						// console.log('gap detected', diff);
					}

				}

				vol = noGaps;
			}

			function nFormatter(num, digits) {
				const lookup = [
				  { value: 1, symbol: "" },
				  { value: 1e3, symbol: "K" },
				  { value: 1e6, symbol: "M" },
				  { value: 1e9, symbol: "B" },
				  { value: 1e12, symbol: "T" }
				];
				const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
				var item = lookup.slice().reverse().find(function(item) {
				  return num >= item.value;
				});
				return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
			}

			return {data: vol, chartType: 'column', label: '', chartBottomPadding: 25, pctValues: true, renderCallback: function(chart) {
				var lastVolume = vol[vol.length - 1];
				var currVolume = lastVolume.x == lastDp.x ? lastVolume.vol : 0;

				var chartScope = chart.scope;
				var yAxis = chartScope.getYAxis();
				var xAxis = chartScope.getXAxis();

				if (!xAxis) {
					return;
				}

				if (!window.prevVolumeLabel) {
					window.prevVolumeLabel = {};
				}

				var chartRangeMin = yAxis.viewportMinimum;
				var chartRangeMax = yAxis.viewportMaximum;

				var getY = function(pct) {
					return chartRangeMin + ((chartRangeMax - chartRangeMin) * (pct / 100));
				}

				var y0 = yAxis.convertValueToPixel(getY(0)) + 12;

				var size = ChartHelper.getLineLabelSize();

				var ctx = chart.ctx;

				var iconSize = VMin(8);
				var textSize = 1.7;

				// find the max volume in the visible range
				var max = 0;
				var maxVolume = null;

				for (var k = 0; k < vol.length; k++) {
					var v = vol[k];

					var cm = window.candlestickMap[v.x + 'x'];

					if (!cm || (cm < 0) || (!chartScope.isEnd && (v.x > xAxis.viewportMaximum))) {
						continue;
					}

					if (v.vol > max) {
						max = v.vol;
						maxVolume = v;
					}
				}

				if (!maxVolume) {
					return;
				}

				if (!window.prevVolumeLabel[sym] || chartScope.isEnd) {
					window.prevVolumeLabel[sym] = maxVolume;
				}

				var x = window.candlestickMap[maxVolume.x + 'x'];

				// label animation to jump smoothly from one volume bar to another when the max volume changes
				var prev = window.prevVolumeLabel[sym];
				if ((prev.time != maxVolume.time)) {
					var prevX = prev.prevX;
					window.prevVolumeLabel[sym] = maxVolume;
					prev = window.prevVolumeLabel[sym];

					prev.steps = 10;
					var distance = x - prevX;
					prev.distancePerStep = distance / prev.steps;
					prev.prevX = x;
				}

				if (prev.steps > 0) {
					prev.steps--;
					var diff = (prev.steps * prev.distancePerStep);
					x -= diff;
				} else {
					prev.prevX = x;
				}

				var isLabelCollapsed = ~~parseInt(window.localStorage.getItem('volumeLabelCollapsed'));
				if (!isLabelCollapsed) {
					ChartHelper.drawIcon(x, y0, 'volume-current', ctx, iconSize);

					var label = nFormatter(maxVolume.vol, 1);
					label = String(label);
					var width = ChartHelper.renderTextFromCache(label, 0, 0, '120', true, textSize).width;
					ChartHelper.renderTextFromCache(label, x - (width / 2.2), y0, '120', false, textSize);
				} else {
					var size = VMin(1);
					ChartHelper.drawFilledCircle(ctx, x, y0 - (size * 1.7), size, '#eaa034');
				}

				var touch = chartScope.getTouchStatus();
				if ((touch.lastTouchEnded > window.lastVolumeTouch) || (!window.lastVolumeTouch && (touch.lastTouchEnded && (touch.lastTouchEnded < Date.now())))) {
					var e = touch.lastTouchEvent;
					var t = e.changedTouches;

					if (t) {
						var clickX = t[0].clientX;
						var clickY = t[0].clientY;
					} else {
						var clickX = e.pageX;
						var clickY = e.pageY;
					}

					var rect = ctx.canvas.getBoundingClientRect();
					clickX = clickX - rect.left;
					clickY = clickY - rect.top;

					var radius = VMin(3);

					if (((x - radius < clickX) && (x + radius > clickX) && (y0 - radius < clickY) && (y0 + radius > clickY))) {
						window.localStorage.setItem('volumeLabelCollapsed', 1 - isLabelCollapsed);

						if(typeof TapticEngine != "undefined")
						{
							TapticEngine.selection();
						}
					}

					window.lastVolumeTouch = Date.now() + 50;
				}
			}};
		},

		compareResponse: function(sym, other, dp, contextData) {
			var dataPoints = JSON.parse(JSON.stringify(dp));

			var mx = 0, mn = 0;
			for (var k = 1; k < dataPoints.length; k++) {
				if (dataPoints[k].x == dataPoints[k - 1].x) {
					dataPoints[k].x = 0;
				}
			}

			dataPoints = dataPoints.filter(d => d.x);

			for (var k = 0; k < dataPoints.length; k++) {
				var y = dataPoints[k].y;
				y = Array.isArray(y) ? ((y[3] + y[3]) / 2) : y;
				mx = Math.max(mx, y);

				if (!mn) {
					mn = y;
				}

				mn = Math.min(mn, y);
			}

			var avg = (mx + mn) / 2;

			var dp = JSON.parse(JSON.stringify(contextData[0].dataPoints));
			var mx = 0, mn = 0;
			for (var k = 0; k < dp.length; k++) {
				var y = dp[k].y
				y = Array.isArray(y) ? ((y[3] + y[3]) / 2) : y;

				mx = Math.max(mx, y);

				if (!mn) {
					mn = y;
				}

				mn = Math.min(mn, y);
			}

			var iAvg = (mx + mn) / 2;

			var div = avg / iAvg;

			if (sym == other) {
				div = 1;
			}

			for (var k = 0; k < dataPoints.length; k++) {
				dataPoints[k].y = (dataPoints[k].y / div);
			}

			return {data: dataPoints, label: other, yLabelFormatter: this.compareLabelFormatter};
		},

		compareLabelFormatter: function(label, e, cnt) {

			var chart = window.chart;
			var yAxis = chart.axisY2[0];

			var pad = 1 - ((yAxis.maxHeight - 15) / chart.height);

			var mn = yAxis.dataInfo.min;
			var mx = yAxis.dataInfo.max;

			var diff = mx - mn;
			mn -= (1 * (diff * pad));

			var lab = parseFloat(label);

			var pct = Math.floor(((lab - yAxis.dataInfo.min) / (mx - mn)) * 100);

			return pct.toString() + '%    _';
		},

		compare: function(sym, from, to, period, contextData, chartScope)
		{
			window.labelCache['y'] = {};

			var other = chartScope.getTAConfig('compare');

			if (!other || String(other).length != 6) {
				return;
			}

			var dp = contextData[0].dataPoints;

			this.loadAll(other, null, period);

			var candles = this.getSpan(other, dp[0].time, dp[dp.length - 1].time, period, 'time');

			if (!candles) {
				return;
			}

			for (var k = 0; k < candles.length; k++) {
				candles[k].y = candles[k].y[3];
				candles[k].x = this.getClosestXTimeByTime(sym, period, candles[k].time);

				if (k > 0 && (candles[k].x <= candles[k - 1].x)) {
					candles[k].x = 0;
				}
			}

			candles = candles.filter(c => c.x).sort((a, b) => a.x - b.x);

			var res = candlePublicVar.compareResponse(sym, other, candles, contextData);

			if (!res) {
				return;
			}

			var isClean = true;
			res.data = res.data.sort((a, b) => a.x - b.x);

			do {
				isClean = true;

				for (var k = 1; k < res.data.length; k++) {
					if (Math.floor(res.data[k].x) <= Math.floor(res.data[k - 1].x)) {
						res.data[k].x = 0;
						isClean = false;
					}
				}

				res.data = res.data.filter(c => c.x);

				res.data = res.data.sort((a, b) => a.x - b.x);
			} while (!isClean && res.data.length > 2);

			// the last point tends to get messed up
			if (res.data.length > 2) {
				res.data[res.data.length - 1].x = res.data[res.data.length - 2].x + 1;
			}

			return res;
		},

		load: function(sym, oncomplete, period)
		{
			_.set(hasRendered, [sym, period], false);
			init(sym, false, oncomplete, period);
		},

		isDataLoaded: function(sym, period) {
			return !_.get(dataLoading, [sym, period]);
		},

		isDataLoading: function(sym, period) {
			if (_.get(dataLoading, [sym, period])) {
				return true;
			} else {
				return !_.get(hasRendered, [sym, period]);
			}
		},

		init: function(sym, callback, period)
		{
			init(sym, false, callback, period);
			initDynamicUpdate(sym);
		},

		loadAll: function(sym, callback, period)
		{
			if (!data[sym] || !data[sym][periodIndex[period]])
			{
				this.load(sym, callback, period);
				return;
			}

			if (callback)
			{
				callback();
			}
		},

		hasData: function(sym, period)
		{
			return data[sym] && data[sym][periodIndex[period]];
		},

		getLastX: function(sym, period)
		{
			return candlePublicVar.getLastXByPeriodLength(sym, periodIndex[period]);
		},

		getLastXByPeriodLength: function(sym, periodLength)
		{
			var candles = _.get(data, [sym, periodLength]);
			if (candles && candles.length)
			{
				return candles[candles.length - 1].x;
			}
			else
			{
				// console.error('no candles yet');
				return -1;
			}
		},

		getLastCandle: function(sym, period)
		{
			return candlePublicVar.getLastCandleByPeriodLength(sym, periodIndex[period]);
		},

		getLastCandleByPeriodLength: function(sym, periodLength)
		{
			var candles = _.get(data, [sym, periodLength]);
			if (candles && candles.length)
			{
				return candles[candles.length - 1];
			}
			else
			{
				return null;
			}
		},

		getFirstX: function(sym, period)
		{
			if (!data[sym])
			{
				return 0;
			}

			var dataSet = data[sym][periodIndex[period]];
			if (dataSet && dataSet[0])
			{
				if (isNaN(dataSet[0].x)) {
					console.log('First X IS REALLY NAN', sym);
				}

				return dataSet[0].x;
			} else {
				return 0;
			}
		},

		getMinX: function(sym, period)
		{
			if (data[sym][periodIndex[period]])
			{
				return data[sym][periodIndex[period]][0].x;
			}
		},

		getPeriodIndexByPeriodLength: function(periodLength) {
			return periodIndex.indexOf(periodLength);
		},

		getClosestXTimeByTime: function(sym, period, time, field)
		{
			if (!data[sym]) {
				return;
			}

			var candles = data[sym][periodIndex[period]];

			var idx = findClosest(sym, periodIndex[period], time, 'time');

			return candles[idx][field || 'x'];
		},

		getClosestTimeByX: function(sym, period, x)
		{
			if (!data[sym]) {
				return;
			}

			var candles = data[sym][periodIndex[period]];
			var x = Math.floor(x);

			if (candles)
			{
				for (var k = candles.length - 1; k >= 0; k--)
				{
					if ((candles[k].x <= x) || !k)
					{
						return candles[k].time;
					}
				}
			}
		},

		getMaxX: function(sym, period)
		{
			var dataSet = _.get(data, [sym, periodIndex[period]]);

			if (!dataSet || !dataSet.length)
			{
				return 0;
			}

			return dataSet[dataSet.length - 1].x;
		},

		getCache: function(sym, from, to)
		{
			//return ChartCache.getCache('candle', sym, from, to);
		},

		updateCache: function(sym, len, data)
		{
			//return ChartCache.updateCache('candle', sym, len, data);
		},

		getPeriodStartX: function(sym, period, periodIndex)
		{
			return this.getLastX(sym, periodIndex) - CANDLESTICK_COUNT;
		},

		getLabelType: function(date, intv)
		{
			if (intv <= 5)
			{
				return 'min';
			}
			else if (intv == 6)
			{
				return 'day';
			}
			else
			{
				return 'year';
			}
		},

		getDate: function(str, tz)
		{
			return new Date(str);
		},

		getPeriodLength: function(period, sym)
		{
			if (period)
			{
				return period.src;
			}
		},
	};

	return candlePublicVar;
});