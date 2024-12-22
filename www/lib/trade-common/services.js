angular.module('starter.trade', [])

.service('ChartPeriods', function(CANDLESTICK_COUNT)
{
    var transformFunc = null;
    var visiblePeriods = [window.localStorage.defaultLineChartPeriod || 0];

    return {
	setTransformFunc: function(f)
	{
		transformFunc = f;
	},

	get: function()
	{
		var sec = _.get(window.appConfig.periodLabelTimes, [0]) || '<small>S</small>';
		var min = _.get(window.appConfig.periodLabelTimes, [1]) || '<small>M</small>';

		var periods = [
			   // {label: '5' + sec, src: 5},
			   {label: '15' + sec, src: 15},
			   {label: '1' + min, src: 60},
			   {label: '5' + min, src: 300},
			   {label: '15' + min, src: 900},
			   {label: '30' + min, src: 1800},
			   {label: '1H', src: 3600},
			   {label: '1D', src: 86400},
			   {label: '1M', src: 86400 * 30}
		];

		if (transformFunc)
		{
			periods = transformFunc(periods);
		}

		return periods;
    },

    getVisiblePeriods: function(type)
    {
    	var sec = _.get(window.appConfig.periodLabelTimes, [0]) || '<small>S</small>';
		var min = _.get(window.appConfig.periodLabelTimes, [1]) || '<small>M</small>';

		var periods = [
			   // {label: '5' + sec, src: 5},
			   {label: '15' + sec, src: 15},
			   {label: '1' + min, src: 60},
			   {label: '5' + min, src: 300},
			   {label: '15' + min, src: 900},
			   {label: '30' + min, src: 1800},
			   {label: '1h', src: 3600},
			   {label: '1d', src: 86400},
			   {label: '1m', src: 86400 * 30}
			];

		var customPeriods = [];
		_.each(visiblePeriods, function(v, i)
		{
			customPeriods.push(periods[v]);
		});

		return customPeriods;
    },

    setVisiblePeriods: function(periods)
    {
    	visiblePeriods = periods;
    },

    getVisiblePeriodsArray: function(periods)
    {
    	return visiblePeriods;
    },

    setStyle: function(i)
    {
    	tradingStyle = i;
    },

    getLabelByIndex: function(type, index)
    {
		var period = this.get()[index];
		return period ? period.label : '';
	}
}
})

.service('SymbolData', function(ChartRef, $rootScope)
{
    var data = {};
    var spreads = {};
    var delay = 0;
    var symDelay = {};
	var instrumentWatchers = {};
	var symbolData = {};
	var activeAssets = [];

    var ChartData = null;
    var getChartData = function()
    {
		if (!ChartData)
		{
			ChartData = angular.element(document.getElementById('app')).injector().get('ChartData');
		}

		return ChartData;
	};

    var User = null;
    var getUser = function()
    {
		if (!User)
		{
			User = angular.element(document.getElementById('app')).injector().get('Mongo');
		}

		return User;
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

	return {
		get: function()
		{
			return data;
		},

		getSymbol: function(sym)
		{
			if (sym == 'BATTLE')
			{
				return;
			}

			var d = data[sym];

			if (!d)
			{
				return;
			}

			var d = JSON.parse(JSON.stringify(d));

			var c = getChartData();

			// dynamic last X based on delay
			var realX = c.getLastX(sym);
			// console.log(sym, 'data buffer', c.getLastXRealTimeUnsafeDebugOnly(sym) - realX);

			var x = realX;
			// todo - refactor, we probably only need to keep the last 2 data points in order to calculate the dynamic rate movement
			
			// realX looks to be a good indicator of whether the chart is active or not.
			// If it's not active, we use .mid rate from firebase datatest/symbols/
			if(!realX)
			{
				var rate = this.getSymbolRate(sym);
				if(!rate)
				{
					var rate = c.getRateAtX(sym, x);
					var rate = rate ? rate.y : d.mid;
				}
			}
			else
			{
				var rate = c.getRateAtX(sym, x);
				var rate = rate ? rate.y : d.mid;
			}

			if (rate)
			{
				if (Math.abs(1 - (rate / d.mid)) > 0.01) {
					console.log('Invalid calculated rate detected for ', sym, ' . Expected around ', d.mid, ' got ', rate, 'getSymbol'/*, c.getAllData(sym)*/);
					window.clearTimeout(window.resetInvalidData);
					c.resetAll();
					window.resetInvalidData = window.setTimeout(function() {
						getCandleData().load(sym);
					}, 200);
					return;
				}

				d.spread = spreads[sym];
				d.bid = rate - spreads[sym];
				d.ask = rate + spreads[sym];
				d.mid = rate;

				// todo - where is this still used?
				d.prev = rate;

				d.realX = realX;
				d.ch = d.mid * (d.pch / 100);
				d.x = x;
				//d.pch = Math.round((d.ch / d.mid) * 10000) / 100;
			}

			return d;
		},

		getMarket: function(sym)
		{
			if(data && data[sym])
			{
				return data[sym].market;
			}
		},

		set: function(sym, val)
		{
			data[sym] = val;

			var spread = val.ask - val.mid;
			if (!spreads[sym]) {
				spreads[sym] = spread;
			}
		},

		setDelay: function(sec, sym)
		{
			if (sym)
			{
				symDelay[sym] = sec;
				return;
			}

			delay = sec;
		},

		getDelay: function(sym)
		{
			return 10;

			var delay = _.get(symDelay, [sym]);
			if (isNaN(delay)) {
				delay = 15;
			}

			var finalDelay = Math.max(10, (delay || 15) + 5);

			console.log('delay', sym, finalDelay);

			return finalDelay;
		},

		getSpread: function(sym)
		{
			var spread = Math.abs(spreads[sym] || (data[sym] ? data[sym].ask - data[sym].bid : 0));
			if (!spreads[sym]) {
				spreads[sym] = spread;
			}

			if (isNaN(spreads[sym])) {
				spreads[sym] = 0;
			}

			return spreads[sym];
		},

		getPositionSpread: function(sym)
		{
			var pos = getUser().getPosition(sym);
			var spread = 0;
			if (pos && pos.pair)
			{
				var spread = this.getSpread(sym);
				if ('buy' == pos.type)
				{
					spread = spread * -1;
				}

				if ('USD' == pos.pair.substr(0, 3))
				{
					spread = spread * -1;
				}
			}

			return spread;
		},

		update: function(sym, val)
		{
			if (!data[sym])
			{
				data[sym] = val;
				return;
			}

			data[sym].mid = val.y;
			data[sym].ask = val.y + spreads[sym];
			data[sym].bid = val.y - spreads[sym];
			data[sym].x = val.x;
		},

		initSymbolRates: function(assets)
		{
			activeAssets = assets;
			_.forEach(activeAssets, this.subscribe);
		},

		subscribe: function(sym)
		{
			ChartRef.ref('symbols').child(sym).child('mid').on('value', function(snapshot)
			{
				symbolData[sym] = snapshot.val();
				$rootScope.$broadcast('symbol-rates-updated', sym);
			});
		},
		
		unsubscribe: function(sym)
		{
			ChartRef.ref('symbols').child(sym).child('mid').off();
			delete symbolData[sym];
		},
		
		unsubscribeAll: function()
		{
			_.forEach(activeAssets, this.unsubscribe);
			symbolData = {};
		},

		getAllSymbolRates: function()
		{
			return symbolData;
		},

		getSymbolRate: function(sym)
		{
			if(!symbolData || !symbolData[sym])
			{
				return null;
			}

			return symbolData[sym];
		}
    };
})

.service('ChartCache', function()
{
	var cache = {line: {}, candle: {}};

    var ChartData = null;
    var getChartData = function()
    {
		if (!ChartData)
		{
			ChartData = angular.element(document.getElementById('app')).injector().get('ChartData');
		}

		return ChartData;
	};

	return {
		reset: function(type, sym)
		{
			cache[type][sym] = {};
			// console.error('RESET', type, sym);
		},

		resetAll: function()
		{
			// console.error('RESET ALL :((((');
			cache = {line: {}, candle: {}};
		},

		getCache: function(type, sym, from, to, period)
		{
			var len = period === undefined ? Math.floor((to - from) / 1) * 1 : period;

			var id = len.toString();

			if (!cache[type][sym] || !cache[type][sym][id])
			{
				return [];
			}

			var c = cache[type][sym][id];
			var l = c.length - 1;
			var ret = [];
			var cacheStart = -1;
			var cacheEnd = -1;
			for (var k = 0; k < c.length; k++)
			{
				var i = c[k];
				if (!i)
				{
					continue;
				}

				if (i.x >= from && i.x <= to)
				{
					if (cacheStart == -1)
					{
						cacheStart = k;
					}

					cacheEnd = k;
				}
			}

			cacheStart = Math.max(0, cacheStart - 1);
			cacheEnd += 2;

			var cc = c.slice(cacheStart, cacheEnd);

			while (!cc[0] && cc.length)
			{
				cc.shift();
			}

			cc = cc.sort((a, b) => a.x - b.x);

			return cc;
		},

		updateCache: function(type, sym, len, data)
		{
			var id = (Math.floor(len / 1) * 1).toString();

			if (!data || !data.length)
			{
				// console.log(' NO data to update' , id);
				return;
			}

			if (!cache[type][sym])
			{
				cache[type][sym] = {};
			}

			if (!cache[type][sym][id])
			{
				cache[type][sym][id] = data;
				return;
			}

			var c = cache[type][sym][id];

			while (!data[0] && data.length)
			{
				data.shift();
			}

			while (!c[0] && c.length)
			{
				c.shift();
			}

			while (data && !data[data.length - 1] && data.length)
			{
				data.pop();
			}

			if (!data.length)
			{
				console.log('no chart cache to update');
				return;
			}

			var from = data[0].x;
			var to = data[data.length - 1].x;
			var firstCached = c[0].x;
			var l = c.length - 1;

			if (!c[l])
			{
				console.log('resetting all');
				getChartData().resetAll();
				return;
			}

			var lastCached = c[l].x;

			// append
			if (lastCached > from && lastCached < to)
			{
				var append = _.filter(data, function(i) { return (i.x > lastCached) && !(i.x % 1); });
				cache[type][sym][id] = c.concat(append);
			}

			// prepend
			else if (firstCached > from && lastCached > from)
			{
				cache[type][sym][id] = _.filter(data, function(i) { return i.x < firstCached; }).concat(c);
			}

			// replace
			else if (!c.length)
			{
				//~ console.log('replacing' , id);
				cache[type][sym][id] = data;
			}
		}
	}
})


.service('RSI', function(ChartHelper, VMin)
{
	return {
		get: function(rsiGains, prevAvgPoints, chartScope)
		{
			// step 1 - calculate the average gain/loss for each period / candle (for the previous 14 periods)
			var rsiPeriodGains = [];
			for (var k = prevAvgPoints; k < rsiGains.length; k++) {
				var gains = 0;
				var losses = 0;

				for (var n = k; n >= k - prevAvgPoints; n--) {
					var periodRes = rsiGains[n][0];
					if (periodRes > 0) {
						gains += periodRes;
					} else {
						losses += Math.abs(periodRes);
					}
				}

				rsiPeriodGains.push([gains / prevAvgPoints, losses / prevAvgPoints, rsiGains[k][1]]);
			}

			// step 2 - smoothen out the data
			var rsiFinal = [];
			for (var k = 1; k < rsiPeriodGains.length; k++) {
				var avgGain = (rsiPeriodGains[k - 1][0] * (prevAvgPoints - 1)) + rsiPeriodGains[k][0];
				var avgLoss = (rsiPeriodGains[k - 1][1] * (prevAvgPoints - 1)) + rsiPeriodGains[k][1];
				rsiFinal.push([100 - (100 / (1 + (avgGain / avgLoss))), rsiPeriodGains[k][2]]);
			}

			var yAxis = chartScope.getYAxis();
			var xAxis = chartScope.getXAxis();

			if (!yAxis) {
				return;
			}

			var chartRangeMin = yAxis.viewportMinimum;
			var chartRangeMax = yAxis.viewportMaximum;

			var ret = [];

			for (var k = 0; k < rsiFinal.length; k++) {
				var p = rsiFinal[k];
				ret.push({x: p[1].x, pct: p[0]});
			}

			var getY = function(pct) {
				return chartRangeMin + ((chartRangeMax - chartRangeMin) * (pct / 100));
			}

			var splitLine = function(current, next, threshold) {
				var cPct = current.pct;
				var nPct = next.pct;

				if ((cPct > threshold && nPct < threshold) || (cPct < threshold && nPct > threshold)) {
					var diff = next.x - current.x; // 40 - 0 = 40
					var angle = Math.abs((nPct - cPct) / diff);

					var pctChange = Math.abs(cPct - threshold);
					var cutX = current.x + (pctChange / angle);

					return [{x: current.x, pct: cPct}, {x: cutX, prevX: current.x, pct: threshold, angle, diff, pctChange}];
				} else if ((cPct < threshold && nPct < threshold && 30 == threshold) || (cPct > threshold && nPct > threshold && 70 == threshold)) {
					return [current];
				} else {
					return null;
				}
			}

			// color lines under oversold and over overbought thresholds
			var split = [];
			for (var k = 0; k < ret.length - 1; k++) {
				var current = ret[k];
				var next = ret[k + 1];

				split = split.concat(splitLine(current, next, 30) || splitLine(current, next, 70) || [current]);
			}

			var prev = split[0];
			var dash = 'shortDot';
			for (var k = 1; k < split.length; k++) {
				var p = split[k];
				if (p.pct < 30 && (prev.pct <= 30)) {
					p.lineColor = '#11B437';
					prev.lineColor = p.lineColor;
					p.lineDashType = dash;
					prev.lineDashType = dash;
				}
				else if ((p.pct > 70) && (prev.pct >= 70)) {
					p.lineColor = '#ff0000';
					prev.lineColor = p.lineColor;

					p.lineDashType = dash;
					prev.lineDashType = dash;
				}

				prev = p;
			}

			split = split.sort((a, b) => a.x - b.x);

			var y30 = yAxis.convertValueToPixel(getY(30));
			var y70 = yAxis.convertValueToPixel(getY(70));
			var w = xAxis.convertValueToPixel(xAxis.viewportMaximum);

			return {data: split, pctValues: true, label: 'RSI', renderCallback: function(chart) {
				// draw 30% and 70% lines
				var ctx = chart.ctx;
				ChartHelper.drawSolidCustomLine(ctx, 0, y30, w, y30, '#11B437', 1);
				ChartHelper.drawSolidCustomLine(ctx, 0, y70, w, y70, '#f00', 1);

				ChartHelper.drawRateSideLabel('Oversold', y30, '#11B437', ctx, chartScope, ChartHelper.getDefaultFont(), undefined, undefined, 0, true);
				ChartHelper.drawRateSideLabel('Overbought', y70, '#f00', ctx, chartScope, ChartHelper.getDefaultFont(), undefined, undefined, 0, true);
			}};
		}
	};
})

.service('StopLoss', function(Mongo) {

  var ret = firebase.database().ref('stoploss/');

  return {
	set: function(currency, type, rate)
	{
		Mongo.getCached(function(user)
		{
			ret.child(currency + '/' + type + '/' + user.firebaseKeyId).set(rate);
		});
	},

	remove: function(currency, type)
	{
		Mongo.getCached(function(user)
		{
			ret.child(currency + '/' + type + '/' + user.firebaseKeyId).set(null);
		});
	}
  }
})

.service('PortfolioTitle', function($timeout, ChartData, OnlineStatus, $rootScope, Mongo, $window, VolumeData)
{
	var prevTitle;
	var elements = [];
	var portfolioLive = false;
	var portfolioLoading = true;

	var prefix = window.isGoforex ? '$' : '$';

	var updateTitle = function(title, manualTitle)
	{
		if (!elements || !elements.length)
		{
			elements = document.querySelectorAll('.persistant-tab-title .portfolio-value, #account-portfolio-value');
			elements = Array.prototype.slice.call(elements);
			if (!elements.length)
			{
				console.log('no elements');
				return;
			}
		}

		for (el of elements) {
			// show loading icon
			if(!isNaN(title))
			{
				if(portfolioLoading)
				{
					if(!el.classList.contains('loading'))
					{
						el.classList.add('loading');
					}
				}
				else
				{
					if(el.classList.contains('loading'))
					{
						el.classList.remove('loading');
					}
				}
			}
			else
			{
				if(el.classList.contains('loading'))
				{
					el.classList.remove('loading');
				}
			}

			if (!el.parentNode || !el.parentNode.parentNode.parentNode)
			{
				elements = null;
				return;
			}

			if(manualTitle)
			{
				if(prevTitle != title)
				{
					if(isNaN(title))
					{
						el.innerHTML = title;
					}
					else
					{
						el.innerHTML = prefix + ' ' + CanvasJS.formatNumber(title, '### ### ### ##0.00')
					}

					prevTitle = title;
				}

				return;
			}
		}

		if(prevTitle)
		{
			if(isNaN(prevTitle))
			{
				var previousNumber = parseFloat((prevTitle).substr(prevTitle.indexOf(prefix) + 1).replace(/ /g,'')).toFixed(2);
			}
			else
			{
				var previousNumber = prevTitle;
			}

			var newNumber = parseFloat((title).substr(title.indexOf(prefix) + 1).replace(/ /g,'')).toFixed(2);

			if(!isNaN(previousNumber) && !isNaN(newNumber) && previousNumber != newNumber)
			{
				window.localStorage.lastPortfolio = newNumber;

				var options = {
					useEasing: true,
					useGrouping: true,
					separator: ' ',
					decimal: '.',
					prefix: prefix + ' ',
				};

				window.demo = [];

				_.each(elements, function(el, idx)
				{
					window.demo.push(new CountUp(el, previousNumber, newNumber, 2, 1, options));

					if (!window.demo[idx].error)
					{
						window.demo[idx].start();
					}
					else
					{
						console.warn(window.demo[idx].error);
					}
				});
			}
			else
			{
				el.innerHTML = title;
			}
		}
		else
		{
			el.innerHTML = title;
		}

		angular.element(el)[title.substr(0, 1) == prefix ? 'addClass' : 'removeClass']('money');

		prevTitle = title;
	}

	var setAmountInTitle = function()
	{
		if(!portfolioLive)
		{
			return;
		}
		else
		{
			window.clearTimeout(window.titleTimeout);

			if(portfolioLoading)
			{
				updateTitle((window.localStorage.lastPortfolio || window.initialUserCash), true);
			}

			window.titleTimeout = window.setTimeout(function()
			{
				setAmountInTitle();
			}, 2000);
		}

		if (!OnlineStatus.is() || window.isPaused)
		{
			// make title empty in cases when user goes from lessons section to
			// a section with a money title and user has no internet connection
			// otherwise it gets stuck on lesson title

			if(!prevTitle && (window.location.hash == '#/tab/dash' || window.location.hash == '#/tab/play'))
			{
				if(window.localStorage.lastPortfolio)
				{
					updateTitle(window.localStorage.lastPortfolio, true);
				}
				else
				{
					updateTitle(window.initialUserCash || 10000, true);
				}
			}

			portfolioLoading = true;

			return;
		}

		Mongo.getCached(function(user)
		{
			var title = '';
			var value = Mongo.portfolioValue();

			if(!value && value != 0)
			{
				return;
			}

			// TODO: connecting to symbols ref some times is slow or is getting stuck? going to trade section refreshes the connection
			// not the actual portfolio value yet known because app has not connected to 'symbols' ref yet.
			// should not start updating PortfolioTitle with new value because it will only show
			// user.cash + amount of cash invested into a position not the actual value.
			// this might be the reason for what some users are referring to as "big cash jumps", etc.

			if(!VolumeData.isConnected())
			{
				portfolioLoading = true;
				updateTitle(window.localStorage.lastPortfolio || window.initialUserCash, true);
				return;
			}

			portfolioLoading = false;

			if (value)
			{
				title = prefix + '' + CanvasJS.formatNumber(value, '### ### ### ##0.00');
			}
			else
			{
				title = prefix + ' ' + CanvasJS.formatNumber(window.initialUserCash, '### ### ### ##0.00');
			}

			var hasChanged = (prevTitle != title);

			if (hasChanged)
			{
				updateTitle(title);
				$rootScope.portfolio = title;
				$rootScope.$broadcast('$$rebind::portfolio');
			}
		}, function()
		{
			window.setTimeout(function()
			{
				setAmountInTitle();
			}, 1000);
		});
	};

	return {
		resetElements: function()
		{
			elements = [];
		},

	    start: function()
	    {
	    	portfolioLive = true;
	    	setAmountInTitle();
	    },

		stop: function(title)
	    {
	    	portfolioLive = false;

	    	if(window.demo)
	    	{
				_.each(window.demo, function(portf)
				{
					portf.pauseThis();

					if(!portfolioLoading)
					{
						updateTitle(portf.endVal, true);
					}
				});
	    	}

	    	$timeout.cancel(window.titleTimeout);
	    },

	    getLast: function()
	    {
			return prevTitle;
		},

	    restore: function(title)
	    {
	    	if(window.demo)
	    	{
				_.each(window.demo, function(portf)
				{
					portf.pauseThis();
				});
	    	}

			portfolioLoading = true;

			updateTitle(title, true);
		}
	};
})

.service('API', function(Endpoint, $http, Mongo, OnlineStatus)
{
    return {
		get: function(path, params, callback, errorCallback)
		{
			Mongo.getCached(function(user)
			{
				if (!callback && (typeof params === 'function'))
				{
					callback = params;
					params = {};
				}

				if (!params)
				{
					params = {};
				}

				params.uuid = user.firebaseKeyId;

				$http.get(Endpoint + path, {params: params}).then(function(response)
				{
					OnlineStatus.markOnline();
					if (callback)
					{
						callback(response.data);
					}
				}, function(data)
				{
					if (errorCallback)
					{
						errorCallback(data);
					}
				});
			});
		}
    };
})

.service('Country', function()
{
    var countries = {"United States":"US","Canada":"CA","United Kingdom":"GB","Argentina":"AR","Australia":"AU","Austria":"AT","Belgium":"BE","Brazil":"BR","Chile":"CL","China":"CN","Colombia":"CO","Croatia":"HR","Denmark":"DK","Dominican Republic":"DO","Egypt":"EG","Finland":"FI","France":"FR","Germany":"DE","Greece":"GR","Hong Kong":"HK","India":"IN","Indonesia":"ID","Ireland":"IE","Israel":"IL","Italy":"IT","Japan":"JP","Jordan":"JO","Kuwait":"KW","Lebanon":"LB","Malaysia":"MY","Mexico":"MX","Netherlands":"NL","New Zealand":"NZ","Nigeria":"NG","Norway":"NO","Pakistan":"PK","Panama":"PA","Peru":"PE","Philippines":"PH","Poland":"PL","Russia":"RU","Saudi Arabia":"SA","Serbia":"RS","Singapore":"SG","South Africa":"ZA","South Korea":"KR","Spain":"ES","Sweden":"SE","Switzerland":"CH","Taiwan":"TW","Thailand":"TH","Turkey":"TR","United Arab Emirates":"AE","Venezuela":"VE","Portugal":"PT","Luxembourg":"LU","Bulgaria":"BG","Czech Republic":"CZ","Slovenia":"SI","Iceland":"IS","Slovakia":"SK","Lithuania":"LT","Trinidad and Tobago":"TT","Bangladesh":"BD","Sri Lanka":"LK","Kenya":"KE","Hungary":"HU","Morocco":"MA","Cyprus":"CY","Jamaica":"JM","Ecuador":"EC","Romania":"RO","Bolivia":"BO","Guatemala":"GT","Costa Rica":"CR","Qatar":"QA","El Salvador":"SV","Honduras":"HN","Nicaragua":"NI","Paraguay":"PY","Uruguay":"UY","Puerto Rico":"PR","Bosnia and Herzegovina":"BA","Palestine":"PS","Tunisia":"TN","Bahrain":"BH","Vietnam":"VN","Ghana":"GH","Mauritius":"MU","Ukraine":"UA","Malta":"MT","The Bahamas":"BS","Maldives":"MV","Oman":"OM","Macedonia":"MK","Latvia":"LV","Estonia":"EE","Iraq":"IQ","Algeria":"DZ","Albania":"AL","Nepal":"NP","Macau":"MO","Montenegro":"ME","Senegal":"SN","Georgia":"GE","Brunei":"BN","Uganda":"UG","Guadeloupe":"GP","Barbados":"BB","Azerbaijan":"AZ","Tanzania":"TZ","Libya":"LY","Martinique":"MQ","Cameroon":"CM","Botswana":"BW","Ethiopia":"ET","Kazakhstan":"KZ","Namibia":"NA","Madagascar":"MG","New Caledonia":"NC","Moldova":"MD","Fiji":"FJ","Belarus":"BY","Jersey":"JE","Guam":"GU","Yemen":"YE","Zambia":"ZM","Isle Of Man":"IM","Haiti":"HT","Cambodia":"KH","Aruba":"AW","French Polynesia":"PF","Afghanistan":"AF","Bermuda":"BM","Guyana":"GY","Armenia":"AM","Malawi":"MW","Antigua":"AG","Rwanda":"RW","Guernsey":"GG","The Gambia":"GM","Faroe Islands":"FO","St. Lucia":"LC","Cayman Islands":"KY","Benin":"BJ","Andorra":"AD","Grenada":"GD","US Virgin Islands":"VI","Belize":"BZ","Saint Vincent and the Grenadines":"VC","Mongolia":"MN","Mozambique":"MZ","Mali":"ML","Angola":"AO","French Guiana":"GF","Uzbekistan":"UZ","Djibouti":"DJ","Burkina Faso":"BF","Monaco":"MC","Togo":"TG","Greenland":"GL","Gabon":"GA","Gibraltar":"GI","Democratic Republic of the Congo":"CD","Kyrgyzstan":"KG","Papua New Guinea":"PG","Bhutan":"BT","Saint Kitts and Nevis":"KN","Swaziland":"SZ","Lesotho":"LS","Laos":"LA","Liechtenstein":"LI","Northern Mariana Islands":"MP","Suriname":"SR","Seychelles":"SC","British Virgin Islands":"VG","Turks and Caicos Islands":"TC","Dominica":"DM","Mauritania":"MR","Aland Islands":"AX","San Marino":"SM","Sierra Leone":"SL","Niger":"NE","Republic of the Congo":"CG","Anguilla":"AI","Mayotte":"YT","Cape Verde":"CV","Guinea":"GN","Turkmenistan":"TM","Burundi":"BI","Tajikistan":"TJ","Vanuatu":"VU","Solomon Islands":"SB","Eritrea":"ER","Samoa":"WS","American Samoa":"AS","Falkland Islands":"FK","Equatorial Guinea":"GQ","Tonga":"TO","Comoros":"KM","Palau":"PW","Federated States of Micronesia":"FM","Central African Republic":"CF","Somalia":"SO","Marshall Islands":"MH","Vatican City":"VA","Chad":"TD","Kiribati":"KI","Sao Tome and Principe":"ST","Tuvalu":"TV","Nauru":"NR","RÃ©union":"RE"};
	var countryNames = _.invert(countries);

    return {
		getFullName: function(abbr)
		{
		  return countryNames[abbr];
		}
    };
})

.service('DateNow', function() {
	var serverOffset = 0;
	firebase.database().ref('.info/serverTimeOffset').on('value', function(snap)
	{
		serverOffset = snap.val();
	});

	return function()
	{
		return Date.now() + serverOffset;
	}
})

.service('UserConfig', function() {

	var getUserConfig = function()
	{
		try {
			return JSON.parse(window.localStorage.userConfig);
		} catch (e) {
			return {};
		}
	};

	return {
		setChartConfig: function(instrument, type, ta)
		{
			var userConfig = getUserConfig();

			if(type)
			{
				_.set(userConfig, ["charts", instrument, "type"], type);
			}

			if(typeof ta != "undefined")
			{
				_.set(userConfig, ["charts", instrument, "analysisTool"], ta);
			}

			window.localStorage.userConfig = JSON.stringify(userConfig);
		},

		getChartConfig: function(instrument)
		{
			return _.get(getUserConfig(), ["charts", instrument]);
		}
	}
})

;
