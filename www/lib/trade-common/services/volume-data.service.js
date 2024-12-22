angular.module('starter.trade')

.service('VolumeData', function(SymbolData, MarketStatus)
{
    var data = {};
	var cmdSent = {};
	var endOfData = {};
	var isLoading = {};

	var liveRateCallbacks = {};
	var chartCallbacks = {};

	var baseX = null;
	var baseXTime = null;
	var interceptors = [];

    var ChartData = null;
    var getChartData = function()
    {
		if (!ChartData)
		{
			ChartData = angular.element(document.getElementById('app')).injector().get('ChartData');
		}

		return ChartData;
	};

    var CandleData = null;
    var getCandleData = function()
    {
		if (!CandleData)
		{
			CandleData = angular.element(document.getElementById('app')).injector().get('CandleData');
		}

		return CandleData;
	};

    var ws = null;
	var socketErrorCount = 0;
	var isConnected = false;
	var lastResumeTime = 0;

	function wsConnect() {
		// ws = new WebSocket('ws://' + baseUrl[currentBaseUrlIndex]);
		// if(window.isPaused)
		// {
		// 	return;
		// }

		// is this needed? .reset() gets called on ws.onclose already.
		// That happends when .reset() gets called and on fresh app launch the stuff that gets cleared in .reset is empty already
		// VolumeData.reset();

		if (ws) {
			try {
				ws.onclose = function() { console.log('Closing previous WS instance') }
				ws.close();
			} catch (e) {
				console.error('Error closing websocket', e);
			}
		}

		ws = new WebSocket(window.appConfig.volumeWsUrl);

		ws.onopen = function() {
			VolumeData.restoreSubscriptions();
		};

		ws.onmessage = function(msg) {
			lastResumeTime = 0;

			for (var k = 0; k < interceptors.length; k++) {
				msg = interceptors[k](msg);

				if (!msg) {
					console.log('Interceptor blocked message');
					return;
				}
			}

			var e = JSON.parse(msg.data);

			var cmd = e[0];
			if (cmd) {
				delete cmdSent[cmd];

				var volData = e[1];
				var parts = cmd.split(':');
				var cmdType = parts.shift();

				// load query results
				if ('vol' == cmdType) {
					var sym = parts.shift();
					var period = parts.shift();
					var pi = getCandleData().getPeriodIndexByPeriodLength(parseInt(period));

					if (!data[sym]) {
						data[sym] = {};
					}

					if (!data[sym][period]) {
						data[sym][period] = [];
					}

					isLoading[sym + '-' + period] = false;

					var append = [];
					for (var k = 0; k < volData.length; k++) {
						var p = volData[k];
						var xTime = getChartData().getXByDate(sym, new Date((p[0]) * 1000));
						var x = getCandleData().getClosestXTimeByTime(sym, pi, xTime + parseInt(period), 'time');

						append.push({
							x: x,
							y: p[1],
							time: p[0],
							xTime: x,
							debug: p[3],
							date: new Date(p[0] * 1000)
						});
					}

					if (!volData.length) {
						var d = data[sym][period];
						endOfData[cmdType + ':' + sym + ':' + period] = d.length ? d[0].time : 'empty';
						return;
					}

					// check if the X positions of the last 2 volume bars are not the same
					var l = volData.length;
					if (l > 1) {
						if (volData[l - 1].x == volData[l - 2].x) {
							volData[l - 1].x += parseInt(period);
						}
					}

					var m = data[sym][period].concat(append);
					var merged = {};
					for (var k = 0; k < m.length; k++) {
						merged[m[k].x] = m[k];
					}

					var d = Object.values(merged).sort((a, b) => a.time - b.time);

					data[sym][period] = d;

				// live volume data update
				} else if ('lv' == cmdType) {
					var sym = parts.shift();
					var vol = parseFloat(volData);
					_.each(data[sym], function(volume, period) {
						var last = volume[volume.length - 1];
						var lastCandle = getCandleData().getLastCandleByPeriodLength(sym, period);
						var lastCandleTime = Math.floor(getChartData().getDate(lastCandle.time).getTime() / 1000);

						// var pi = getCandleData().getPeriodIndexByPeriodLength(parseInt(period));
						// var volX = getCandleData().getClosestXTimeByTime(sym, pi, last.x);
						// var volX = last.x;

						var diffBetweenCandle = lastCandleTime - last.time;
						if (!window.chart.scope.isNewCandleAdded() && diffBetweenCandle > 0 && (last.time < (Date.now() / 1000))) {
							volume.push({x: lastCandle.x, xTime: lastCandle.x, time: lastCandleTime, y: 0, dynamic: true, date: (new Date(lastCandleTime * 1000)).toISOString()});
							// console.log('appending', sym, period, 'old', last.time, 'new', lastCandleTime, 'old x', last.xTime, 'new x', last.xTime - (Date.now() / 1000), lastCandle.x); //volX - lastCandle.time, JSON.parse(JSON.stringify(last)), '-- >', diffBetweenCandle, '< ---', volX, lastCandle.x, lastCandleTime, last.time - lastCandleTime, volume.slice(-10, volume.length), JSON.parse(JSON.stringify(lastCandle)))
							var last = volume[volume.length - 1];
						}

						var steps = 10;
						var step = vol / steps;
						var idx = 0;
						// last.x = lastCandle.time;
						var addInterval = window.setInterval(function() {
							last.y = last.y + step;
							if (++idx == steps) {
								window.clearInterval(addInterval);
							}
						}, 50);
					});
				} else if ('lr' == cmdType) {
					var sym = parts.shift();
					var rate = parseFloat(volData[0]);

					if (!liveRateCallbacks[sym]) {
						console.log('Live rate notification received for', sym, 'but there is no callback registered');
						return;
					}

					liveRateCallbacks[sym](rate);
				} else if ('x' == cmdType) {
					baseX = volData[0];
					baseXTime = Date.now();
				} else if ('legacychart' == cmdType) {
					var id = volData[0] + ':' + volData[1];
					if (chartCallbacks[id]) {
						chartCallbacks[id](volData[2]);
						delete chartCallbacks[id];
					}
				} else if ('symbols' == cmdType) {
					_.each(volData, function(values, sym) {
						var s = SymbolData.getSymbol(sym) || {};

						_.each(values, function(val, key) {
							s[key] = val;
						});

						SymbolData.set(sym, s);
					});

					isConnected = true;
				} else if ('markethours' == cmdType) {
					_.each(volData, function(value, id) {
						MarketStatus.updateMarketStatus(id, value);
					});
				}

				return;
			}

			if (e.event === 'ping') {
				return;
			}
		};

		ws.onclose = function(e) {
			VolumeData.reset();
			isConnected = false;

			console.log('Volume Socket is closed. Reconnect will be attempted in 1 second.', e.code, e.reason);
			setTimeout(function() {
				wsConnect();
			}, 1000);
		};

		ws.onerror = function(err) {
			// console.error('Socket encountered error: ', err, 'Closing socket');
			console.error('Socket encountered error. Closing socket.', err);

			socketErrorCount++;

			// var sinceResume = Math.floor((Date.now() - lastResumeTime) / 1000);
			// if (sinceResume > 3 && sinceResume < 10) {
			// 	if (navigator.splashscreen) {
			// 		navigator.splashscreen.show();
			// 	}

			// 	window.setTimeout(function() {
			// 		window.location.reload();
			// 	}, 500);
			// }

			// if(socketErrorCount >= 3)
			// {
			// 	socketErrorCount = 0;
			// 	changeBaseUrl();
			// }

			if(ws.readyState == 1)
			{
				ws.close();
			}
		};
    }

    // ios websocket gets stuck on CLOSING when app has been in background in some cases.
    // document.addEventListener("resume", () => {window.connectStuckVolumeWs();}, false);

	window.connectStuckVolumeWs = function()
	{
		if(ws)
		{
			if(ws.readyState === 2 || ws.readyState === 3)
			{
				console.log('ws might be stuck on closing');
				wsConnect();
			}
		}
	}

	// ios websocket gets stuck on CLOSING when app has been in background in some cases.
	document.addEventListener("resume", function()
	{
		lastResumeTime = Date.now();

		if(ws)
		{
			if(ws.readyState >= 2)
			{
				console.log('ws might be stuck on closing');
				wsConnect();
			}
		}
	}, false);

	var maxValues = {};
	var assetDelay = {};

    var VolumeData = {
		get: function(sym, from, to, period, contextData, chartScope) {

			if (!data[sym] || !data[sym][period] || !data[sym][period].length)
			{
				this.fetch(sym, null, period);
				return;
			}

			if (assetDelay[sym] === undefined) {
				var cat = window.appConfig.assetCategories.find(c => c.instruments.indexOf(sym) > -1);
				var isStockMarket = cat && cat.name == 'Stocks';
				assetDelay[sym] = isStockMarket ? 900 : 0;
			}

			var delay = period <= 900 ? assetDelay[sym] : 0;

			var d = data[sym][period];
			if (d[0].time > from) {
				this.fetch(sym, from + period, period);
			}

			var c = contextData[0].dataPoints;
			var fromTime = c[0].time - delay;
			var toTime = c[c.length - 1].time - delay;

			var fi = null;
			var ti = null;
			for (var k = 0; k < d.length - 1; k++) {
				var cr = d[k].x;
				var n = d[k + 1].x;

				if ((fi === null) && (cr <= fromTime && n > fromTime)) {
					fi = k;
				}

				if ((ti === null) && (cr <= toTime && n > toTime)) {
					ti = k;
				}

				if (!(ti === null) && !(fi === null)) {
					break;
				}
			}

			if (!fi) {
				fi = 0;
			}

			if (!ti) {
				ti = d.length - 1;
			}

			fi = Math.max(0, fi - 5);
			ti = ti + 5;

			var volData = JSON.parse(JSON.stringify(d.slice(fi, ti + 1)));

			ret = [];
			for (var i = 0; i < volData.length; i++) {
				volData[i].x += delay;
				ret.push(volData[i]);
			}

			var max = 0;
			for (var k = 0; k < ret.length; k++) {
				max = Math.max(ret[k].y, max);
			}

			if (!maxValues[sym]) {
				maxValues[sym] = {};
			}

			if (!maxValues[sym][period]) {
				maxValues[sym][period] = max;
			}

			maxValues[sym][period] = Math.max(max, maxValues[sym][period]);
			max = maxValues[sym][period];

			// todo - keep the max value range?
			maxValues[sym][period] = 0;

			var getY = function(pct) {
				return ((pct / max) / 5) * 100;
			}

			while (ret.length && (ret[0].x < c[0].time)) {
				ret.shift();
			}

			while ((ret.length > 1) && (ret[ret.length - 2].x > c[c.length - 1].time)) {
				ret.pop();
			}

			if (!ret.length || !c.length) {
				return;
			}

			var rising = {};

			for (var k = 0; k < c.length; k++) {
				var p = c[k];
				var y = p.candle ? p.candle : p.y;
				rising[p.x] = y[0] <= y[3];
			}

			var pi = getCandleData().getPeriodIndexByPeriodLength(period);
			for (var k = 0; k < ret.length; k++) {
				var vol = getY(ret[k].y);
				ret[k].origTime = ret[k].x;
				ret[k].vol = ret[k].y;
				ret[k].x = getCandleData().getClosestXTimeByTime(sym, pi, ret[k].x);

				ret[k].date = getChartData().getDate(ret[k].time);

				delete ret[k].y;

				ret[k].pct = vol;
				if (rising[ret[k].x]) {
					ret[k].color = 'green';
				}
			}

			// while (ret.length && !ret[ret.length - 1].x) {
			// 	var pop = ret.pop();
			// }

			var cleaned = {};
			for (var k = 0; k < ret.length; k++) {
				cleaned[ret[k].x] = ret[k];
			}

			ret = Object.values(cleaned).sort((a, b) => a.x - b.x);

			// console.log(JSON.parse(JSON.stringify((ret))), JSON.parse(JSON.stringify((c))));

			// console.log(ret[ret.length - 1].x, c[c.length - 1].x, '--', d[d.length - 1].x, ret[ret.length - 1].pct);

			// return JSON.parse(JSON.stringify(ret));

			return ret;
		},

        fetch: function(sym, to, period) {
			var baseCmd = 'vol:' + sym + ':' + period.toString();

			var end = endOfData[baseCmd];
			if (end && (end == 'empty' || end >= to)) {
				// console.log('end reached', baseCmd);
				return;
			}

			var cmd = baseCmd + (to ? ':' + to.toString() : '');

			this.sendCmd(cmd, function() {
				isLoading[sym + '-' + period] = true;
			});
        },

		sendCmd: function(cmd, immediateCallback) {
			if (cmdSent[cmd]) {
				console.log(cmd, 'already sent');
				return;
			}

            if (ws && ws.readyState === ws.OPEN) {
				cmdSent[cmd] = Date.now();

				if (immediateCallback) {
					immediateCallback();
				}

				ws.send(cmd);
            }
		},

		reset: function() {
			data = {};
			cmdSent = {};
			endOfData = {};
			isLoading = {};
			maxValues = {};

			if (ws && ws.readyState === ws.OPEN) {
				ws.close();
			}
		},

		isLoading: function(sym, period) {
			return !!isLoading[sym + '-' + period];
		},

		getMaxValue: function(sym, period) {
			return maxValues[sym] ? maxValues[sym][period] : 0;
		},

		subscribeToLiveRates: function(sym, callback) {
			var cmd = 'rates:' + sym;
			this.sendCmd(cmd);
			liveRateCallbacks[sym] = callback;
		},

		fetchChart: function(sym, period, callback) {
			var id = sym + ':' + period;
			var cmd = 'legacychart:' + id;
			this.sendCmd(cmd);

			chartCallbacks[id] = callback;
		},

		getCurrentX: function() {
			if (!baseX) {
				return null;
			}

			return Math.floor(baseX + ((Date.now() - baseXTime) / 1000));
		},

		restoreSubscriptions: function() {
			_.each(liveRateCallbacks, function(callback, sym) {
				VolumeData.subscribeToLiveRates(sym, callback);
			});

			_.each(chartCallbacks, function(callback, id) {
				var parts = id.split(':');
				VolumeData.fetchChart(parts[0], parts[1], callback);
			});
		},

		addInterceptor: function(callback) {
			interceptors.push(callback);
		},

		isConnected: function() {
			return isConnected;
		}
    };

	wsConnect();

    return VolumeData;
});