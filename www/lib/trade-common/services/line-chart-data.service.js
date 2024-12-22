angular.module('starter.trade')

.service('ChartData', function(CandleData, ChartRef, ChartCache, SymbolData, MarketStatus, DateNow, $http, VolumeData)
{
    var baseTime = (new Date(Date.UTC(2011, 1, 1, 0, 0, 0, 0))).getTime();

    var refs = {};
    var data = {};

    var lastUpdate = Date.now();

	// todo - set data websocket URL via Firebase (could be in app DB)
	// var httpRoot = 'http://fxhttp.cred24.lv/fx/';
    // ChartRef.ref('http').once('value', function(snap)
    // {
	// 	httpRoot = snap.val();
	// });

	var replaceCompressed = function(sval)
	{
		// common replacements
		//~ var replace = [{'0.00000': 'T'}, {'0.0000': 'R'}, {'0.000': 'E'}, {'0.00': 'W'}, {'0.0': 'Q'}, {'0.': '!'}, {'|-T': 'g', '|T': 't', '|-R': 'f', '|R': 'r', '|-E': 'd', '|E': 'e', '|-W': 's', '|W': 'w', '|-Q': 'a', '|Q': 'q'}, {'|0|0|0|0': '$'}, {'|0|0|0': '#'}, {'|0|0': '@'}, {'|0': ')'}];
		var replace = [{'0.00000': 'r'}, {'0.0000': 'o'}, {'0.000': 'l'}, {'0.00': 'i'}, {'0.0': 'f'}, {'0.': 't'}, {'|-r': 's', '|r': 'q', '|-o': 'p', '|o': 'n', '|-l': 'm', '|l': 'k', '|-i': 'j', '|i': 'h', '|-f': 'g', '|f': 'e'}, {'|0|0|0': 'c'}, {'|0|0': 'b'}, {'|0': 'a'}, {'|': 'u', '.': 'v', '-': 'd'}];
		for (var k = replace.length - 1; k >= 0; k--)
		{
			_.each(replace[k], function(to, from)
			{
				sval = sval.split(to).join(from);
			});
		}

		return sval;
	}

	var compressedWatch = {};
	var watchCompressed = function(sym, callback)
	{
		var intvId = sym + '_' + Math.random().toString();

		if (compressedWatch[sym] && data[sym] && (data[sym].length))
		{
			if (callback) {
				callback();
			}

			return;
		}

		if (!window.aliasIntv) {
			window.aliasIntv = {};
		}

		var watchWebsocket = function(sym) {
			compressedWatch[sym] = true;

			VolumeData.subscribeToLiveRates(sym, function(value) {
				var x = VolumeData.getCurrentX();
				if (!x) {
					return x;
				}

				var newRate = {x: x, realX: x, y: value, compressed: true, ws: true};
				liveValueCallback(sym, newRate);
			});
		};

		var liveValueCallback = function(sym, rate) {
			chartRefTime = Date.now();

			var sinceLastUpdate = Math.floor((Date.now() - lastUpdate) / 1000);
			var needsReset = lastUpdate && (sinceLastUpdate > 40) && MarketStatus.isOpen(sym);
			lastUpdate = Date.now();

			if (needsReset)
			{
				console.log('needs reset', sym, sinceLastUpdate);
				publicVar.resetAll(true);
				return;
			}

			if (!data[sym])
			{
				data[sym] = [];
			}

			// the rate is already there
			if (data[sym].length && (data[sym][data[sym].length - 1].x >= rate.x))
			{
				return;
			}

			if (MarketStatus.isOpen(sym))
			{
				data[sym].push(rate);

				if (data[sym].length)
				{
					var val = data[sym][data[sym].length - 1];
					SymbolData.update(sym, val);
				}
			}
		};

		var waitForConnection = function()
		{
			if (VolumeData.isConnected())
			{
				window.clearInterval(window.aliasIntv[intvId]);
			}
			else
			{
				return;
			}

			if (callback) {
				callback();
				callback = null;
			}

			if (!data[sym])
			{
				data[sym] = [];
			}

			watchWebsocket(sym);
		};

		waitForConnection();
		window.aliasIntv[intvId] = window.setInterval(waitForConnection, 100);
	};

	var findClosest = function(sym, index, field)
	{
		field = field ? field : 'x';
		var d = data[sym];

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

		return from;
	};

	var getDate = function(x)
	{
		return new Date(baseTime + (x * 1000));
	};

	var chartRefTime = 0;

	VolumeData.addInterceptor(function(msg) {
		chartRefTime = Date.now();
		return msg;
	})

	// disabled in TG
	var checkChartRef = function()
	{
		// if(chartRefTime)
		// {
		// 	var currentTime = Date.now();

		// 	if (window.isPaused) {
		// 		chartRefTime = Date.now();
		// 	}

		// 	var diff = currentTime - chartRefTime;
		// 	if(diff >= 15000)
		// 	{
		// 		// console.log('chartRef websocket connection lost?');
		// 		var currentBaseUrlIndex = window.localStorage.currentBaseUrlIndex || 0;
		// 		var pingUrl = window.appConfig.apiUrlProtocol + window.appConfig.apiUrl[currentBaseUrlIndex];

		// 		// checking when connection back
		// 		var params = {
		// 			url: pingUrl + '?' + Date.now().toString(),
		// 			method: 'GET',
		// 			headers: {'accept': '*/*', 'accept': 'application/json'},
		// 			timeout: 2000
		// 		};

		// 		axios(params)
		// 		.then(function(response) {
		// 			CandleData.resetAll();
		// 			ChartCache.resetAll();
		// 			publicVar.resetFirebaseConnection();
		// 			checkChartRefTimeout();

		// 			return;

		// 		}).catch(function(error)
		// 		{
		// 			checkChartRefTimeout();

		// 			return;
		// 		});
		// 	}
		// 	else
		// 	{
		// 		checkChartRefTimeout();
		// 	}
		// }
		// else
		// {
		// 	checkChartRefTimeout();
		// }
	};

	var checkChartRefTimeout = function()
	{
		window.clearTimeout(window.checkChartRef);
		window.checkChartRef = window.setTimeout(function()
		{
			checkChartRef();
		}, 2000);
	}

	checkChartRefTimeout();

	var lastReset = null;

    var publicVar = {
		watchCompressed: function(sym)
		{
			watchCompressed(sym);
		},

		resetFirebaseConnection: function() {
			if (window.isPaused) {
				return;
			}

			firebase.database().goOffline();
			ChartRef.goOffline();

			firebase.database().goOnline();
			ChartRef.goOnline();

			console.error('resetting Firebase connection');
		},

		resetAll: function(force)
		{
			if (lastReset && (Date.now() - lastReset < 5000) && !force || window.isPaused)
			{
				return;
			}

			console.error('---- resetting chart data --- ');

			this.resetFirebaseConnection();

			lastReset = Date.now();

			refs = {};
			data = {};

			CandleData.resetAll();
			ChartCache.resetAll();
			VolumeData.reset();

			_.each(compressedWatch, function(ref, sym) {
				compressedWatch[sym] = null;
			});

			compressedWatch = {};
		},

		getLastX: function(sym)
		{
			var delay = SymbolData.getDelay(sym);

			if (data[sym] && data[sym].length && data[sym][data[sym].length - 1])
			{
				var lastX = data[sym][data[sym].length - 1].x;

				if (delay)
				{
					var endX = lastX;

					lastX = ((DateNow() - baseTime) / 1000) - delay;

					if (isNaN(lastX)) {
						console.log('LastX is really NAN', sym, endX);
					}

					lastX = Math.min(endX, lastX);
				}

				return lastX;
			} else {
				return 0;
			}
		},

		getXByDate: function(sym, date)
		{
			return ((date.getTime() - baseTime) / 1000) - SymbolData.getDelay(sym);
		},

		getDate: function(x)
		{
			return getDate(x);
		},

		getRateAtX: function(sym, x)
		{
			var d = data[sym];
			if (!d || !d.length || (d[d.length - 1].x < x))
			{
				if (d && d.length) { console.log('data behind', d[d.length - 1].x, x) }
				return null;
			}

			var idx = findClosest(sym, Math.floor(x));

			// if the closest point is ahead of the requested one, move one point back to be able to calculate the dynamic price between the points
			if (idx > 0 && d[idx - 1] < x && d[idx] > x) {
				console.error('moving backwards')
				idx--;
			}

			var first = d[idx];

			var ret;
			if ((first.x == x) || (idx == d.length - 1))
			{
				ret = first;
			}
			else
			{
				var nextIdx = idx + 1;
				var next = d[nextIdx];

				var rate = cloneObj(first);
				var xRange = Math.abs(rate.x - next.x);

				var firstCoef = (Math.abs(x - rate.x) / xRange);
				var secondCoef = 1 - firstCoef;

				rate.y = (secondCoef * rate.y) + (firstCoef * next.y);
				rate.x = x;

				rate.pointChange = next.y - rate.y;

				ret = rate;
			}

			ret = cloneObj(ret);
			var spread = SymbolData.getPositionSpread(sym);
			if (spread)
			{
				ret.y += spread;
			}

			return ret;
		},

		prependPoint: function(sym, point)
		{
			if (!data[sym]) {
				data[sym] = [];
			}

			if (!data[sym].length || (point.x < data[sym][0].x)) {
				data[sym].unshift(point);
				data[sym] = _.sortBy(data[sym], 'x');
			}
		}
    };

    return publicVar;
});