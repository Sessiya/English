window.appConfig = window.appConfig || {};

angular.module('starter.trade')

.constant('CANDLESTICK_COUNT', Math.floor((window.appConfig.candlestickCount || window.candleStickCount || 40) / 375 * document.body.offsetWidth))

.directive('chartPeriods', function($rootScope, $compile)
{
	return {
		restrict: "E",
		replace: true,
		scope: {chart: '='},

		link: function(scope, element, attrs)
		{
			var el = null;

			scope.$watch('chart', function()
			{
				if (scope.chart)
				{
					scope.chart.periodScope = scope;

					var notifier = 'periodNotifier_' + attrs.symbol;

					var tpl = '<div class="chartPeriods"> \
								<div class="chartPeriodSelect"><span ng-repeat="(i, cp) in :' + notifier + ':chart.periods" ng-class=":' + notifier + ':{\'current\': chart.period == i}" ng-click="chart.activate(); chart.setPeriod(i, true)"><div ng-bind-html="::cp.label"></div></span></div> \
						   </div>';

					el = $compile(tpl)(scope);
					element.append(el);

					$rootScope.$broadcast('$$rebind::' + notifier);
				}
			});
		}
	};
})

.directive('chartCanvas', function()
{
	return {
		restrict: "E",
		link: function(scope, element, attrs)
		{
			if (window.chartCanvasElement) {
				var p = element[0].parentNode;
				p.removeChild(element[0]);
				p.appendChild(window.chartCanvasElement);
				return;
			}

			window.chartCanvasElement = element[0];

			var chartInstance = null;

			window.initChart = function()
			{
				if (!window.chart)
				{
					chartInstance = new CanvasJS.Chart(element[0], window.chartOpts);
					window.chart = chartInstance;
				}
			}

			if (window.chartOpts)
			{
				window.initChart();
			}
		}
	}
})

.directive('chart', function($rootScope, ChartPeriods, ChartData, CandleData, SymbolData, CANDLESTICK_COUNT, OnlineStatus, MarketStatus, ChartHelper, Mongo, UserConfig, LoaderOverlay, $http, ChartRef, Trading)
{
	if (!window.chartCount)
	{
		window.chartCount = 0;
	}

	var defaultPeriod = window.localStorage.defaultLineChartPeriod || 0;
	var defaultStylesPeriod = window.localStorage.defaultStylesChartPeriod || 0;

	return {
		restrict: "E",
		scope: {symbol: '@', active: '@', transform: '=', markercallback: '=', rendercallback: '=', transformperiod: '=', config: '=', hidePeriods: '='},
		template:   window.appConfig.chartTemplate || '<div class="chart-container"> \
					<div class="chart-touchControl" ng-dblclick="reset()" ios-dblclick="reset()" style="width: 100%; height: 100%; position: absolute; z-index: 1; overflow: hidden;"></div> \
					<div class="chart-inner-container" style="width: 100%"></div> \
					<div class="chart-menu-container"> \
						<chart-periods chart="self" symbol="{{ ::symbol }}"></chart-periods> \
						<div class="chartTypeSwitch" ng-click="showChartOptionsMenu()"> \
							<div class="chartOptionsMenu" click-outside="hideChartOptionsMenu()" outside-if-not="chartTypeSwitch"> \
								<div class="chartMenuClose" ng-click="hideChartOptionsMenu($event)"> \
									<div></div> \
								</div> \
								<div class="chartTAOptions"> \
									<div class="chart-ta-avg" ng-click="setTechAnalysis(\'simpleMovingAverage\')"></div>' +
									'<div class="chart-ta-vol" ng-click="setTechAnalysis(\'volume\')"></div>' +
									'<div class="chart-ta-sr" ng-click="0 && setTechAnalysis(\'supportResistance\')"></div>' +
								'</div> \
								<div class="chartTypeOptions"> \
									<div class="chart-type-line" ng-click="setTypeLine()"></div> \
									<div class="chart-type-candle" ng-click="setTypeCandleStick()"></div> \
								</div> \
							</div> \
						</div> \
					</div> \
					<div class="chartPeriodMinus" style="display: none" ng-click="zoomOutOnce()"><span class="chart-minus">-</span></div> \
					<div class="chartPeriodPlus" style="display: none" ng-click="zoomInOnce()"><span class="chart-plus">+</span></div> \
					</div>',
		replace: true,
		link: function(scope, element, attrs)
		{
			if ('HISTORY' == attrs.symbol)
			{
				return;
			}

			var candleCount = function() {
				return parseInt(window.localStorage.getItem('visibleCandleCount')) || chart.visibleCandleCount || CANDLESTICK_COUNT;
			}

			scope.candleCount = candleCount;

			// var userConfig = UserConfig.getChartConfig(attrs.symbol);
			var defaultConfig = UserConfig.getChartConfig('default');

			scope.type = _.get(defaultConfig, ['type'], 'line');
			scope.techAnalysis = _.get(defaultConfig, ['analysisTool'], null);

			if (typeof scope.techAnalysis !== 'object' || scope.techAnalysis === null) {
				scope.techAnalysis = {};
			}

			// change chart type switch icon and the icons in dropdown if chart initiated with candlesticks or moving average active
			element.addClass(scope.type);

			_.each(Object.keys(scope.techAnalysis), function(ta) {
				element.addClass(ta);
			});

			scope.customPeriods = ChartPeriods.getVisiblePeriods();
			scope.customPeriodsArray = ChartPeriods.getVisiblePeriodsArray();
			if(scope.customPeriods.length > 1)
			{
				scope.multipleTimeframes = true;
			}
			else
			{
				scope.multipleTimeframes = false;
			}

			scope.updateVisiblePeriods = function()
			{
				scope.customPeriods = ChartPeriods.getVisiblePeriods();
				scope.customPeriodsArray = ChartPeriods.getVisiblePeriodsArray();
				if(scope.customPeriods.length > 1)
				{
					scope.multipleTimeframes = true;
				}
				else
				{
					scope.multipleTimeframes = false;
				}

				$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
			}

			scope.isMultipleTimeframesVisible = function()
			{
				return scope.multipleTimeframes;
			}

			scope.periodSelection = function(i)
			{
				if(i == undefined || !scope.multipleTimeframes)
				{
					$rootScope.toggleTimeFrames();
					scope.timeFramesVisible = $rootScope.getTimeFramesState();
					$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
				}
				else
				{
					if(i >= 0 && i != null)
					{
						scope.setPeriod(scope.customPeriodsArray[i], true);
						if(ChartPeriods.getVisiblePeriods() && ChartPeriods.getVisiblePeriods()[0] && ChartPeriods.getVisiblePeriods()[0].label)
						{
							$rootScope.trackEvent("Timeframes", "Selected_" + ChartPeriods.getVisiblePeriods()[i].label);
						}
					}
				}
			}

			scope.hidePeriodSelection = function()
			{
				scope.timeFramesVisible = false;
			}

			scope.showChartToolsOptions = function()
			{
				$rootScope.toggleChartTools();
			}

			scope.toggleChartCompare = function()
			{
				window.labelCache['y'] = {};

				$rootScope.toggleTA(2);

				if (scope.techAnalysis['compare']) {
					$rootScope.toggleAssetSelector(true);
				}
			}

			scope.self = scope;

			window.lastSymbol = attrs.symbol;

			scope.candleSupport = CandleData.supports(attrs.symbol);

			CandleData.setFastUpdate(attrs.symbol);

			if (window.marketStatusData && window.marketStatusData[attrs.symbol])
			{
				var isOpen = MarketStatus.isOpen(attrs.symbol);
			}

			CandleData.init(attrs.symbol, null, null, scope.period);

			var eventListeners = [];

			scope.dynamicUpdated = 0;
			var isDelayed = SymbolData.getDelay(attrs.symbol);

			var frameTime = Date.now();
			var frameCount = 0;
			var renderInterval = 10;

			var lastRenderedPoint = null;
			var stuckTime = 0;

			var isActivated = false;

			scope.active = "true";

			var updateCnt = 0;

			var initDynamicUpdate = function()
			{
				if (Date.now() - scope.dynamicUpdated < 100)
				{
					// console.error(attrs.symbol, ' is already active');
					return;
				}

				CandleData.setFastUpdate(attrs.symbol);
				CandleData.init(attrs.symbol, null, null, scope.period);

				if (scope.isEnd && !Mongo.getPosition(attrs.symbol))
				{
					if(scope.multipleTimeframes)
					{
						scope.setPeriod(defaultStylesPeriod);
					}
					else
					{
						scope.setPeriod(scope.period);
					}
				}

				isDelayed = SymbolData.getDelay(attrs.symbol);
				if (isDelayed)
				{
					var processDynUpdate = function()
					{
						if (!OnlineStatus.is() || window.isPaused || !isActivated)
						{
							isActivated = false;
							console.log('not rendering', attrs.symbol);

							return;
						}

						if ($http.isLoading('candle-charts/' + attrs.symbol)) {
							window.chartDynUpdate = window.setTimeout(processDynUpdate, renderInterval);
							return;
						}

						if (scope.active == "true")
						{
							if (!CandleData.hasData(attrs.symbol, scope.period))
							{
								CandleData.loadAll(attrs.symbol, null, scope.period);
							}

							if (!CandleData.isDataLoaded(attrs.symbol))
							{
								window.chartDynUpdate = window.setTimeout(processDynUpdate, renderInterval);
								return;
							}

							window.clearTimeout(window.chartDynUpdate);

							updateCnt++;

							if (!chart)
							{
								// console.log('no chart available', attrs.symbol);
								return;
							}

							scope.dynamicUpdated = Date.now();

							avoidLabelFlicker();

							dataUpdate(true);

							var points = _.get(chartData, [0, 'dataPoints']);
							// var secondArray = _.get(chartData, [1, 'dataPoints']);

							// if(points)
							// {
							// 	console.log(points[points.length - 1]);
							// }
							// if(_.get(chartData, [1, 'dataPoints']))
							// {
							// 	console.log(secondArray[secondArray.length - 1]);
							// }
							var previousPoint = lastRenderedPoint;
							lastRenderedPoint = points ? points[points.length - 1].x + points[points.length - 1].y : lastRenderedPoint;

							var isTurbo = false;
							if (points && points[points.length - 1])
							{
								var lp = points[points.length - 1];
								var change = Math.abs((lp.pointChange / (chart.options.axisY2.maximum - chart.options.axisY2.minimum)) * 100);
								if (change > 1.5)
								{
									isTurbo = true;
								}
							}

							if (isTurbo || isNewCandleAdded)
							{
								renderInterval = 35;
							}
							else
							{
								renderInterval = 110;
							}

							frameCount++;
							if ((Date.now() - frameTime > 1000))
							{
								//~ console.log(frameCount + ' frames, ' + renderInterval + ' interval');


								//~ if (frameCount > 25)
								//~ {
									//~ renderInterval = Math.ceil(renderInterval * 1.5);
								//~ }
								//~ else if (frameCount < 15)
								//~ {
									//~ renderInterval = Math.ceil(renderInterval / 1.5);
								//~ }

								//~ renderInterval = Math.max(prevTouches ? 25 : 150, renderInterval);
								//~ renderInterval = Math.min(500, renderInterval);

								//~ console.log(frameCount);

								frameTime = Date.now();
								frameCount = 0;
							}

							// remove - still needed?
							/*
							if (scope.isEnd && MarketStatus.isOpen(attrs.symbol))
							{
								if (!stuckTime)
								{
									stuckTime = Date.now();
								}

								if (JSON.stringify(lastRenderedPoint) == JSON.stringify(previousPoint))
								{
									var stuckDuration = ((Date.now() - stuckTime) / 1000);

									if (stuckDuration > 5)
									{
										scope.activate();
									}

									if (stuckDuration > 30)
									{
										stuckTime = Date.now();
										console.log('stuck duration ', stuckDuration, attrs.symbol, scope.type, scope.period);

										ChartData.resetAll();
										CandleData.resetAll();
										CandleData.load(attrs.symbol);
									}
								}
								else
								{
									stuckTime = Date.now();
								}
							}
							else
							{
								stuckTime = Date.now();
							}
							*/


							if (!(updateCnt % 100))
							{
								resetLabels('x');
							}

							//~ console.log(renderInterval);

							window.chartDynUpdate = window.setTimeout(processDynUpdate, renderInterval);
							isActivated = true;
						}
						else
						{
							isActivated = false;
						}
					};

					processDynUpdate();
				}
				else
				{
					console.log('Not delayed', attrs.symbol);
				}

				if (scope.rendercallback)
				{
					scope.rendercallback(scope, true);
				}
			};

			scope.isActive = function()
			{
				var isActive = (Date.now() - scope.dynamicUpdated < 500) && (scope.active == "true");

				if (!isActive) {
					// console.error('isActive', attrs.symbol, isActive, Date.now() - scope.dynamicUpdated);
				}

				return isActive;
			};

			scope.activate = function()
			{
				console.error('activating');
				if (!scope.active && (scope.active != "true")) {
					stuckTime = 0;
				}

				var defaultConfig = UserConfig.getChartConfig('default');
				scope.techAnalysis = _.get(defaultConfig, ['analysisTool'], null);

				if (typeof scope.techAnalysis !== 'object' || scope.techAnalysis === null) {
					scope.techAnalysis = {};
				}

				resetLabels('x');
				resetLabels('y');

				window.CanvasJS.Chart.prototype._candle_spacing = 0;
				window.CanvasJS.Chart.prototype._label_pos = 0;
				window.CanvasJS.Chart.prototype._maxBarWidth = null;

				if (!window.chart)
				{
					window.initChart();
					chart = window.chart;
				}

				// chart.options.data = null;
				chart.scope = scope;

				CandleData.setFastUpdate(attrs.symbol);

				isActivated = true;
				scope.active = "true";

				// avoidLabelFlicker();
				// dataUpdate(true);

				initDynamicUpdate();

				window.chart.clearTextCache();
			};

			scope.deactivate = function()
			{
				scope.active = "false";
				scope.dynamicUpdated = 0;
				isActivated = false;
				window.clearTimeout(window.chartDynUpdate);

				resetChartBoundary();

				var c = window.chart;
				c.ctx.clearRect(0, 0, c.canvas.width, c.canvas.height);

				if(scope.timeFramesVisible)
				{
					scope.timeFramesVisible = false;
				}
			};

			scope.chartRendering = true;

			var chartID = 'chart-' + (++window.chartCount);

			var touchControl = element[0].querySelector('.chart-touchControl');

			scope.isEnd = true;

			var chartData = [];

			var max = null;

			var maxPadding = 2;
			var padding = maxPadding;

			scope.getChart = function()
			{
				return chart;
			}

			scope.gettouchControl = function()
			{
				return touchControl;
			}

			var getMax = function()
			{
				return max + padding;
			};

			var setMax = function(m)
			{
				var lastX = parseInt(CandleData.getMaxX(attrs.symbol, scope.period));
				if (m > lastX) { console.error('max', m - lastX); }
				max = Math.min(m, lastX);
			};

			var getMin = function()
			{
				return getMax() - candleCount();
			};

			var months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

			var padZero = function(str)
			{
				return ('0' + str.toString()).substr(-2);
			};

			var getLabel = function(date, intv, nextDate)
			{
				var type = CandleData.getLabelType(date, intv);

				if (nextDate) {
					var dateBreak = '';

					if (('min' == type || 'dayhr' == type) && (nextDate.getDate() != date.getDate())) {
						dateBreak = padZero(nextDate.getDate());
						type = 'day';
					}

					if ('day' == type && (nextDate.getMonth() != date.getMonth())) {
						dateBreak = months[nextDate.getMonth() + 1];
						type = 'dayyr';
					}

					if ((nextDate.getYear() != date.getYear()) && ('year' != type)) {
						dateBreak = nextDate.getFullYear();
					}

					if (dateBreak) {
						return '::   ' + dateBreak;
					}
				}

				if ('min' == type)
				{
					return padZero(date.getHours()) + ':' + padZero(date.getMinutes());
				}
				else if ('day' == type)
				{
					return padZero(date.getDate());
				}
				else if ('dayhr' == type)
				{
					return padZero(date.getHours()) + ':' + padZero(date.getMinutes());
				}
				else if ('dayyr' == type)
				{
					return padZero(date.getDate());
				}
				else if ('month' == type)
				{
					var month = months[date.getMonth() + 1];
					return month;
				}
				else if ('year' == type)
				{
					return date.getFullYear();
				}
				else return '';
			};

			var dragStart = 0;
			var minDragDistance = 0;

			var firstTouchX = 0;
			var firstTouchTime = 0;
			var lastTouchX = 0;
			var lastTouchTime = 0;
			var touchStarted = false;
			var lastTouchEnded = 0;

			var momentumIterations = [];
			var momentumTimeout = null;
			var cancelMomentum = function(reason) {
				momentumIterations = [];
				window.clearTimeout(momentumTimeout);
			}

			var cleanupTouch = function() {
				touchStarted = false;
				lastTouchEnded = Date.now();
				firstTouchX = 0;
				firstTouchTime = 0;
				lastTouchX = 0;
				lastTouchTime = 0;
				dragStart = 0;
				touchStarted = false;
			}

			var lastTouchEvent = null;

			var touchstart = function(e)
			{
				if (scope.active != "true") {
					return;
				}

				if (touchStarted || (Date.now() - lastTouchEnded < 100)) {
					return;
				}

				lastTouchEvent = e;

				touchStarted = true;

				cancelMomentum('touchstart');

				// just stop the boundaryMovementProcess on new touch without reseting
				boundaryRestoreSteps = null;

				if (!e.touches)
				{
					e.touches = [{clientX: e.x, clientY: e.y}];
				}

				dragStart = e.touches[0].clientX;
				firstTouchX = dragStart;
				firstTouchTime = Date.now();
				lastTouchTime = Date.now();
			};

			var touchend = function(e)
			{
				if (scope.active != "true") {
					return;
				}

				if (e.target.className.indexOf('chartTypeSwitch') > -1) {
					return;
				}

				lastTouchEvent = e;

				resetDragStart(lastTouchX);

				var dragDistance = firstTouchX - lastTouchX;

				// reset chart boundary in cases when user clicks on chart type switch
				if(e.touches && e.touches.length)
				{
					resetChartBoundary();
				}

				if (!touchStarted || !lastTouchX || !dragDistance || !firstTouchTime ||
					// momentum may be glitching when dragging the ALL/5Y view in line charts - most likely because almost the whole chart range is already visible anyway
					((7 == scope.period))) {
						cancelMomentum('touchend');

					// call initBoundaryRestore when chart drag movement is stopped without releasing touch from screen.
					// touchend gets called on time frame changes for some reason and it returns event.touches coordinates
					// if event touches has no length, then it was a drag movement, not a 'click' once which happens on just touching the screen.
					if(e.touches && !e.touches.length)
					{
						if(!e.touches.length)
						{
							initBoundaryRestore();
						}
					}

					return cleanupTouch();
				}

				touchStarted = false;
				lastTouchEnded = Date.now();

				var dragTime = Date.now() - firstTouchTime;
				var dragSpeed = dragDistance / dragTime;

				// number of rendered frames for the continued drag momentum
				var momentumIterationsCnt = 50;

				// ms interval between renders
				var momentumIterationsIntv = 4;

				// kind of an arbitrary coeficient to calculate the total momentum size based on screen width
				// the actual momentum movement will depend on the user interaction (drag speed and length)
				var momentumScreenSize = 0.15;

				var totalMomentumDistance = dragSpeed * touchControlWidth() * momentumScreenSize;
				var avgIterationDistance = totalMomentumDistance / momentumIterationsCnt;

				cancelMomentum('starting new');

				if (dragDistance) {
					for (var k = momentumIterationsCnt; k > 0; k--) {
						// again a bit arbitrary coefs to generate exponentially decreasing set of numbers
						// to make the momentum faster at the beginning and make it gradually slow down as it stops
						var dist = Math.round(avgIterationDistance * Math.pow(1.15, k / 2));
						if (dist) {
							momentumIterations.push(dist);
						}
					}
				}

				var processMomentum = function() {
					if (!momentumIterations.length) {
						return;
					}

					var distance = momentumIterations.shift();
					if(scope.isEnd)
					{
						cancelMomentum('end of the chart');
						cleanupTouch();
					}

					if (!momentumIterations.length) {
						cleanupTouch();

						// call initBoundaryRestore when momentum has stopped
						initBoundaryRestore();

						isDelayed = SymbolData.getDelay(attrs.symbol);
						dragStart = 0;
					} else {
						// the interval between renders increases towards the end of the momentum
						// this improves the perception of the drag momentum slowing down
						momentumTimeout = window.setTimeout(processMomentum, momentumIterationsIntv + (momentumIterationsCnt - momentumIterations.length));
						handleDrag(distance, true);
					}
				}

				processMomentum();
			};

			var resetDragStart = function(x) {
				if (lastTouchTime && (Date.now() - lastTouchTime > 80) && (Math.abs(x - lastTouchX) < 2)) {
					firstTouchTime = Date.now();
					firstTouchX = x;
				}
			};

			var touchmove = function(e)
			{
				// most likely a false trigger from changing the chart period
				if (!dragStart) {
					return;
				}

				lastTouchEvent = e;

				window.clearInterval(window.boundaryInterval);
				window.boundaryInterval = null;

				if (!e.touches)
				{
					e.touches = [{clientX: e.x, clientY: e.y}];
				}

				var x = e.touches[0].clientX;
				window.previousX = x;

				if (Math.abs(dragStart - x) < minDragDistance)
				{
					return;
				}

				var dragDist = dragStart - e.touches[0].clientX;
				dragStart = e.touches[0].clientX;

				// detected a move back to drag starting point
				// or the user paused dragging without releasing the finger
				resetDragStart(e.touches[0].clientX);

				lastTouchX = e.touches[0].clientX
				lastTouchTime = Date.now();

				handleDrag(dragDist);
			};

			touchControl.addEventListener('touchstart', touchstart);
			touchControl.addEventListener('mousedown', touchstart);

			touchControl.addEventListener('touchend', touchend);
			touchControl.addEventListener('mouseup', touchend);
			document.body.addEventListener('mouseup', touchend);
			document.body.addEventListener('mouseout', touchend);

			touchControl.addEventListener('touchmove', touchmove);
			touchControl.addEventListener('mousemove', touchmove);

			scope.getTouchStatus = function() {
				return {
					lastTouchEnded, lastTouchEvent
				}
			};

			var touchControlWidth = function() {
				return element[0].clientWidth - 50;
			};

			var avoidLabelFlicker = function() {
				if (chart.vertLines && !scope.isEnd) {
					var l = chart.vertLines;
					var lineDist = Math.abs(l[0] - l[1]);
					var distFromLineBorder = lineDist % l[2];

					if (distFromLineBorder < 10) {
						dataUpdate(true);
					}
				}
			}

			var handleDrag = function(drag, isMomentum)
			{
				if (isNewCandleAdded || scope.preventDrag || (!isMomentum && momentumIterations.length))
				{
					return;
				}

				resetLabels('x');
				resetLabels('y');

				var dataDistance = getMax() - getMin();

				var pctMove = drag / (touchControlWidth());
				var xMove = dataDistance * pctMove;

				var to = getMax() - padding;
				var lastX = CandleData.getMaxX(attrs.symbol, scope.period);

				if (xMove < 0) {
					padding += xMove;

					if (padding < 0) {
						to += padding;
						padding = 0;
					} else if (padding > maxPadding) {
						var diff = padding - maxPadding;
						padding = maxPadding;
						to += diff;
					}
				} else {
					to += xMove;

					if (to > lastX) {
						var diff = to - lastX;
						to = lastX;
						padding += diff;

						padding = Math.min(padding, maxPadding);
					}
				}

				to = Math.min(to, lastX);

				var firstX = CandleData.getFirstX(attrs.symbol, scope.period);
				to = Math.max(firstX + candleCount(), to);

				setMax(to);

				scope.setEnd(padding == maxPadding);

				avoidLabelFlicker();

				dataUpdate(true);
			}

			scope.handleDrag = handleDrag;

			var chartData = [];

			angular.element(element[0].querySelector('.chart-inner-container')).attr('id', chartID);

			window.labelCache = {x: {}, y: {}, ySrc: {}};
			var resetLabels = function(type)
			{
				window.labelCache[type] = {};
			};

			scope.getLabelCache = function(type)
			{
				return labelCache[type];
			};

			window.chartOpts = {
				theme: 'theme1',
				toolTip: {enabled: false},
				zoomEnabled: false,
				connectNullData: true,
				xLabelCnt: 4,
				axisY2: {
					labelFontSize: window.appConfig.chartFontSize || 12,
					includeZero: false,
					tickThickness: 0,
					lineThickness: 0,
					gridThickness: 0,
					labelFontFamily: window.appConfig.chartFontFamily || "BebasRegular",
					labelFontColor: window.appConfig.chartFontColor || "#c7c6c0",
					labelWrap: false,
					labelMaxWidth: 250,
					labelAutoFit: false,
					margin: 10,
					labelFormatterCallback: function(label, e) {

						var sc = (e.chart && e.chart.scope) ? e.chart.scope : scope;
						var cd = sc.getData();

						if (cd.length > 1 && sc.techAnalysis['compare']) {
							for (var k = 0; k < cd.length; k++) {
								if (cd[k].yLabelFormatter) {
									return cd[k].yLabelFormatter(label, e);
								}
							}
						}

						if (e.value >= 10000)
						{
							label = $rootScope.formatRate(Math.floor(parseFloat(label))).slice(0, -3);
						}
						else if (e.value >= 1000)
						{
							label = $rootScope.formatRate(parseFloat(label));
						}
						else
						{
							label = label.toString().substr(0, 7);
						}

						return label;
					},
					labelFormatter: function(e, cnt)
					{
						if (!window.labelCache.y[e.idx])
						{
							var value = window.chart.options.axisY2.minimum + (((window.chart.options.axisY2.maximum - window.chart.options.axisY2.minimum) / (e.cnt - 0.5)) * (e.idx - 1));
							if (value < 0)
							{
								value = 0;
							}

							var label = CanvasJS.formatNumber(parseFloat(value), "0.0000").toString();

							if (this.labelFormatterCallback)
							{
								label = this.labelFormatterCallback(label, e, cnt);
							}

							window.labelCache.y[e.idx] = label;
							window.labelCache.ySrc[e.idx] = e;
						}

						return window.labelCache.y[e.idx];
					}
				},

				axisX: {
					margin: 5,
					labelFontSize: window.appConfig.chartFontSize,
					lineThickness: 0,
					tickThickness: 0,
					labelFontFamily: window.appConfig.chartFontFamily,
					labelFontColor: window.appConfig.chartFontColor,
					labelCornerRadius: 1,
					labelFormatter: function(e)	{
						var chart = e.chart;
						var xAxis = chart.axisX[0];

						if(!xAxis)
						{
							window.location.reload();
						}

						if (e.idx > 3) {
							return 'AAA';
						}

						// sliding labels on X axis
						if (window.appConfig.xLabelPositionTransform && window.xLabelPositionCache) {
							var skope = chart.scope;

							var isCacheValid = true;
							var conf = window.xLabelPositionCache.config;

							var keyRoot = conf.keyRoot;

							var gridIdx = conf.idxMap[e.idx];

							if (!window.xLabelCache) {
								window.xLabelCache = {};
							}

							var key = keyRoot + (gridIdx).toString();
							var next = keyRoot + (gridIdx + 1).toString();

							if (!window.xLabelCache[key])
							{
								var getDateByX = function(targetX) {
									return ChartData.getDate(CandleData.getClosestTimeByX(skope.currency, skope.period, targetX));
								}

								var date = getDateByX(window.xLabelPositionCache[key]);

								if (window.xLabelCache[next]) {
									var nextDate = window.xLabelCache[next].date;
								} else {
									var nextX = window.xLabelPositionCache[next];
									var nextDate = nextX ? getDateByX(nextX) : new Date(Date.now() + 1);
									isCacheValid = false;
								}

								var ret = {date: date, hasNext: !!window.xLabelCache[next], label: getLabel(date, skope.period, nextDate)};

								if (isNewCandleAdded) {
									isCacheValid = false;
								}

								if (!isCacheValid && ((3 == e.idx) || isNewCandleAdded)) {
									// console.error('invalid cache!', key, e.idx)
									return ret.label;
								}

								window.xLabelCache[key] = ret;

								// window.xLabelCache[key].label = (gridIdx > 0 ? '' : 'T') + Math.abs(gridIdx).toString();
								// window.xLabelCache[key].label = (conf.gridPos % 100).toString();
								// window.xLabelCache[key].label = (window.xLabelPositionCache[key] % 100).toString();
							}

							return window.xLabelCache[key].label;
						} else {
							return '';
						}
					}
				},

				axisYType: "secondary",
				data: chartData,
				creditHref: '',
				creditText: '',
				backgroundColor: "#fff"
			};

			if (scope.config)
			{
				var conf = JSON.parse(JSON.stringify(scope.config));

				if (conf.axisX)
				{
					window.chartOpts.axisX = _.extend(chartOpts.axisX, conf.axisX);
					delete conf.axisX;
				}

				if (conf.axisX2)
				{
					window.chartOpts.axisX2 = _.extend(chartOpts.axisX, conf.axisX2);
					delete conf.axisX2;
				}

				if (conf.axisY)
				{
					window.chartOpts.axisY = _.extend(chartOpts.axisY, conf.axisY);
					delete conf.axisY;
				}

				if (conf.axisY2)
				{
					window.chartOpts.axisY2 = _.extend(chartOpts.axisY2, conf.axisY2);
					delete conf.axisY2;
				}

				window.chartOpts = _.extend(window.chartOpts, conf);
			}

			window.initChart();

			var chart = window.chart;

			var getYBoundary = function(data)
			{
				var min = null, max = null;

				var to = Math.ceil(getMax());
				var from = Math.ceil(getMin());

				// console.log(to - from, from, to, data)

				for (var s = 0; s < data.length; s++)
				{
					if (!data || !data[s])
					{
						// console.log('no data', s, data.length);
						break;
					}

					if (data[s].pctValues) {
						continue;
					}

					var dataset = data[s].dataPoints;

					if (!dataset)
					{
						break;
					}

					for (var k = 0; k < dataset.length; k++)
					{
						if ((dataset[k].x < from) || (dataset[k].x > to))
						{
							continue;
						}

						var y = dataset[k].candle || dataset[k].y;
						if (_.isArray(y))
						{
							var minY = _.min(y);
							var maxY = _.max(y);
						}
						else
						{
							var minY = y;
							var maxY = y;
						}

						if ((min === null) || min > minY)
						{
							min = minY;
						}

						if ((max === null) || max < maxY)
						{
							max = maxY;
						}
					}
				}

				for (var s = 0; s < data.length; s++)
				{
					var bp = data[s].chartBottomPadding;
					if (bp) {
						var diff = max - min;
						min = min - (diff * (bp / 100));
					}
				}

				return [min, max];
			};

			var getChartBoundary = function(range)
			{
				var marginSize = 0.04;

				var from = range[0];
				var to = range[1];

				var diff = to - from;
				var margin = diff * marginSize;

				// leave extra space on top for tooltip
				return [from - (margin / 3), to + margin];
			};

			scope.hasMomentum = function() {
				return momentumIterations.length > 0;
			};

			scope.zoomOutOnce = function()
			{
				var scope = window.chart.scope;
				var currentPeriod = parseInt(scope.period);
				var maxPeriods = ChartPeriods.get(scope.type).length;
				if (currentPeriod + 1 >= maxPeriods)
				{
					return;
				}

				scope.setPeriod((currentPeriod + 1).toString());
			};

			scope.zoomInOnce = function()
			{
				var currentPeriod = scope.period;
				if(currentPeriod <= 0)
				{
					return;
				}

				scope.setPeriod(currentPeriod - 1);
			};

			scope.setPeriod = function(period, changeDefault)
			{
				if (undefined === period) {
					return;
				}

				window.CanvasJS.Chart.prototype._candle_spacing = 0;

				if (resetChartBoundary) {
					resetChartBoundary();
				}

				stuckTime = 0;

				resetLabels('y');
				resetLabels('x');

				window.xLabelCache = {};
				window.xLabelPositionCache = null;

				window.CanvasJS.Chart.prototype._candle_spacing = null;
				window.CanvasJS.Chart.prototype._maxBarWidth = null;
				window.CanvasJS.Chart.prototype._label_pos = 0;

				if (!Mongo.getPosition(attrs.symbol)) {
					period = period === null ? defaultPeriod : period;
				}

				if (changeDefault) {
					if(scope.multipleTimeframes)
					{
						window.localStorage.defaultStylesChartPeriod = period;
						defaultStylesPeriod = period;
					}
					else
					{
						window.localStorage.defaultLineChartPeriod = period;
						defaultPeriod = period;
					}
				}

				startTime = 0;
				lastCandleTime = 0;

				scope.period = period;

				var waitFunc = function()
				{
					if (!CandleData.hasData(attrs.symbol, scope.period) || (null === scope.period))
					{
						return;
					}

					window.clearInterval(window.waitForPeriodData);

					var to = CandleData.getMaxX(attrs.symbol, scope.period);

					// checking if last period must be removed
					var periodLast = scope.periods.length - 1;
					var pLast = scope.periods[periodLast];
					var periodStartXLast = CandleData.getPeriodStartX(attrs.symbol, pLast, periodLast);
					var firstXLast = CandleData.getFirstX(attrs.symbol, periodLast);
					var fromLast = Math.max(firstXLast, periodStartXLast);
					var toLast = CandleData.getLastX(attrs.symbol, periodLast);

					if (toLast - fromLast < candleCount())
					{
						if (!window.removeLastPeriod)
						{
							window.removeLastPeriod = {};
						}

						window.removeLastPeriod[attrs.symbol] = true;

						scope.periods = ChartPeriods.get(scope.type);

						window.setTimeout(function()
						{
							// remove last period from data if not enough data
							if (window.removeLastPeriod[attrs.symbol])
							{
								scope.periods.splice(10, 1);
								$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
							}
						}, 1);
					}

					setMax(to);

					scope.setEnd(true);

					if (!isDelayed && dataUpdate)
					{
						avoidLabelFlicker();

						dataUpdate(true);
					}

					return true;
				};

				if (!waitFunc())
				{
					window.clearInterval(window.waitForPeriodData);
					window.waitForPeriodData = window.setInterval(waitFunc, 200);
				}

				scope.periods = ChartPeriods.get(scope.type);
				$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
			};

			scope.periods = ChartPeriods.get(scope.type);

			var pos = Mongo.getPosition(attrs.symbol);

			if (!pos) {
				scope.period = !isOpen ? defaultPeriod : 0;
			}

			if (pos || !isOpen)
			{
				window.clearInterval(window.waitForData);
				window.waitForData = null;

				if (!CandleData.hasData(attrs.symbol, scope.period))
				{
					CandleData.loadAll(attrs.symbol, null, scope.period);
				}
			}
			else
			{
				if($scope.multipleTimeframes)
				{
					scope.setPeriod(defaultStylesPeriod);
				}
				else
				{
					scope.setPeriod(defaultPeriod);
				}
			}

			if (scope.transformperiod)
			{
				scope.period = scope.transformperiod(scope.period);
			}

			scope.reset = function()
			{
				scope.setPeriod(defaultPeriod);
			};

			scope.toggleChartOptionsMenu = function() {
				if (element.hasClass('chart-opts-visible')) {
					scope.hideChartOptionsMenu();
				} else {
					scope.showChartOptionsMenu();
				}
			};

			scope.showChartOptionsMenu = function() {
				element.addClass('chart-opts-visible');
			};

			scope.hideChartOptionsMenu = function(event) {
				if (event) {
					event.stopPropagation();
				}
				element.removeClass('chart-opts-visible');
			};

			scope.setTechAnalysis = function(ta, stateOrConf) {
				if (ta && !stateOrConf) {
					element.removeClass(ta);
				}

				if (!scope.techAnalysis) {
					scope.techAnalysis = {};
				}

				if (scope.techAnalysis[ta] && !stateOrConf) {
					delete scope.techAnalysis[ta];
					$rootScope.trackEvent('TA', 'Disable_' + ta);
				} else if (ta) {
					scope.techAnalysis[ta] = stateOrConf || true;
					element.addClass(ta);
					if(ta != 'compare')
					{
						$rootScope.trackEvent('TA', 'Enable_' + ta);
					}
				}

				UserConfig.setChartConfig('default', null, scope.techAnalysis);

				$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
			};

			scope.getTAConfig = function(tool) {
				return _.get(scope.techAnalysis, [tool]);
			};

			scope.setTypeLine = function()
			{
				scope.setType('line');

				UserConfig.setChartConfig('default', 'line');
			};

			scope.setTypeCandleStick = function()
			{
				scope.setType('candlestick');

				UserConfig.setChartConfig('default', 'candlestick');
			};

			scope.toggleType = function(event)
			{
				if (event) {
					event.stopPropagation();
				}

				if(scope.type == 'line')
				{
					$rootScope.trackEvent('Chart', 'Candlestick');
					scope.setTypeCandleStick();
				}
				else
				{
					$rootScope.trackEvent('Chart', 'Line');
					scope.setTypeLine();
				}
			}

			scope.setType = function(type)
			{
				chartData = [];

				element.removeClass('candlestick');
				element.removeClass('line');
				scope.type = type;
				element.addClass(scope.type);

				window.setTimeout(function()
				{
					scope.hideChartOptionsMenu();
				}, 1);
			};

			/* revive candlestick charts after app resume */
			scope.candleReset = function()
			{
				scope.setPeriod(scope.period);

				CandleData.init(attrs.symbol, null, null, scope.period);

				$rootScope.$broadcast('$$rebind::periodNotifier_' + attrs.symbol);
			};

			scope.sym = SymbolData.getSymbol(attrs.symbol);
			scope.currency = attrs.symbol;

			var bidAsk = function (value)
			{
				var axisX = chart.options.axisX || chart.options.axisX2;
				return [{x:axisX.viewportMinimum || 0, y: value}, {x: axisX.viewportMaximum || 0, y: value}];
			};

			scope.bidAsk = bidAsk;

			// chart animation to slide smoothly before adding a new candle
			var isNewCandleAdded = false;
			var lastCandleTime = null;
			var newCandleSteps = 10;
			var newCandleProgress = 0;
			var lastAddedCandle = 0;
			var lastAddedCandleTime = 0;

			// track the last known candle from the current period to prevent the chart from changing visual position due to data X value recalculations when a new candle is added
			var lastKnownCandleX = null;

			var getFilteredData = function(isLine)
			{
				if (!getMin())
				{
					return;
				}

				var periodLength = CandleData.getPeriodLength(scope.periods[scope.period], attrs.symbol);

				var max = getMax();
				var min = getMin();

				var extra = 0;
				var data = CandleData.getSpan(attrs.symbol, min - 1, max + 1, scope.period);

				if (!data || !data.length)
				{
					scope.reset();
					scope.reset();
					return;
				}

				// check if a new candle is added
				var last = data ? data[data.length - 1] : 0;
				if (scope.isEnd) {
					lastKnownCandleX = null;

					if (!isNewCandleAdded && (last.x + periodLength > lastAddedCandle))
					{
						if (lastCandleTime && (last.time != lastCandleTime) && (Date.now() - lastAddedCandleTime > 1000))
						{
							newCandleSteps = Math.max(4, frameCount / 2);

							// last candles get lost while adding a new candle for the first time
							data = CandleData.getSpan(attrs.symbol, min, max + extra + extra, scope.period);

							lastAddedCandle = data[data.length - 1].x;

							data.pop();

							if(!data[data.length - 1] || !data[data.length - 1].x)
							{
								return;
							}

							isNewCandleAdded = data;
							lastAddedCandleTime = Date.now();
							newCandleProgress = 0;

							for (var k = 0; k < isNewCandleAdded.length; k++)
							{
								isNewCandleAdded[k].x++;
							}

							chart.gridLineBase = chart.gridLineBase + periodLength - 1;
						}

						lastCandleTime = last.time;
					}
				} else {
					// prevent chart from changing position when a new candle is added and the user has scrolled the visible range backwards
					var currentLastX = CandleData.getLastX(attrs.symbol, scope.period);

					if (lastKnownCandleX && lastKnownCandleX != currentLastX) {
						var diff = currentLastX - lastKnownCandleX;

						setMax(max + diff - 1);

						chart.gridLineBase = chart.gridLineBase + diff - 1;

						lastKnownCandleX = currentLastX;

						dataUpdate(true);

						return;
					}

					lastKnownCandleX = currentLastX;
				}

				lastCandleTime = last.time;

				return data;
			};

			var prevBid = 0;
			var prevAsk = 0;

			var updateLines = function(data)
			{
				if (data.length > 1)
				{
					data = [data[0]];
				}

				if (!scope.sym)
				{
					scope.sym = SymbolData.getSymbol(attrs.symbol);
				}

				var pos = Mongo.getPosition(attrs.symbol);
				if (pos)
				{

				}
				else if (scope.sym && scope.sym.ask)
				{
					if (!data[0].dataPoints)
					{
						return;
					}

					var range = (scope.sym.ask - scope.sym.bid) / 2;

					var last = scope.sym.mid;
					var bid = scope.sym.bid;
					var ask = scope.sym.ask;

					if (last)
					{
						if (_.isArray(last))
						{
							var last = _.filter(last).pop();
						}

						bid = last - range;
						ask = last + range;
					}

					// todo: why does the price jump temporarily when a new candle is added?
					if (isNewCandleAdded && prevBid)
					{
						bid = prevBid;
						ask = prevAsk;
					}
					else
					{
						prevBid = bid;
						prevAsk = ask;
					}
				}

				if(scope.techAnalysis)
				{
					_.each(Object.entries(scope.techAnalysis), function(taTool) {
						var tool = taTool[0];
						var taConf = taTool[1];

						if (CandleData[tool]) {
							var color = {simpleMovingAverage: '#ffa85b', rsi: '#FF46B5', compare: '#7933A4', volume: 'green', bollinger: '#206eff'}[tool];

							var analysisToolData = CandleData[tool](attrs.symbol, getMin(), getMax(), scope.period, data, scope);
							if(!Array.isArray(analysisToolData))
							{
								analysisToolData = [analysisToolData];
							}

							analysisToolData.forEach(function(analysisToolDataPoints)
							{
								if (analysisToolDataPoints) {
									var taData = {
										name: tool.toString(),
										dataPoints: analysisToolDataPoints.data,
										color: color,
										type: analysisToolDataPoints.chartType || "spline",
										markerType: 'none',
										lineDashType: "solid",
										lineThickness: 1,
										axisYType: "secondary",
										indexLabelFontColor: "#ff0000",
										indexLabelPlacement: "inside",
										indexLabelFontFamily: 'BebasRegular', // todo - change to Peppins Semi Bold
										indexLabelFontSize: 16,
										indexLabelYOffset: 32,
										indexLabelXPosition: 2,
										indexLabelWrap: true,
										sideLabel: !window.appConfig.hideTALabels ? analysisToolDataPoints.label : null,
										renderCallback: analysisToolDataPoints.renderCallback,
										pctValues: !!analysisToolDataPoints.pctValues,
										yLabelFormatter: analysisToolDataPoints.yLabelFormatter,
										chartBottomPadding: analysisToolDataPoints.chartBottomPadding,
									};

									// volume
									if ('column' == taData.type)
									{
										taData.lineThickness = 0.01;

										// var color = "#87C98C";
										taData.color = 'rgb(236, 109, 109)';
										taData.fillOpacity = 0.3;
										taData.lineColor = 'transparent';
									}

									if('bollinger' == taData.name && 'rangeSplineArea' == taData.type)
									{
										taData.fillOpacity = analysisToolDataPoints.fillOpacity;
										taData.color = analysisToolDataPoints.color;
										taData.lineColor = analysisToolDataPoints.lineColor;
									}

									data.push(taData);
								}
							});
						}
					});
				}

				return data;
			}

			var lastBoundary = null;

			var boundaryRestoreTimeout = null;
			var boundaryRestoreSteps = null;

			var processBoundaryRestore = function() {
				if (!boundaryRestoreSteps || !boundaryRestoreSteps.length) {
					boundaryRestoreTimeout = null;
					return;
				}

				var step = boundaryRestoreSteps.pop();
				chart.options.axisY2.minimum = step[0];
				chart.options.axisY2.maximum = step[1];

				window.CanvasJS.Chart.prototype._maxBarWidth = window.appConfig.candleWidth;

				scope.renderChart();

				ChartHelper.resetOverlapCheck();

				if (scope.rendercallback)
				{
					scope.rendercallback(scope);
				}

				if (!boundaryRestoreSteps.length) {
					resetLabels('y');
					boundaryRestoreTimeout = null;
				} else {
					window.setTimeout(processBoundaryRestore, 14);
				}
			};

			var setChartBoundary = function(boundary)
			{
				lastBoundary = boundary;
				if (chart.options.axisY2.minimum) {
					chart.options.axisY2.minimum = Math.min(chart.options.axisY2.minimum, boundary[0] || 0);
				} else {
					chart.options.axisY2.minimum = boundary[0];
				}

				if (chart.options.axisY2.maximum) {
					chart.options.axisY2.maximum = Math.max(chart.options.axisY2.maximum, boundary[1] || 0);
				} else {
					chart.options.axisY2.maximum = boundary[1];
				}
			};

			var initBoundaryRestore = function() {
				window.clearTimeout(boundaryRestoreTimeout);
				lastBoundary = null;
				cancelMomentum();

				boundaryRestoreTimeout = window.setTimeout(function() {
					if (!lastBoundary) {
						boundaryRestoreSteps = [];
						boundaryRestoreTimeout = null;
						return;
					}

					var steps = scope.isEnd && scope.techAnalysis['compare'] ? 1 : 12;
					var min = chart.options.axisY2.minimum;
					var max = chart.options.axisY2.maximum;
					var minStep = (lastBoundary[0] - min) / steps;
					var maxStep = (lastBoundary[1] - max) / steps;

					boundaryRestoreSteps = [];
					for (var k = steps; k > 0; k--) {
						boundaryRestoreSteps.push([min + (minStep * k), max + (maxStep * k)]);
					}

					processBoundaryRestore();
				}, 250);
			};

			window.setInterval(function() {
				if (boundaryRestoreTimeout || touchStarted || (boundaryRestoreSteps && boundaryRestoreSteps.length) || (momentumIterations && momentumIterations.length)) {
					return;
				}

				initBoundaryRestore();
			}, 60000);

			var resetChartBoundary = function() {
				lastBoundary = null;
				boundaryRestoreStep = null;
				boundaryRestoreSteps = null;
				chart.options.axisY2.minimum = 0;
				chart.options.axisY2.maximum = 0;

				window.clearTimeout(boundaryRestoreTimeout);
				boundaryRestoreTimeout = null;
			};

			var wasInactive = false;
			var dataUpdate = function(isUpdate)
			{
				// canvas was possibly reinitialized from another instance
				var p = chart.ctx.canvas.parentNode;
				if (!p || !p.parentNode) {
					chart = window.chart;
				}

				if (!chart.ctx.canvas.scrollWidth) {
					console.log('no width', chart.ctx.canvas, chart.ctx.canvas.parentNode.parentNode);
					window.initChart(true);
					chart = window.chart;
					// console.log('new width', chart.ctx.canvas.scrollWidth);
					return;
				}

				var position = Mongo.getPosition(attrs.symbol);

				if (null === scope.period)
				{
					if (!position) {
						console.log('resetting....');
						scope.reset();
					}

					return;
				}

				if (isNaN(getMin()) || isNaN(getMax()))
				{
					// console.log('resetting bc NaN boundaries', getMin(), getMax());
					scope.setEnd(true);
					setMax(0);
					scope.reset();
				}

				if (!CandleData.hasData(attrs.symbol, scope.period))
				{
					CandleData.loadAll(attrs.symbol, null, scope.period);
					return;
				}

				if (!element[0].parentNode || !chart || (scope.period === null))
				{
					console.log('something wrong', attrs.symbol, !element[0].parentNode, !chart, (scope.period === null));
					return;
				}

				if (scope.active == 'false')
				{
					// instant switch to current boundary on re-activation
					chart.options.axisY2.minimum = 0;

					wasInactive = true;
					return;
				}

				var currData = (chart.options.data && chart.options.data[0]) ? chart.options.data[0].dataPoints : null;
				periodLength = candleCount();

				var endWidth = null;

				var max = getMax();
				if (max <= 0 || scope.isEnd)
				{
					max = CandleData.getMaxX(attrs.symbol, scope.period);

					setMax(max);

					scope.setEnd(true);
				}

				if (isUpdate && currData && currData.length && (scope.isEnd || !max || wasInactive))
				{
					endWidth = Math.max(endWidth, candleCount());
				}

				if (CandleData.hasData(attrs.symbol, scope.period))
				{
					var conf = window.appConfig || {};
					var type = scope.type;

					var isLine = scope.type == 'line';
					var isCandlestick = !isLine;

					if (attrs.spline && isLine)
					{
						type = 'spline';
					}

					if ((attrs.area || conf.useSplineAreaCharts) && isLine)
					{
						type = 'splineArea';
					}

					var data =
					[
						{
							name: 'Rates',
							dataPoints: getFilteredData(isLine),
							color: isLine ? (window.appConfig.lineChartColor || 'black') : (window.appConfig.candleNegativeColor || '#4f4f50'),
							lineThickness: 'splineArea' == type ? 1 : 1.5,
							type: type,
							axisYType: "secondary",
							markerType: 'none',
							risingColor: window.appConfig.candlePositiveColor || "#81cab8",
						}
					];

					if ('splineArea' == data[0].type) {
						var y = scope.getYAxis();
						if (y) {
							if (position) {
								var isWin = Trading.hasState('win');
								y.chart.gradient = [isWin ? conf.splineGradientPositiveTop : conf.splineGradientNegativeTop,
													isWin ? conf.splineGradientPositiveBottom : conf.splineGradientNegativeBottom];
							} else {
								y.chart.gradient = [conf.splineGradientNeutralTop, conf.splineGradientNeutralBottom];
							}
						}
					}

					if (isCandlestick)
					{
						data[0].lineThickness = 1;
						data[0].color = "#ee586c";
					}
				}
				else
				{
					console.log('data service has no data');
					return;
				}

				chartData = data;

				if (!data[0] || !data[0].dataPoints)
				{
					return;
				}

				if (!attrs.hideBuysell && chartData)
				{
					chartData = updateLines(chartData);
				}

				if (scope.transform && chartData)
				{
					chartData = scope.transform(chartData, scope);
				}

				if (!chartData)
				{
					return;
				}

				var p = chartData[0].dataPoints;

				if (!p || !p.length)
				{
					return;
				}

				var l = p.length - 1;

				if (endWidth && !isNewCandleAdded)
				{
					// setMax(p[l].x);
				}

				chart.options.data = chartData;

				var boundary = getChartBoundary(getYBoundary(chartData));

				if (boundary[0])
				{
					if ((chart.options.axisY2.minimum != boundary[0]) || (chart.options.axisY2.maximum != boundary[1]))
					{
						window.clearTimeout(window.resetYLabels);
						window.resetYLabels = window.setTimeout(function()
						{
							if (!chart)
							{
								return;
							}

							resetLabels('y');
							chart.options.axisY2.interval = (boundary[1] - boundary[0]) / 5;
						}, 1000);
					}

					setChartBoundary(boundary);
				}

				var opts = chart.options;
				var axisX = opts.axisX || opts.axisX2;

				axisX.viewportMinimum = getMin();
				axisX.viewportMaximum = getMax();

				// chart gets squeezed to the left if not enough data points to fill it
				scope.preventDrag = false;
				var firstX = chartData[0].dataPoints[0].x;
				if (firstX > axisX.viewportMinimum) {
					axisX.viewportMinimum = firstX;
					// scope.preventDrag = true;
				}

				// avoid rendering an insane number of labels
				var labelIntv = (chart.options.axisY2.maximum - chart.options.axisY2.minimum) / 5;
				var diff = chart.options.axisY2.interval / labelIntv;
				if ((diff > 1.5) || ( diff < 0.75))
				{
					chart.options.axisY2.interval = labelIntv;
				}

				if (window.appConfig.candleWidth) {
					chart.options.dataPointWidth = window.appConfig.candleWidth;
					window.CanvasJS.Chart.prototype._maxBarWidth = window.appConfig.candleWidth;
				}

				// convert candle data to line
				if (isLine && data) {
					var cData = chartData[0].dataPoints;
					var lineData = [];
					var src = [1, 3];
					// var src = [3];
					for (var k = 0; k < cData.length; k++) {
						if (cData[k].processed) {
							continue;
						}

						for (var i = 0; i < src.length; i++) {
							var c = JSON.parse(JSON.stringify(cData[k]));

							c.candle = c.y;
							c.y = c.candle[src[i]];
							c.processed = true;

							if (src.length > 1) {
								var diff = Math.abs(((i - 1) / src.length));
								c.nextFullX = c.x;
								c.x -= diff;
								c.decBase = diff;
							}

							lineData.push(c);
						}

					}

					lineData = lineData.sort((a, b) => a.x - b.x);

					chartData[0].dataPoints = lineData;
				}

				// chart animation when a new candle is added
				if (isNewCandleAdded)
				{
					newCandleProgress++;

					for (var d = 0; d < chartData.length; d++) {
						var dp = JSON.parse(JSON.stringify(chartData[d].dataPoints));
						for (var k = 0; k < dp.length; k++)
						{
							var xDiff = 1 / newCandleSteps;
							dp[k].x -= xDiff;

							if (dp[k].nextFullX) {
								dp[k].nextFullX -= xDiff;
							}
						}

						chartData[d].dataPoints = dp;
					}

					if (newCandleProgress >= newCandleSteps)
					{
						isNewCandleAdded = false;
						newCandleProgress = 0;
					}

					if (1 == newCandleProgress) {
						chart.gridLineBase++;
					}

					chart.gridLineBase = chart.gridLineBase - (1 / newCandleSteps);
				}

				if (scope.period !== null) {
					var hasLabelCache = !!window.xLabelPositionCache;
					scope.renderChart();

					if (!hasLabelCache && !!window.xLabelPositionCache) {
						scope.renderChart();
					}

					CandleData.markAsRendered(attrs.symbol, scope.period, true);
				}

				delete chart.options.dataPointWidth;

				ChartHelper.resetOverlapCheck();

				if (scope.rendercallback)
				{
					scope.rendercallback(scope);
				}

				wasInactive = false;
			};

			scope.renderChart = function() {
				chart.options.axisY2.interval = null;
				window.candlestickMap = {};

				var chartRangeMin = chart.options.axisY2.minimum;
				var chartRangeMax = chart.options.axisY2.maximum;

				if (!window.localStorage.getItem('visibleCandleCount') && chart.visibleCandleCount) {
					window.localStorage.setItem('visibleCandleCount', chart.visibleCandleCount);
				}

				if (window.localStorage.getItem('visibleCandleCount') && !chart.visibleCandleCount) {
					chart.visibleCandleCount = parseInt(window.localStorage.getItem('visibleCandleCount'));
				}

				for (var k = 0; k < chartData.length; k++) {
					if (k > 0 && chartData[k].pctValues) {

						// more labels needed for RSI and volume?
						// chart.options.axisY2.interval = (chartRangeMax - chartRangeMin) / 6;

						var getY = function(pct) {
							return chartRangeMin + ((chartRangeMax - chartRangeMin) * (pct / 100));
						}

						var dp = chartData[k].dataPoints;

						if (!dp) {
							continue;
						}

						for (var i = 0; i < dp.length; i++) {
							if (_.isArray(dp[i].pct)) {
								dp[i].y = JSON.parse(JSON.stringify(dp[i].pct));
								for (var l = 0; l < dp[i].y.length; l++) {
									dp[i].y[l] = getY(dp[i].y[l]);
								}
							} else {
								dp[i].y = getY(dp[i].pct);
							}

							// looks like there's a Canvasjs bug that messes up the line if the majority of the datapoints have round X values (candlestick)
							// dp[i].x = parseFloat(dp[i].x) - 0.001;
						}
					}
				}

				if (!chartData.length || !chartRangeMin || !chartRangeMax) {
					return;
				}

				// console.log(chartRangeMin, chartRangeMax, chart.options.axisX.viewportMinimum, chartData[0]);

				chart.render();

				for (var k = 0; k < chartData.length; k++) {
					var cb = chartData[k].renderCallback;
					if (cb) {
						cb(chart, chartData, k);
					}
				}
			};

			scope.redraw = dataUpdate;

			scope.getMax = getMax;
			scope.getMin = getMin;

			scope.setEnd = function(isEnd) {
				if (isEnd && !scope.isEnd) {
					padding = maxPadding;
				}

				scope.isEnd = isEnd;
			}

			scope.getPeriod = function()
			{
				return scope.period;
			};

			scope.getData = function()
			{
				return chartData;
			};

			scope.isNewCandleAdded = function() {
				return isNewCandleAdded;
			};

			scope.$on('$destroy', function()
			{
				scope.active = false;

				console.log('Destroying' , attrs.symbol);

				_.each(eventListeners, function(listener) { listener(); });
			});

			element.on('$destroy', function () { scope.$destroy(); });

			scope.getLastPoint = function()
			{
				if (chartData && chartData[0] && chartData[0].dataPoints)
				{
					return chartData[0].dataPoints[chartData[0].dataPoints.length - 1];
				}
			};

			var getY = function(y, target)
			{
				var min = _.min(y);
				if (min)
				{
					var max = _.max(y);
					return (min <= target) && (max >= target) ? target : (min + max) / 2;
				}
				else
				{
					return y;
				}
			};

			scope.getPositionOpenX = function(pos)
			{
				var offset = CandleData.getPeriodLength(scope.periods[scope.period], attrs.symbol) / 3;
				return CandleData.getClosestXTimeByTime(attrs.symbol, scope.period, pos.openX - offset);
			};

			scope.getPositionOpenY = function(pos, openX)
			{
				var yAxis = scope.getYAxis();
				var y = yAxis.convertValueToPixel(pos.price);
				var data = scope.getData()[0].dataPoints;

				if ((openX < data[0].x) || (openX > data[data.length - 1].x))
				{
					return pos.price;
				}

				// find the point on the line
				for (var k = 0; k < data.length - 1; k++)
				{
					if ((data[k].x <= openX) && (data[k + 1].x >= openX))
					{
						break;
					}
				}

				var rate = getY(data[k].y, pos.price);

				return rate;
			};

			scope.getChartX = function(x)
			{
				return scope.getXAxis().convertValueToPixel(x);
			};

			scope.getChartY = function(x)
			{
				return scope.getYAxis().convertValueToPixel(y);
			};

			scope.isInView = function(x)
			{
				var xAxis = scope.getXAxis();
				var chartX = xAxis.convertValueToPixel(x);
				return (chartX >= 0) && (chartX < xAxis.bounds.x2);
			};

			scope.getXAxis = function()
			{
				return chart.axisX2[0] || chart.axisX[0] || window.chart.axisX2[0] || window.chart.axisX[0];
			};

			scope.getYAxis = function()
			{
				return chart.axisY2[0] || chart.axisY[0] || window.chart.axisY2[0] || window.chart.axisY[0];
			};

			scope.activate();
			scope.reset();
		}
	}
});

var cumulativeOffset = function(element) {
	var top = 0, left = 0;
	do {
		top += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);

	return {
		top: top,
		left: left
	};
};

var roundFlt = function(flt)
{
	return flt ? parseFloat(flt.toPrecision(12)) : 0;
};
