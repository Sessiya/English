var isTablet = document.body.offsetWidth > 600;

window.appConfig = {
    appName: "GoForex",
    disableMarketClosedPopup: true,
    disableBuySellLines: true,
    candlestickCount: 50,
    useSplineAreaCharts: true,
    roundedCandles: 2,
    candleWidth: isTablet ? 6 : 3,
    volumeBarWidth: isTablet ? 6 : 3,
    volumeIconSize: isTablet ? 8 : 8,
    volumeTextSize: isTablet ? 1 : 1.7,
    chartPadding: 0,
    disableLineAutozoom: true,
    splineGradientNeutralTop: 'rgba(0, 115, 222, 0.1)',
    splineGradientNeutralBottom: 'white',
    splineGradientPositiveTop: 'rgba(117, 250, 215, 0.1)',
    splineGradientPositiveBottom: 'white',
    splineGradientNegativeTop: 'rgba(236, 109, 131, 0.1)',
    splineGradientNegativeBottom: 'white',
    chartFontFamily: 'InterRegular',
    chartFontColor: 'rgba(126, 144, 167, 0.3)',
    chartFontSize: isTablet ? 17 : 12,
    rateSideLabelFontFamily: 'InterBold',
    rateSideLabelFontSize: isTablet ? 14 : 12,
    priceLineFunc: 'drawDashLine',
    priceLineFullWidth: true,
    rateLineColor: '#0073DE',
    positionLineDownColor: '#EC6D83',
    positionLineUpColor: '#46B15F',
    positionLineFunc: 'noop',
    positionOpenLineFunc: 'drawSolidCustomLine',
    positionOpenLineOffset: 5,
    // disableStopLossLines: true,
    stopLossIconSize: 10,
    stopLossIconLeft: 5,
    stopLossIconYLoss: -6,
    stopLossIconYProfit: 6,
    stopLossLineFunc: 'drawDottedLine',
    defLossLimit: 0,
    defProfitLimit: 0,
    chartPositionIconPrefix: 'chart-',
    chartPositionIconSize: 7,
    lineDash: [2, 2],
    drawLabelToPointConnector: true,
    candlePositiveColor: '#87C98C',
    candleNegativeColor: '#EC6D6D',
    lineChartColor: '#324971',
    disableAssetSwiper: true,
    assetSwiperSelector: '.swiper-container.asset-menu',
    assetCategories: [{name: 'Most Popular Assets In ' + (new Date()).getFullYear().toString(), instruments: ['BTCUSD', 'EURUSD', 'GOOUSD', 'ETHUSD', 'GBPUSD', 'AAPUSD', 'USDJPY', 'OILUSD', 'XAUUSD', 'NDQUSD'], popular: true}, // todo - set via Firebase?
                      {name: 'Crypto', instruments: ['BTCUSD', 'ETHUSD', 'EOSUSD', 'XMRUSD', 'XRPUSD', 'LTCUSD', 'NEOUSD', 'BCHUSD', 'ADAUSD', 'DSHUSD', 'IOTUSD', 'STLUSD', 'TEZUSD', 'TROUSD', 'DOGUSD', 'MANUSD', 'SHIUSD', 'BNBUSD', 'AVAUSD', 'DOTUSD', 'SOLUSD', 'LUNUSD', 'MATUSD', 'CPTUSD']},
                      {name: 'Stocks', instruments: ["GOOUSD", "AAPUSD", "NKEUSD", "TSLUSD", "XOMUSD", "DISUSD", "MSFUSD", "XMIHKD", "NFLUSD", "SNAUSD", "FBXUSD", "SPOUSD", "AMZUSD", "NESCHF", "VOWEUR", "FXXUSD", "RDSUSD", "TLRUSD", "CGCUSD", "CROUSD", "BABUSD", "HSBUSD", "SBXUSD"/*, "FITUSD"*/, "ASOGBP", "TCTHKD", "INTUSD", "NVDUSD", "AMDUSD", "BYNUSD", "BOAUSD", "MCDUSD", "UBRUSD", "RMCSAR", "VODINR", "YESINR"/*, "DHFINR"*/, "ADIEUR", "AIRUSD", "COLUSD"/*, "DAIEUR"*/, "GSAUSD", "JDXUSD", "JNJUSD", "MASUSD", "SAMKRW", "TOYUSD", "VISUSD", "ZOMUSD", "COIUSD"]},
                      {name: 'Forex', instruments: ["EURUSD", "USDJPY", "GBPUSD", "USDCAD", "USDZAR", "NZDUSD", "AUDJPY", "USDCNH", "AUDUSD", "USDTRY", "EURCHF", "USDINR", "EURGBP", "EURJPY", "GBPJPY", "USDCHF"]},
                      {name: 'Commodities', instruments: ['OILUSD', 'XAUUSD', 'COPUSD', 'GASUSD', 'PLAUSD', 'XAGUSD', /*'COCUSD',*/ 'COTUSD', 'PLDUSD', 'SUGUSD', 'WHEUSD']},
                      {name: 'Index', instruments: ['NDQUSD', 'SPXUSD', 'GEREUR', 'DJIUSD', 'FTSGBP']}],
    defaultPairs: ['EURUSD', 'BTCUSD', 'USDJPY', 'OILUSD', 'GBPUSD'],
    canvasImages: ['position-down', 'position-up', 'chart-position-down', 'chart-position-up', 'close-if-loss', 'close-if-profit', 'chart-price-label', 'chart-up-label', 'chart-down-label'],
    firebaseConfig: {
		apiKey: "AIzaSyBzoTLunIiEbS-CDrk5Rev6RsYY8IomeQA",
		authDomain: "goforex-dfd38.firebaseapp.com",
		databaseURL: "https://goforex-dfd38-default-rtdb.firebaseio.com",
		projectId: "goforex-dfd38",
		storageBucket: "goforex-dfd38.appspot.com",
		messagingSenderId: "932740909364",
		appId: "1:932740909364:web:4b6032194fb5e8c2b97d61"
	},
    // apiUrl: ['localhost:3001'],
    apiUrl: ['tgfx.cred24.lv/gofx/'],
    apiUrlProtocol: 'https://',

    cloudFunctionsUrl: 'https://us-central1-goforex-dfd38.cloudfunctions.net/',
    // <button ng-click="handleDrag(-20)">&lt;&lt;</button><button ng-click="handleDrag(-0.5)">&lt;</button> \
    // <button ng-click="handleDrag(0.5)">&gt;</button><button ng-click="handleDrag(20)">&gt;&gt;</button> \
    chartTemplate:
    '<div class="chart-container"> \
    <div class="chart-menu-container"> \
        <goforex-chart-periods chart="self" symbol="{{ ::symbol }}"></goforex-chart-periods> \
        <div class="chartTypeSwitch" ng-click="toggleType($event)"> \
            <div class="chartOptionsMenu" click-outside="hideChartOptionsMenu()" outside-if-not="chartTypeSwitch"> \
                <div class="chartTypeOptions"> \
                    <div class="chart-type-line" ng-click="setTypeLine()"></div> \
                    <div class="chart-type-candle" ng-click="setTypeCandleStick()"></div> \
                </div> \
            </div> \
        </div> \
        <div class="chartTools" ng-click="showChartToolsOptions()"> \
        </div> \
        <div class="chartCompare" ng-click="toggleChartCompare()">\
        </div> \
    </div> \
    <div class="chart-touchControl" ng-dblclick="reset()" ios-dblclick="reset()" style="width: 100%; height: 100%; position: absolute; z-index: 1; overflow: hidden;"></div> \
    <div class="chart-inner-container" style="width: 100%"></div> \
    <div class="chartPeriodMinus" style="display: none" ng-click="zoomOutOnce()"><span class="chart-minus">-</span></div> \
    <div class="chartPeriodPlus" style="display: none" ng-click="zoomInOnce()"><span class="chart-plus">+</span></div> \
    </div>',
    periodLabelTimes: [' sec', ' min'],
    disableFacebookLogin: false,
    giftCards: ["$50", "$20", "$10"],
    // hideTALabels: true,
    disableZoomOutToPosition: true,
    // volumeWsUrl: 'ws://localhost:8800',
    // volumeWsUrl: 'ws://136.243.69.70:8800',
    volumeWsUrl: 'ws://136.243.69.70:8801',
    googleWebClientID: '932740909364-hs536bqsitc1u3odipdb0na9cbff4724.apps.googleusercontent.com'
};

window.maxCandleChartPadding = 3;

var waitForInjector = window.setInterval(function() {
    var injector = angular.element(document.getElementById('app')).injector();

    if (!injector) {
        return;
    }

    window.clearInterval(waitForInjector);

    var Mongo = injector.get('Mongo');
    var $rootScope = injector.get('$rootScope');
    var $timeout = injector.get('$timeout');

    Mongo.getConfig().then(function(conf) {
        conf = conf.data;
        var keys = Object.keys(conf);
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            try {
                appConfig[key] = JSON.parse(conf[key]);
            } catch {
                appConfig[key] = conf[key];
            }
        }

        if (appConfig) {
            $rootScope.appConfig = appConfig;
        }
    });

    var originalApiUrls = window.appConfig.apiUrl;

    function updateCSettings()
    {
        if(window.localStorage.cSettings)
        {
            // if(window.device && !window.device.platform)
            // {
            //     return;
            // }

            try {
                var cSettings = JSON.parse(window.localStorage.cSettings);
            }
            catch(e) {
                console.log('error parsing cSettings', e);
                return;
            }

            if(!cSettings || cSettings == "")
            {
                console.log('cSettings is empty', cSettings);
                return;
            }

            // set window.appConfig.apiUrl instantly if cached
            if(cSettings.apiUrl && cSettings.apiUrl != "" && window.appConfig.apiUrl && window.appConfig.apiUrl[0] != "localhost:3001") {
                window.appConfig.apiUrl = cSettings.apiUrl.split(' ');
                Mongo.updateBaseUrls();
            }

            if(cSettings.disabledAssets)
            {
                window.localStorage.disabledAssets = JSON.stringify(cSettings.disabledAssets);
                if(window.location.hash == '#/tab/play')
                {
                    $rootScope.$broadcast('reset-pairs');
                }
            }
        }
    }

    // update cached settings
    var settingsRef = firebase.database().ref('settings');
	settingsRef.once('value', function(snap)
	{
		var globalSettings = snap.val();
        if(globalSettings) {
            window.localStorage.cSettings = JSON.stringify(globalSettings);

            //set window.appConfig.apiUrl
            if(globalSettings.apiUrl && globalSettings.apiUrl != "")
            {
                window.appConfig.apiUrl = globalSettings.apiUrl.split(' ');
                Mongo.updateBaseUrls();
            }
            else
            {
                // restore to original apiUrl if no custom apiUrl is set in firebase
                if(window.appConfig.apiUrl != originalApiUrls)
                {
                    window.appConfig.apiUrl = originalApiUrls;
                    Mongo.updateBaseUrls();
                }
            }

            updateCSettings();
        }
        else
        {
            // restore to original apiUrl if no custom apiUrl is set in firebase
            window.localStorage.removeItem('cSettings');
            window.appConfig.apiUrl = originalApiUrls;
        }
	});

    var chartHelper = injector.get('ChartHelper');
    chartHelper.setDefaultFont('InterRegular');
    chartHelper.setLineLabelSize(isTablet ? 15 : 11);
    chartHelper.setRateLineFunction('noop');
    chartHelper.setLineLabelOffset(5);

    var isSquareLabel = function(label) {
        if (label.match(/[A-Z]{6}/)) {
            return true;
        }

        if (label.substr(0, 3) == 'MA-') {
            return true;
        }

        return ['RSI', 'Oversold', 'Overbought'].indexOf(label) > -1;
    }

    chartHelper.setRoundRectRadius(function(ctx, x, y, label, color) {
        if (isSquareLabel(label)) {
            return 0;
        } else {
            return 5;
        }
    });

    chartHelper.setSideLabelOffset(function(ctx, x, y, label, color) {
        if (isSquareLabel(label)) {
            return -5;
        } else {
            return -2;
        }
    });

    window.appConfig.sideLabelPadding = function(ctx, x, y, label, color) {
        if (isSquareLabel(label)) {
            return 3;
        } else {
            return 5;
        }
    };

    window.appConfig.sideLabelLeftPadding = function(ctx, x, y, label, color) {
        if (isSquareLabel(label)) {
            if (['Overbought', 'Oversold'].indexOf(label) > -1) {
                return -2;
            } else {
                return 3;
            }
        } else {
            return 10;
        }
    };

    window.appConfig.sideLabelRightPadding = function(ctx, x, y, label, color) {
        if (isSquareLabel(label)) {
            if (['Overbought', 'Oversold'].indexOf(label) > -1) {
                return 15;
            } else {
                return 0;
            }
        } else {
            return 10;
        }
    };

    window.appConfig.drawGridLines = function(chart, calculateLabelPositionsOnly) {
        if(!window.labelCache || !window.labelCache.y)
        {
            return;
        }

        var labels = window.labelCache.y;
        var l = Object.keys(labels).length;

        ctx = chart.canvas.getContext('2d');

        var xa = chart.axisX.length > 0 ? chart.axisX[0] : null;
        var ya = chart.axisY2.length > 0 ? chart.axisY2[0] : null;
        if (!xa || !ya) {
            return;
        }

        if (!chart.renderAreaWidth) {
            chart.renderAreaWidth = xa.convertValueToPixel(xa.viewportMaximum) - xa.convertValueToPixel(xa.viewportMinimum);
            chart.renderAreaHeight = Math.abs(ya.convertValueToPixel(ya.viewportMaximum) - ya.convertValueToPixel(ya.viewportMinimum));
        }

        var width = chart.renderAreaWidth;
        var height = chart.renderAreaHeight;

        if (!width || !height) {
            return;
        }

        if (!calculateLabelPositionsOnly) {
            var grad = ctx.createLinearGradient(0, 0, width, 1);
            var c = '165';
            // var c = '0';
            var cc = c + ', ' + c + ', ' + c;
            // var cc = '255,0,0';
            grad.addColorStop(0, "rgba(" + cc + ", 0.13)");
            grad.addColorStop(0.25, "rgba(" + cc + ", 0.12)");
            grad.addColorStop(1, "rgba(" + cc + ", 0.04)");

            var lightLineCnt = 3;
            var lightGrad = ctx.createLinearGradient(0, 0, width, 1);
            var c = '226';
            var cc = c + ', ' + c + ', ' + c;
            lightGrad.addColorStop(0, "rgba(" + cc + ", 0.13)");
            lightGrad.addColorStop(0.25, "rgba(" + cc + ", 0.12)");
            lightGrad.addColorStop(1, "rgba(" + cc + ", 0.05)");

            // horizontal lines
            var prev = null;
            var lineDiff = 0;
            var horLines = [];
            for (var k = 0; k < l; k = k + 2) {
                var src = window.labelCache.ySrc[k + 1];
                if (!src || !src.pos) {
                    continue;
                }

                var yPos = src.pos.y + (src.height / 2) - 1;
                var currDiff = prev ? Math.ceil(Math.abs(prev - yPos) / 4) : 0;
                if ((k + 2 >= l) && (prev && (yPos > prev)) || (lineDiff && (currDiff < lineDiff))) {
                    break;
                } else {
                    chartHelper.drawSolidCustomLine(ctx, 0, yPos, width, yPos, grad, 1);
                    horLines.push(yPos);
                    prev = yPos;
                    lineDiff = Math.max(currDiff, lineDiff);
                }
            }

            // missing horizontal line on top due to dragging?
            var l = horLines.length - 1;
            var firstHorDiff = horLines[l - 1] - horLines[l];
            if (firstHorDiff < horLines[l]) {
                horLines.push(horLines[l] - firstHorDiff);
                var yPos = horLines[l + 1];
                chartHelper.drawSolidCustomLine(ctx, 0, yPos, width, yPos, grad, 1);
            }

            horLines = horLines.reverse();

            // fill in lighter horizontal lines
            for (var k = 0; k < horLines.length; k++) {
                var nextGap = (k == 0) + 0;
                var gap = (horLines[k + nextGap] - horLines[k + nextGap - 1]) / (lightLineCnt + 1);

                var y = horLines[k];
                for (var i = 0; i < lightLineCnt; i++) {
                    var lightY = y - ((i + 1) * gap);
                    chartHelper.drawSolidCustomLine(ctx, 0, lightY, width, lightY, lightGrad, 1);
                }
            }
        }

        // vertical lines
        var vertLineCnt = 3;
        var vertLines = [];

        var viewportWidth = Math.floor(xa.viewportMaximum - xa.viewportMinimum);

        if (chart.gridLineBase === undefined) {
            chart.gridLineBase = 100000;
        }

        if (xa) {
            var from = width;
            var step = width / vertLineCnt;
            var half = step / 2;

            var offset = (width * ((xa.viewportMaximum - chart.gridLineBase) / viewportWidth)) % step;

            for (var k = vertLineCnt - 1; k >= 0 ; k--) {
                var x = from - (k * step) - offset;

                vertLines.push(x);

                if (x > width) {
                    continue;
                }

                if (!calculateLabelPositionsOnly) {
                    chartHelper.drawSolidCustomLine(ctx, x, 0, x, height + 10, grad, 1);

                    var sec = (vertLines[0] > half) ? x - half : x + half;
                    chartHelper.drawSolidCustomLine(ctx, sec, 0, sec, height + 10, grad, 1);
                }
            }
        }

        // fill in lighter vertical lines
        vertLines = vertLines.reverse();
        window.chart.vertLines = vertLines;

        if (!calculateLabelPositionsOnly) {
            for (var k = 0; k < vertLines.length; k++) {
                var nextGap = (k == 0) + 0;
                var gap = (vertLines[k + nextGap] - vertLines[k + nextGap - 1]) / (lightLineCnt + 1);

                var x = vertLines[k];
                for (var i = 0; i < lightLineCnt; i++) {
                    var lightX = x - ((i + 1) * gap);

                    if (lightX > width) {
                        continue;
                    }

                    chartHelper.drawSolidCustomLine(ctx, lightX, 0, lightX, height + 10, lightGrad, 1);
                }
            }
        }
    };

    window.appConfig.customActivePairsHandler = function($scope, pair, _true, skipPositionCheck) {
        if ($scope.activePairs.indexOf(pair) > -1) {
            return;
        }

        var $ionicPopup = injector.get('$ionicPopup');
        var Mongo = injector.get('Mongo');
        var $rootScope = injector.get('$rootScope');
        var curr = $scope.currency;
        var SymbolData = injector.get('SymbolData');

        if ($scope.user && $scope.user.positions && Mongo.getPosition(curr) && !skipPositionCheck)
		{
			$ionicPopup.confirm({
				title: '',
				cssClass: 'popup-confirm asset-warning',
				template: '<h2>' + $scope.t('Warning') + '</h2><p>' + $scope.t('To remove an asset from the trading list, please close the position.') + '</p>',
				buttons: [
                    {
                        text: $scope.t('Cancel'),
                        onTap: function(e)
                        {
                            return 'return';
                        },
                        type: 'button-gray'
                    },
                    {
    					text: $scope.t('Close Now'),
    					onTap: function(e)
    					{
    						return 'closePosition';
    					},
    					type: 'button-blue'
    				}
                ]
			})
			.then(function(res) {
				if(res != 'return')
				{
					$scope.closePosition(curr);
					window.appConfig.customActivePairsHandler($scope, pair, true, true);
				}
			});

			return;
		}

        if($scope.activePairs.length > 5)
        {
            $scope.activePairs = $scope.activePairs.slice(0, 5);
        }

        SymbolData.unsubscribe(curr);
        SymbolData.subscribe(pair);

        $scope.activePairs[$scope.activePairs.indexOf(curr)] = pair;
        Mongo.setActivePairs($scope.activePairs);

        $scope.pairs = $scope.activePairs;
        window.localStorage.activePairs = JSON.stringify($scope.pairs);
        $rootScope.$broadcast('$$rebind::curr', 'active pairs changed');

        $scope.toggleAssetSelector();
        $scope.setCurrency(pair);
    }

    try {
        if(window.localStorage.activePairs && JSON.parse(window.localStorage.activePairs).length > 5)
        {
            try {
                window.localStorage.activePairs = JSON.stringify(JSON.parse(window.localStorage.activePairs).slice(0,5));
            } catch(e) {
                console.log(e);
            };
        }
    } catch(e) {
        console.log(e);
    }

    chartHelper.loadCanvasImage('arrow-up-white');
    chartHelper.loadCanvasImage('arrow-down-white');
    chartHelper.loadCanvasImage('rsi-up');
    chartHelper.loadCanvasImage('rsi-down');
    chartHelper.loadCanvasImage('volume-max');
    chartHelper.loadCanvasImage('volume-current');

    window.appConfig.sideLabelCustomFunction = function(ctx, x, y, label, color, width) {
        if (label.match(/^[0-9\,\. ]+$/) && x < 20) {
            chartHelper.drawIcon(x + 8, y - 1, 'arrow-' + (color == '#4b9e6a' ? 'up' : 'down') + '-white', ctx, 8);
        } else if (['Overbought', 'Oversold'].indexOf(label.trim()) > -1) {
            chartHelper.drawIcon(width + 4, y - 1, 'rsi-' + (label.trim() == 'Overbought' ? 'up' : 'down'), ctx, 4);
        }
    };

    window.appConfig.xLabelPositionTransform = function(label, xy, idx, chart) {
        if(!chart || !chart.axisX)
        {
            return;
        }

        if (!chart.axisX.length) {
            return xy;
        }

        var axis = chart.axisX[0];

        var skope = chart.scope;

        if (!window.xLabelPositionCache) {
            window.xLabelPositionCache = {config: {
                idxMap: {}
            }};
        }

        if (!chart.vertLines) {
            return xy;
        }

        var keyRoot = skope.currency + '-' + skope.period + '-';
        // var width = CandleData.getPeriodLength(skope.periods[skope.period], skope.currency);
        var width = skope.candleCount();

        var gridGap = width / 3;

        var lineGap = Math.abs(chart.vertLines[0] - chart.vertLines[1]);
        var firstLine = chart.vertLines[2];

        var startX = axis.viewportMaximum;

        var calcGridPos = function(offset) {
            return Math.floor((startX + (offset || 0) - chart.gridLineBase) / gridGap);
        }

        var gridPos = calcGridPos();

        var gridIdx = gridPos + idx;

        cacheIdx = keyRoot + gridIdx.toString();

        var firstLine = chart.vertLines[chart.vertLines.length - 1];
        xy.x = firstLine + (idx * lineGap);

        // set label value (X position in chart data)
        var x = axis.getXValueAt({x: xy.x, y: xy.y});
        window.xLabelPositionCache[cacheIdx] = x;

        window.xLabelPositionCache.config.gridPos = gridPos;
        window.xLabelPositionCache.config.keyRoot = keyRoot;
        window.xLabelPositionCache.config.idxMap[idx] = gridIdx;

        return xy;
    };

    window.setTimeout(function() {
        var $rootScope = injector.get('$rootScope');
        var defAssetSelector = $rootScope.toggleAssetSelector;

        $rootScope.toggleAssetSelector = function(isCompare) {
            var state = $rootScope.getAssetSelectorState();

            $timeout(function() {

                defAssetSelector(isCompare);

                var state = $rootScope.getAssetSelectorState();
                var appElm = angular.element(document.getElementById('app'));

                if (state) {
                    appElm.addClass('state-trans-started');
                    window.setTimeout(function()
                    {
                        window.appElement.addClass('opacity-transition');
                    }, 1);
                } else {
                    appElm.removeClass('state-trans-started');
                    window.appElement.removeClass('opacity-transition');

                    if(Keyboard && Keyboard.hide)
                    {
                        Keyboard.hide();
                    }

                    document.querySelectorAll('ion-content.keyboard-up').forEach(a => angular.element(a).removeClass('keyboard-up'))
                    document.querySelectorAll('ion-content.trading').forEach(a => a.style.height = '')

                    if ($rootScope.isCompare && String(window.chart.scope.getTAConfig('compare')).length != 6) {
                        $rootScope.toggleTA(2, false);
                    }
                }

                if(state)
                {
                    $rootScope.trackEvent("Asset_" + (isCompare ? "Compare" : "Selector"), "Open");
                }
            });
        }

        var defPositionClosedPopup = $rootScope.positionClosedResult;
        $rootScope.positionClosedResult = function() {
            defPositionClosedPopup();

            var state = $rootScope.getPositionResultState();
            var appElm = angular.element(document.getElementById('app'));

            if (state) {
                appElm.addClass('state-position-result');
            } else {
                appElm.removeClass('state-position-result');
            }
        }

        var defClosePositionClosed = $rootScope.closePositionResult;
        $rootScope.closePositionResult = function() {
            defClosePositionClosed();

            var state = $rootScope.getPositionResultState();
            var appElm = angular.element(document.getElementById('app'));

            if (state) {
                appElm.addClass('state-position-result');
            } else {
                appElm.removeClass('state-position-result');
            }
        }
    }, 1000);

}, 100);