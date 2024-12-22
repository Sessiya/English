angular.module('starter.trade')

.service('Trading', function(MarketStatus, $rootScope, $timeout, SymbolData, ChartHelper, StopLoss, PortfolioTitle, $state, OnlineStatus, VMin, ChartRef, Mongo, UserConfig, LoaderOverlay, $http, TopSymbols, $interval, DateNow, $ionicSlideBoxDelegate, ChartData, CandleData, $ionicPopup, IonicClosePopupService)
{
	var chartList = {};

	var serviceCache = {};
	var getService = function(name) {
		if (!serviceCache[name]) {
			serviceCache[name] = angular.element(document.getElementById('app')).injector().get(name);
		}

		return serviceCache[name];
	}

    var getChartSocialTrade = function()
    {
		return getService('ChartSocialTrade');
	};

    var getBattle = function()
    {
		return window.appConfig.enableBattles ? getService('Battle') : null;
	};

    var getBonusQuestions = function()
    {
		return getService('BonusQuestions');
	};

    var getAds = function()
    {
		return getService('Ads');
    };

    var getTGTradeHistory = function()
    {
		return getService('TradeHistory');
	};

	var setCurrencyCallback = null;
	var historyCallback = function() { };
	var lineChartMarkerCallback = null;

	var isBattleEnabled;
	var isChartSocialTradeEnabled;
	var isBonusQuestionsEnabled;
	var isPortfolioTitleEnabled;

	var positiveColor = '#81cab8';
	var negativeColor = '#ee586c';

	var noData = 0;

	var tradingContainer = null;
	var cssState = {};

	var tradeStateName = 'tab.play';

	var canvasWidth;

	var Trading = {
		initController: function($scope)
		{
			if (window.tradeController) {
				window.tradeController.$destroy();
            }

            // needs fixing/changing
            // BonusQuestions.initController($scope);

			window.tradeController = $scope;

			tradeStateName = $state.current;

			var self = this;

			$scope.trackView("Trade");

			$scope.isActive = true;

			$scope.isOnline = !!OnlineStatus.is();
			self.setState('online', $scope.isOnline);
			self.setState('offline', !$scope.isOnline);
			self.setState('open', true);
			self.setState('closed', false);

			$rootScope.$broadcast('$$rebind::curr', 'init controller');

			$scope.Math = window.Math;

			$scope.hasChart = {};

			$scope.positionPctValue = {};
			$scope.positionValue = {};
			$scope.minStopLoss = {};

            $scope.transStarted = false;
            $scope.tempStopLoss = {};
            $scope.formattedProcentStopLoss = {profit: 100, loss: 100};

            $scope.chartList = chartList;

			var pointSpeed = 1500;
			var lastPointRender = Date.now();
			var maxPointSize = window.appConfig.maxPointSize || 1;
			var minPointSize = 0.5;
			var pointSize = maxPointSize;

            LoaderOverlay.restore();

			var closingPositionQueue = [];
			var closingPositionQueueProcessing = false;
			var addPositionTimeout;

			document.addEventListener("deviceready", function()
			{
				_.each(TopSymbols.get(), function(key, index)
				{
					$scope.$watch('user.positions. ' + key + ' .forceClose' , function(v)
					{
						if(v)
						{
							closingPositionQueue.push({key: key, price: v});

							if(!closingPositionQueueProcessing)
							{
								closingPositionQueueProcessing = true;
								if(addPositionTimeout !== typeof 'undefined' || !addPositionTimeout)
								{
									processClosingPositionQueue();
								}
							}
							// $scope.closePosition(keyToClose, v);
						}
					}, true);
				});
			});

			function processClosingPositionQueue()
			{
				if(closingPositionQueue.length == 0)
				{
					closingPositionQueueProcessing = false;
					return;
				}

				if(closingPositionQueue.length > 0)
				{
					$scope.closePosition(closingPositionQueue[0].key, closingPositionQueue[0].price);
					closingPositionQueue.shift();

					$timeout.cancel(processTimeout);
					var processTimeout = $timeout(function()
					{
						processClosingPositionQueue();
					}, 500);
				}
			}

            if(window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).tradingQuizes)
            {
                Trading.enableBonusQuestions();
            }

            window.setTimeout(function()
            {
                var imgs = window.appConfig.canvasImages;
                for (var k = 0; k < imgs.length; k++) {
                    ChartHelper.loadCanvasImage(imgs[k]);
                }
            }, 300);

            // @TODO: te kaut kādu kešu vajadzētu izdomāt, liekas, moška, nez.
            MarketStatus.updateMarketStatus();
            window.clearInterval(window.marketStatusInterval);
            window.marketStatusInterval = window.setInterval(function()
            {
                MarketStatus.updateMarketStatus();
            }, 5000);

            // set up assets
            $scope.assetsLoaded = false;

			$scope.categories = window.appConfig.assetCategories;
			$scope.categoryNames = {
				'Crypto': $rootScope.t('Crypto'),
				'Stocks': $rootScope.t('Stocks'),
				'Forex': $rootScope.t('Forex'),
				'Commodities': $rootScope.t('Commodities'),
				'Index': $rootScope.t('Index'),
				'ETF': $rootScope.t('ETF'),
			};

			$scope.symbolNames =
			{
				'EURUSD': 'EUR/USD',
				'USDJPY': 'USD/JPY',
				'GBPUSD': 'GBP/USD',
				'USDCAD': 'USD/CAD',
				'OILUSD': 'Oil',
				'USDCHF': "USD/CHF",
				'GOOUSD': 'Google',
				'USDZAR': 'USD/ZAR',
				'USDTRY': 'USD/TRY',
				'USDMXN': 'USD/MXN',
				'USDSGD': 'USD/SGD',
				'USDNOK': 'USD/NOK',
				'XAUUSD': 'Gold',
				'ETHUSD': 'Ethereum',
				'BTCUSD': 'Bitcoin',
				'AAPUSD': 'Apple',
				'NKEUSD': 'Nike',
				'TSLUSD': 'Tesla',
				'XOMUSD': 'Exxon',
				'NKEUSD': 'Nike',
				'DISUSD': 'Disney',
				'HISTORY': 'HISTORY',
				'NZDUSD': 'NZD/USD',
				'AUDJPY': 'AUD/JPY',
				'USDCNH': 'USD/CNH',
				'AUDUSD': 'AUD/USD',
				'USDTRY': 'USD/TRY',
				'EURCHF': 'EUR/CHF',
				'MSFUSD': 'Microsoft',
				'XMIHKD': 'Xiaomi',
				'NFLUSD': 'Netflix',
				'SNAUSD': 'Snapchat',
				'FBXUSD': 'Meta',
				'SPOUSD': 'Spotify',
				'AMZUSD': 'Amazon',
				'COPUSD': 'Copper',
				'GASUSD': 'Gas',
				'PLAUSD': 'Platinum',
				'XAGUSD': 'Silver',
				'NDQUSD': 'Nasdaq',
				'SPXUSD': 'S&P 500',
				'GEREUR': 'GER30',
				'EOSUSD': 'EOS',
				'XMRUSD': 'Monero',
				'XRPUSD': 'Ripple',
				'NEOUSD': 'Neo',
				'LTCUSD': 'Litecoin',
				'NESCHF': 'Nestle',
				'VOWEUR': 'VW',
				'FXXUSD': 'Ford',
				'RDSUSD': 'Shell',
				'TLRUSD': 'Tilray',
				'CGCUSD': 'CGC',
				'CROUSD': 'Cronos',
				'BABUSD': 'Alibaba',
				'DJIUSD': 'Dow Jones',
				'HSBUSD': 'HSBC',
				'SBXUSD': 'Starbucks',
				/*, 'FITUSD': 'Fitbit',*/
				'ASOGBP': 'Asos',
				'TCTHKD': 'Tencent',
				'INTUSD': 'Intel',
				'NVDUSD': 'Nvidia',
				'AMDUSD': 'AMD',
				'BYNUSD': 'BYND',
				'BOAUSD': 'BAC',
				'MCDUSD': 'MCD',
				'UBRUSD': 'Uber',
				'RMCSAR': 'Aramco',
				'USDINR': 'USD/INR',
				/*, 'DHFINR': 'DHFL',*/
				'YESINR': 'Yes Bank',
				'VODINR': 'Vodafone',
				'EURGBP': 'EUR/GBP',
				'EURJPY': 'EUR/JPY',
				'GBPJPY': 'GBP/JPY',
				'USDCHF': 'USD/CHF',
				'ADIEUR': 'Adidas',
				'AIRUSD': 'Delta Air',
				'COLUSD': 'Coca Cola',
				/*, 'DAIEUR': 'Daimler',*/
				'GSAUSD': 'GS',
				'JDXUSD': 'JD.com',
				'JNJUSD': 'J&J',
				'MASUSD': 'MA',
				'SAMKRW': 'Samsung',
				'TOYUSD': 'Toyota',
				'VISUSD': 'Visa',
				'ZOMUSD': 'Zoom',
				/*'COCUSD': 'Cocoa',*/
				'COTUSD': 'Cotton',
				'PLDUSD': 'Palladium',
				'SUGUSD': 'Sugar',
				'WHEUSD': 'Wheat',
				'FTSGBP': 'FTSE',
				'BCHUSD': 'BCH',
				'ADAUSD': 'Cardano',
				'DSHUSD': 'Dash',
				'IOTUSD': 'IOTA',
				'STLUSD': 'Stellar',
				'TEZUSD': 'Tezos',
				'TROUSD': 'Tron',
				'XRPUSD': 'Ripple',
				'COIUSD': 'Coinbase',
				'DOGUSD': 'Dogecoin',
				'MANUSD': 'MANA',
				'SHIUSD': 'Shiba Inu',
				'BNBUSD': 'BNB',
				'AVAUSD': 'Avalanche',
				'DOTUSD': 'Polkadot',
				'SOLUSD': 'Solana',
				'LUNUSD': 'Terra',
				'MATUSD': 'Polygon',
				'CPTUSD': 'CRO',
				'ABBCHF': 'ABBCHF',
				'RELINR': 'Reliance',
				'TCSINR': 'Tata',
				'KVUUSD': 'Kenvue',
				'NIOHKD': 'NIO Inc.',
				'AMCUSD': 'AMC',
				'NUXUSD': 'Nu Holdings',
				'USSUSD': 'US Steel',
				'PALUSD': 'Palantir',
				'ATTUSD': 'AT&T',
				'TGTUSD': 'Target',
				'PFEUSD': 'Pfizer',
				'CSCUSD': 'Cisco',
				'CMCUSD': 'Comcast',
				'SHPUSD': 'Shopify',
				'WMTUSD': 'Walmart',
				'WBDUSD': 'Warner Bros.',
				'NEEUSD': 'NextEra',
				'RIOUSD': 'Riot Plat.',
				'MRVUSD': 'Marvell',
				'WFCUSD': 'Wells Fargo',
				'TSMUSD': 'TSMC',
				'LLOGBP': 'Lloyds',
				'BRCGBP': 'Barclays',
				'RRHGBP': 'Rolls-Royce',
				'GLNGBP': 'Glencore',
				'TLSAUD': 'Telstra',
				'EMBSEK': 'Embracer',
				'APRKRW': 'Aprogen',
				'SOUUSD': 'SoundHound',
				'ABBCHF': 'ABB',
				'NIBSEK': 'NIBE',
				'CHGUSD': 'Chegg',
				'AVTUSD': 'Avnet',
				'ADYEUR': 'Adyen',
				'ADBUSD': 'Adobe',
				'UXXUSD': 'Unity',
				'CRWUSD': 'Crowdstrike',
				'CRMUSD': 'Salesforce',
				'ADSUSD': 'Autodesk',
				'EAIUSD': 'EA',
				'NETUSD': 'Cloudflare',
				'CAIUSD': 'C3.ai',
				'SNWUSD': 'Snowflake',
				'RBLUSD': 'Roblox',
				'UAIUSD': 'Under Armour',
				'GRBUSD': 'Grab',
				'ACNUSD': 'Accenture',
				'WIXUSD': 'Wix.com',
				'BDDUSD': 'BYD Co.',
				'PAHEUR': 'Porsche',
				'SPYUSD': 'SPDR S&P 500',
				'VOOUSD': 'Vanguard 500',
				'TLTUSD': 'iShares 20+',
				'QQQUSD': 'Invesco Trust',
				'GLDUSD': 'SPDR Gold',
				'XLVUSD': 'Health Care',
				'XLFUSD': 'SPDR Financial',
				'XLUUSD': 'SPDR Utilities',
				'IEFUSD': 'iShares 7-10',
				'SYIUSD': 'Neos S&P 500',
				'LNKUSD': 'Chainlink',
				'HEDUSD': 'Hedera',
				'THOUSD': 'THORChain',
				'SUIUSD': 'Sui USD',
				'COSUSD': 'Cosmos',
				'FILUSD': 'Filecoin',
				'SFPUSD': 'SafePal',
				'UNIUSD': 'Uniswap',
				'MKRUSD': 'Maker',
				'LDOUSD': 'Lido',
				'AVEUSD': 'Aave',
				'SANUSD': 'Sandbox'
			};

			// Setting default battleDisabled state
			$scope.battleDisabled = !window.appConfig.enableBattles;

			if (window.appConfig.enableBattles) {
				window.setTimeout(function()
				{
					if(window.localStorage.activePairs && window.localStorage.activePairs.indexOf('BATTLE') == -1)
					{
						$scope.battleDisabled = true;
						getBattle().updateSwiperBattle($scope);
					}
				}, 500);
			}

            $scope.getPairs = function(excludeHistory)
            {
                var pairs = TopSymbols.get();

                if (excludeHistory)
                {
                    var historyIndex = pairs.indexOf('HISTORY');

                    if(historyIndex > -1)
                    {
                        pairs.splice(historyIndex, 1);
                    }
                }

                $scope.assetsLoaded = true;
                return _.uniq(pairs);
            };

            $scope.pairs = $scope.getPairs();

            if (window.localStorage.activePairs)
            {
                try{
                    $scope.activePairs = JSON.parse(window.localStorage.activePairs);
                } catch(e)
                {
                    window.localStorage.activePairs = [];
                    $scope.activePairs = window.appConfig.defaultPairs;
                }
            }
            else
            {
                $scope.activePairs = window.appConfig.defaultPairs;
            }

            $scope.isPairActive = function(pair)
            {
                if(!$scope.activePairs)
                {
                    if(window.localStorage.activePairs)
                    {
                        $scope.activePairs = JSON.parse(window.localStorage.activePairs);
                    }
                    else if($scope.user && $scope.user.activePairs && $scope.user.activePairs.length > 0)
                    {
                        $scope.activePairs = $scope.user.activePairs;
                    }
                    else
                    {
                        var standartPairs = window.appConfig.defaultPairs;

                        if ($scope.user && $scope.user.country && $scope.user.country == 'CN')
                        {
                            var standartPairs = window.appConfig.defaultPairs.filter(i => SymbolData.getMarket(i) != 'crypto');
                        }

                        $scope.battleDisabled = false;
                        $timeout(function()
                        {
                            Mongo.setBattleDisabled(true);
                        });

                        $scope.activePairs = standartPairs;
                    }
                }

                var pairIndex = $scope.activePairs.indexOf(pair);

                return pairIndex > -1;
            }

            // user stuff initialization start >>>
            $scope.isDataLoading = function(type) {
                if ('user' == type) {
                    return _.keys($scope.user).length == 0;
                }
            }

            LoaderOverlay.show('user', $scope, 'user');

            Mongo.getCached(function(user)
            {
                $scope.user = user;
            });

            var userDataWatch = $scope.$watch('user', function() {
                if($scope.user && $scope.user.cash)
                {
                    LoaderOverlay.restore();
                    userDataWatch();
                    // Trading.enablePortfolioTitle();

					// close positions which are disabled or not in $scope.pairs anymore like TWTUSD and DHFINR
					if($scope.activePairs && $scope.pairs)
					{
						var didSomethingChange = false;
						var uniquePairs = $scope.activePairs.filter(function(obj) { return $scope.pairs.indexOf(obj) == -1; });
						_.each(uniquePairs, function(pair)
						{
							if(pair == 'BATTLE' || pair == 'HISTORY')
							{
								return;
							}

							didSomethingChange = true;

							if($scope.user.positions[pair])
							{
								$scope.closePosition(pair, $scope.user.positions[pair].price);
							}

							var keyIndex = $scope.activePairs.indexOf(pair);
							if (keyIndex !== -1) {
								$scope.activePairs.splice(keyIndex, 1);
							}

							// replace removed asset with random one that's not in activePairs
							var randomAsset;
							if($scope.activePairs.length <= $scope.pairs.length)
							{
								do {
									randomAsset = Math.floor(Math.random() * $scope.pairs.length);
								} while ($scope.activePairs.indexOf($scope.pairs[randomAsset]) != -1);

								$scope.toggleActivePair($scope.pairs[randomAsset], true, true);
							}
						});

						$timeout(function()
						{
							if(didSomethingChange)
							{
								Mongo.update({activePairs: $scope.activePairs});
								window.localStorage.activePairs = JSON.stringify($scope.activePairs);
								$rootScope.$broadcast('$$rebind::curr', 'active pair toggle');
							}
						});

						// in case user has opened position with the asset, but it's not in activePairs
						if($scope.user.positions)
						{
							var uniquePairs = Object.keys($scope.user.positions).filter(function(obj) { return $scope.pairs.indexOf(obj) == -1; });
							_.each(uniquePairs, function(pair)
							{
								if(pair == 'BATTLE' || pair == 'HISTORY')
								{
									return;
								}

								if($scope.user.positions[pair])
								{
									$scope.closePosition(pair, $scope.user.positions[pair].price);
								}
							});
						}
					}

                    // in case alert was manually shown, but the user didn't interact with it, freshAccount tag might not be removed
                    if(window.localStorage.freshAccount == 'true')
                    {
                        if($scope.user.wins || $scope.user.losses)
                        {
                            window.localStorage.freshAccount = false;
                        }
                    }

                    $timeout(function()
                    {
                        // checking if fresh account, if it is, do not show alerts automatically
                        if(window.localStorage.freshAccount != 'true')
                        {
                            if ($rootScope.getAlert) {
                                $rootScope.getAlert();
                            } else {
                                console.log('$rootScope.getAlert() is not defined');
                            }
                        }
                    }, 1500);
                }
            });

            var userLoaderIntv = window.setInterval(function()
            {
                Mongo.getCached(function(user)
                {
                    $scope.user = user;

                    if (user) {
                        window.clearInterval(userLoaderIntv);
                    }
                });
            }, 100);
            // <<< end of user stuff

			var formatHistoryTrade = function(v, thisPosValue)
			{
				if(thisPosValue)
				{
					v.value = thisPosValue;
				}

				if(v.date)
				{
					v.openDate = v.date;
					delete v.date;
				}

				if(!v.closeDate)
				{
					v.closeDate = new Date().getTime();
				}

				if(v.pair)
				{
					v.instrument = v.pair;
					delete v.pair;
				}

				v.value = Math.round(v.value * 100) / 100;
				var fv = CanvasJS.formatNumber(Math.abs(v.value), "0.00##");

				if (v.value >= 0)
				{
					v.valueFormat = '+ $ ' + fv;
				}
				else
				{
					v.valueFormat = '- $ ' + fv;
				}

				v.valuePct = Math.round(v.value / v.amount * 10000) / 100;
				if (!v.value)
				{
					v.valuePct = 0;
				}

				if (v.valuePct >= 0)
				{
					v.valuePctFormat = '+' + v.valuePct.toString() + '%';
				}
				else
				{
					v.valuePctFormat = '-' + Math.abs(v.valuePct).toString() + '%';
				}

				v.openDateFormat = moment.unix(v.openDate / 1000).format('DD.MM HH:mm');
				v.closeDateFormat = moment.unix(v.closeDate / 1000).format('DD.MM HH:mm');

				_.each(['openPrice', 'closePrice'], function(key)
				{
					var p = v[key].toString();
					var i = p.indexOf('0000')
					if (i > -1)
					{
						p = p.substr(0, i);
					}

					var i = p.indexOf('9999')
					if (i > -1)
					{
						p = p.substr(0, i);
					}

					v[key + 'Format'] = CanvasJS.formatNumber(p, "0.00###");;
				});

				return v;
			}

			OnlineStatus.addWatch(function(status)
			{
				if (!status)
				{
					return;
				}

				LoaderOverlay.restore();

				window.setTimeout(function()
				{
					if ($scope.currency && chartList[$scope.currency])
					{
						chartList[$scope.currency].activate();
					}

					// resetting a chart instance that has never been active
					else
					{
						$timeout.cancel(t1);
						var t1 = $timeout(function()
						{
							var c = $scope.currency;
							$scope.currency = '';
							$scope.hasChart[c] = false;
							$scope.chartCurrency = null;
							$rootScope.$broadcast('$$rebind::curr', 'reset 1');

							$timeout.cancel(t2);
							var t2 = $timeout(function()
							{
								$rootScope.$broadcast('$$rebind::curr', 'reset 2');
								$scope.setCurrency(c);

								$timeout.cancel(t3);
								var t3 = $timeout(function()
								{
									$scope.chartCurrency = $scope.currency;
									$scope.hasChart[$scope.currency] = true;
									$rootScope.$broadcast('$$rebind::curr', 'reset 3');
								}, 500);
							}, 500, false);
						}, 500, false);
					}
				}, 1000);
			});

			$scope.$watch('user.positions', function(a)
			{
                // console.log('rebind positions');
                $rootScope.$broadcast('$$rebind::positions');
			});

			window.clearInterval(window.isOpenIntv);
			window.isOpenIntv = window.setInterval(function()
			{
				if (!$scope.isActive)
				{
					return;
				}

				var isOpen = $scope.isMarketOpen($scope.currency);
				if ((isOpen != $scope.isOpen) && $scope.setState)
				{
					$scope.isOpen = isOpen;
					$scope.setState('open', isOpen);
					$scope.setState('closed', !isOpen);
					$timeout.cancel(applyT);
					var applyT = $timeout(function() { $scope.$apply(); });
				}
			}, 10000, 0, false);

			if (!window.pauseListener) {
				console.log('!pauseListener');
				if(window.updateLastActiveTimeout) window.clearTimeout(window.updateLastActiveTimeout);

				window.pauseListener = function() {
					if(window.commonPause) window.commonPause();
					firebase.database().goOffline();
					ChartData.resetAll(true);
					ChartRef.goOffline();
				};
			}

			function updateLastActive()
			{
				if(!window.isGoforex)
				{
					return;
				}

				if(!$scope.user)
				{
					return;
				}

				var now = new Date().getTime();
				Mongo.update({lastActive: now});

				if(window.updateLastActiveTimeout) window.clearTimeout(window.updateLastActiveTimeout);
				window.updateLastActiveTimeout = window.setTimeout(function()
				{
					updateLastActive();
				}, 30000);
			}

			window.setTimeout(function()
			{
				updateLastActive();
			}, 5000);

			if (!window.resumeListener) {
				console.log('!resumeListener');
				window.resumeListener = function()
				{
					if(window.commonResume) window.commonResume();

					firebase.database().goOnline();

					updateLastActive();

					if(window.location.hash != "#/tab/play")
					{
						$rootScope.shouldTriggerResetInPlay = true;
						return;
					}

					ChartRef.goOnline();

					ChartData.resetAll();

					window.setTimeout(function() {
						var curr = $scope.currency;
						$scope.currency = null;
						$scope.setCurrency(curr);

						window.setTimeout(function() {
							if ($scope.isActive)
							{
								var chart = chartList[$scope.currency];
								if (chart)
								{
									if (chart.type == 'candlestick')
									{
										chart.candleReset();
									}

									CandleData.load($scope.currency, null, $scope.period);
									ChartData.watchCompressed($scope.currency);

									chart.activate();

									window.setTimeout(function()
									{
										if(window.reconnectUserWs) window.reconnectUserWs();
										PortfolioTitle.stop();
										PortfolioTitle.start();
										window.setTimeout(function()
										{
											if(window.connectStuckVolumeWs) window.connectStuckVolumeWs();
										}, 1);
									});
								}
							}

							$rootScope.$broadcast('$$rebind::curr', 'resume listener');
						}, 1000); // with a lower value candlestick charts may remain stuck on resume

						Mongo.checkToken();
					}, 100);
				};
			}

			document.addEventListener("deviceready", function() {
				document.removeEventListener("resume", window.resumeListener, false);
				document.addEventListener("resume", window.resumeListener, false);

				document.removeEventListener("pause", window.pauseListener, false);
				document.addEventListener("pause", window.pauseListener, false);
			}, false);

			// for browser debugging
			// window.setTimeout(function() {
			// 	document.dispatchEvent(new Event('deviceready'));
			// }, 1000);
			// document.dispatchEvent(new Event('pause')); setTimeout(() => { (new Audio("gettin-money-sound.mp3")).play(); document.dispatchEvent(new Event('resume')) }, 60 * 1000);

			if ($scope.currency)
			{
				$scope.symbol = SymbolData.getSymbol($scope.currency);
			}

			window.clearInterval(window.waitForSymbolData);
			window.waitForSymbolData = window.setInterval(function()
			{
				if ($scope.currency)
				{
					$scope.symbol = SymbolData.getSymbol($scope.currency);
					if ($scope.symbol)
					{
						window.clearInterval(window.waitForSymbolData);
					}
				}
			}, 100);

			if(!window.isGoforex)
			{
				$scope.loadTGHistory = function()
				{
					window.setTimeout(function()
					{
						var loadHistory = function(user)
						{
							if (!user.firebaseKeyId)
							{
								return;
							}

							var historyLimit = 100;
							var totalTrades = $scope.user.wins + $scope.user.losses;

							if(totalTrades <= historyLimit)
							{
								var initialSkip = 0;
							}
							else
							{
								var initialSkip = totalTrades - historyLimit;
							}

							Mongo.getTradeHistory(initialSkip, historyLimit).then(function(resp)
							{
								var historyData = resp.data;
								_.each(historyData, function(v)
								{
									v = formatHistoryTrade(v);
								});

								historyData.reverse();

								historyCallback(historyData);
							});
						}

						Mongo.getCached(function(user)
						{
							loadHistory(user);
						}, function()
						{
							window.setTimeout(function()
							{
								Mongo.getCached(function(user)
								{
									loadHistory(user);
								});
							}, 1000);
						});
					}, 1000);
				}

				$scope.loadTGHistory();
			}

			$scope.sym = function(sym)
			{
				return SymbolData.getSymbol(sym);
			};

			$scope.formattedBuyAmount = function(amount)
			{
				if (amount >= 1000)
				{
					return (amount / 1000) + 'K';
				}
				else
				{
					return CanvasJS.formatNumber(amount, "#");
				}
			};

			$scope.isMarketOpen = function(symbol)
			{
				if(window.marketStatusData && symbol && SymbolData.getMarket && SymbolData.getMarket(symbol) && window.marketStatusData[SymbolData.getMarket(symbol)])
				{
					var askedMarketData = window.marketStatusData[SymbolData.getMarket(symbol)];
					return askedMarketData.isOpen;
				} else {
					// temporary fix - prevents UI elements from disappearing while market status is loading
					return true;
				}
            };

            $scope.getAvailableCashAmounts = function(user)
            {
                var amounts = [];

				if(window.isGoforex)
				{
					var tradingAmounts = [1000, 750, 500, 200, 50];
					if($rootScope.appConfig && $rootScope.appConfig.tradingAmounts)
					{
						tradingAmounts = $rootScope.appConfig.tradingAmounts;
					}

					if(window.localStorage.isUserPro == 'true')
					{
						if($rootScope.appConfig && $rootScope.appConfig.proTradingAmounts)
						{
							tradingAmounts = $rootScope.appConfig.proTradingAmounts;
						}
						else
						{
							tradingAmounts = [4000, 2000, 1000, 500, 100];
						}
					}

					$scope.amounts = [];
					var maxBaseCash = 100000;
					var defaultBase = 10000;

					function roundUpToNearestMagnitude(num) {
						if (num <= 1000) {
							return 1000;
						}

						if (num <= 15000) {
							return 10000;
						}

						if (num <= 20000) {
							return 15000;
						}

						if (num <= 25000) {
							return 20000;
						}

						if (num <= 50000) {
							return 50000;
						}

						return 100000;

						// num = num / 2;
						// if (num <= 0) return 0; // Handle non-positive numbers
						// const magnitude = Math.pow(10, Math.floor(Math.log10(num)) + 1);
						// return magnitude;
					}

					var cash = $scope.user.cash || defaultBase;// + 50000;
					var baseCashAmount = Math.min(maxBaseCash, roundUpToNearestMagnitude(cash));

					_.each(tradingAmounts, function(tradingAmount)
					{
						tradingAmount = Math.ceil(tradingAmount / defaultBase * baseCashAmount);
						tradingAmount = Math.min(tradingAmount, Math.floor(cash));

						var amountObject = {amount: tradingAmount, formatted: $scope.formattedBuyAmount(tradingAmount)};
						amounts.push(amountObject);
						$scope.amounts.push(Math.round(tradingAmount / cash * 100));
					});

					return amounts;
				}

                // if (user)
                // {
                //     for (var k = 0; k < $scope.amounts.length; k++)
                //     {
                //         var amount = $scope.user.cash / 100 * $scope.amounts[k];

                //         if (amount >= 1000)
                //         {
                //             if ($scope.user.cash >= 10000)
                //             {
                //                 amount = Math.ceil(amount / 1000) * 1000;
                //             }
                //             else
                //             {
                //                 amount = Math.ceil(amount / 100) * 100;
                //             }
                //         }

                //         amount = Math.max(1, Math.ceil(Math.abs(amount)));

                //         if (amount)
                //         {
                //             amounts.push({amount: amount, formatted: $scope.formattedBuyAmount(amount)});
                //         }
                //     }
                // }

                return amounts;
            };

			$scope.getSymbolName = function(currency)
			{
				if($scope.symbolNames[currency])
				{
					return $scope.symbolNames[currency];
				}
				else
				{
					return 'removed';
				}
			};

			$scope.getSymbolPricePrefix = function(currency)
			{
				return currency.substr(3, 3) === 'USD' ? '$' : '';
			};

			$scope.getSymbolPriceSuffix = function(currency)
			{
				if ($scope.categories.some(c => c.name == 'Forex' && c.instruments.indexOf(currency) > -1)) {
					return '';
				} else {
					return currency.substr(3, 3) === 'USD' ? '' : currency.substr(3, 3);
				}
			};

			$scope.setCurrency = function(currency)
			{
				if(!window.appConfig.disableAssetSwiper && $rootScope.getAssetSelectorState && $rootScope.getAssetSelectorState())
				{
					$scope.toggleActivePair(currency);
					return;
				}

				$scope.isOpen = $scope.isMarketOpen(currency);
				self.setState('open', $scope.isOpen);
				self.setState('closed', !$scope.isOpen);

				if (currency == $scope.currency)
				{
					return;
				}

				LoaderOverlay.restore();

				noData = 0;

				$scope.transStarted = null;
				self.setState('transStarted', false);

				// $rootScope.$broadcast('$$rebind::positions');

				var prevCurrency = $scope.currency;
				$scope.currency = currency;
				$scope.symbol = SymbolData.getSymbol(currency);
				$scope.updatePositionValue(currency);

				$scope.trackEvent("Trade", "Currency", currency);

				if($scope.user && $scope.user.positions)
				{
					var pos = Mongo.getPosition($scope.currency)
					if(pos)
					{
						$scope.tempStopLoss.profit = pos.profitLimit;
						$scope.tempStopLoss.loss = pos.lossLimit;
					}
				}

				$scope.transStarted = null;
				$scope.formattedMidGhost = $scope.formattedMid + '.';

				updateBindRates();

				if (isBattleEnabled && !getBattle().setCurrency($scope))
				{
					return;
				}

				// needs fixing/changing
				if (isBonusQuestionsEnabled && !getBonusQuestions().setCurrency($scope) && 0)
				{
					return;
				}

				if (setCurrencyCallback && setCurrencyCallback(currency))
				{
					if ('HISTORY' != currency)
					{
						$scope.hasChart[currency] = true;
					}

					window.localStorage['activeCurrency'] = currency;
				}

				if (chartList[prevCurrency])
				{
					chartList[prevCurrency].deactivate();
				}

				var initChartState = function(cs) {
					cs.setPeriod(window.localStorage.defaultLineChartPeriod);
					var defaultConfig = UserConfig.getChartConfig('default');
					cs.setType(_.get(defaultConfig, ['type'], 'line'));

					var taTools = _.get(defaultConfig, ['analysisTool'], null) || {};
					Object.entries(taTools, function(taTool) {
						var tool = taTool[0];
						var toolConf = taTool[1];
						cs.setTechAnalysis(tool, toolConf);
					});

					if ($scope.initLastTimeFrame) {
						$scope.initLastTimeFrame();
					}

					cs.activate();
				}

				var cs = chartList[$scope.currency];
				if (cs)
				{
					initChartState(cs);
				} else {
					var c = $scope.currency;
					var inactive = chartList['inactive-' + c];

					if (inactive) {
						initChartState(inactive);
					} else {
						var waitForChart = window.setInterval(function() {
							var cs = chartList[$scope.currency];
							if (cs) {
								window.clearInterval(waitForChart);
								initChartState(cs);
							}
						}, 10);
					}

					if (inactive && $scope.isOnline && CandleData.isDataLoaded(c, inactive.period)) {
						console.error('found inactive instance for', c);
						inactive.activate();

						window.setTimeout(function() {
							if (!chartList[$scope.currency]) {
								console.log('chart failed to activate', c);
								ChartData.resetAll();
							}
						}, 2000);
					}
				}

				$rootScope.$broadcast('$$rebind::positions');
				$rootScope.$broadcast('$$rebind::curr', 'set currency');
				$rootScope.$broadcast('$$rebind::periodNotifier_' + $scope.currency);
			};

			$scope.toggleActivePair = function(pair, confirmed, disableSlideTo)
			{
				if(!$scope.user)
				{
					return;
				}

				if(window.isGoforex)
				{
					if(false && (!($rootScope.isUserPro || window.localStorage.isUserPro == 'true' || $scope.user.isUserPro)))
					{
						$rootScope.toggleAssetSelector();

						var resetButtons = [{
							text: $rootScope.t("Let's<br/>Go PRO"),
							onTap: function(e)
							{
								// close popup and open pro section
								iPopup.close();
								$timeout(function()
								{
									$state.go('tab.pro');
								});
							},
							type: 'button-green'
						},
						{
							text: $rootScope.t("OK"),
							onTap: function(e)
							{
								iPopup.close();
							},
							type: 'button-blue'
						}];

						var iPopup;
						iPopup = $ionicPopup.confirm({
							title: '',
							cssClass: 'popup-confirm popup-pro-asset',
							template: '<h2>' + $rootScope.t("Hey Trader,") + '</h2><p>' + $rootScope.t("the assets marked with <span class='icon-pro'></span>'PRO' exhibit higher volatility, a larger spread, and are generally more challenging to trade. If you can profit from trading these, you truly have what it takes to be a PRO trader.") + '</p>',
							buttons: resetButtons
						});

						IonicClosePopupService.register(iPopup);

						return;
					}
				}

				if(!OnlineStatus.is())
				{
					return;
				}

				var Battle = getBattle();

				if ($rootScope.isCompare) {
					$rootScope.trackEvent('TA', 'Enable_compare');
					$rootScope.toggleTA(2, pair);
					$rootScope.toggleAssetSelector(true);

					if (!MarketStatus.isOpen(pair)) {
						// zoom out to avoid broken comparison line
						$scope.setPeriod(6);
					}

					return;
				}

				if (window.appConfig.customActivePairsHandler) {
					return window.appConfig.customActivePairsHandler($scope, pair, confirmed);
				}

				// Checks active asset count in activePairs, if there's only one asset currently active then don't allow to remove it.
				var min = 1;
				if($scope.activePairs.indexOf('BATTLE') >= 0)
				{
					min++;
				}
				if($scope.activePairs.indexOf('HISTORY') >= 0)
				{
					min++;
				}

				if($scope.activePairs.length <= min && $scope.isPairActive(pair) && !(pair == 'BATTLE' || pair == 'HISTORY'))
				{
					$ionicPopup.confirm({
						title: $scope.t('Warning'),
						cssClass: 'popup-confirm',
						template: $scope.t('You must have atleast one trading asset in the list. (If you don\'t trade at least one asset, are you even a trader?)'),
						buttons: [{
							text: $scope.t('OK'),
							type: 'button-positive'
						}]
					})

					return;
				}

				var exitToggling = false;

				// if position is opened, then ask if the user wants to close the position and return the function. If the user agrees from the popup,
				// then call toggleActivePair again, this time skipping this if statement.
				if($scope.user && $scope.user.positions && Mongo.getPosition(pair) && pair != 'BATTLE' && !confirmed)
				{
					// if something happens and an opened position asset gets disabled, user will be able to enable it without the popup which offers to close the position
					if($scope.user.positions && Mongo.getPosition(pair) && $scope.user.activePairs.indexOf(pair) == -1)
					{
						$scope.toggleActivePair(pair, true);
						return;
					}

					$ionicPopup.confirm({
						title: $scope.t('Warning'),
						cssClass: 'popup-confirm',
						template: $scope.t('To remove an asset from the trading list, please close the position.'),
						buttons: [{
							text: $scope.t('CLOSE NOW'),
							onTap: function(e)
							{
								return 'closePosition';
							},
							type: 'button-positive'
						},
						{
							text: $scope.t('CANCEL'),
							onTap: function(e)
							{
								return 'return';
							},
							type: 'button-negative'
						}]
					})
					.then(function(res) {
						if(res == 'return')
						{
							exitToggling = true;
						}
						else
						{
							exitToggling = false;
							$scope.closePosition(pair);
							$scope.toggleActivePair(pair, true);
						}
					});

					return;
				}

				// check if battle is ongoing, if it is, open popup saying, that this cannot be hidden unless the battle is over. return function.
				if(pair == 'BATTLE' && $scope.user.battleId && $scope.isPairActive('BATTLE'))
				{
					$ionicPopup.confirm({
						title: $scope.t('Warning'),
						cssClass: 'popup-confirm',
						template: $scope.t('You can\'t remove the battle from the trading list while it\'s ongoing.  Go finish it!'),
						buttons: [{
							text: $scope.t('OK'),
							type: 'button-positive'
						}]
					})

					return;
				}

				if(exitToggling)
				{
					return;
				}

				if(pair == 'BATTLE')
				{
					if($scope.battleDisabled == false)
					{
						$scope.battleDisabled = true;
					}
					else
					{
						$scope.battleDisabled = false;
					}

					$timeout(function()
					{
						Mongo.setActivePairs($scope.activePairs);
					});

					$timeout(function()
					{
						getBattle().updateSwiperBattle($scope);
						Mongo.setBattleDisabled($scope.battleDisabled || false);
					});
				}

				// checking if pair exists in active assets
				var pairIndex = $scope.activePairs.indexOf(pair);

				if(pairIndex >= 0)
				{
					$scope.activePairs.splice(pairIndex, 1);
				}
				else
				{
					if(pair)
					{
						$scope.activePairs.push(pair);

						if(pair != 'BATTLE' && !disableSlideTo)
						{
							$timeout.cancel(slideT);
							var slideT = $timeout(function()
							{
								if (!window.appConfig.disableAssetSwiper) {
									$scope.swiper.slideTo($scope.swiper.slides.length - 1, 0);
								}
							});
						}
					}
				}

				$scope.pairs = _.uniq($scope.activePairs);
				window.localStorage.activePairs = JSON.stringify($scope.pairs);
				$rootScope.$broadcast('$$rebind::curr', 'active pair toggle');

				$timeout.cancel(updateSetPairsT);
				var updateSetPairsT = $timeout(function()
				{
					$scope.swiper.update();
					Mongo.setActivePairs($scope.activePairs);
				});
			};

			var transStartTime = null;
			var defLossLimit = window.appConfig.defLossLimit;
			var defProfitLimit =  window.appConfig.defProfitLimit;

			$scope.startTransaction = function(currency, type, event)
			{
				if ($scope.positionClosing && $scope.positionClosing[currency])
				{
					return;
				}

				// sometimes its not clearing itself when openPosition finishes
				if($scope.positionOpening && $scope.positionOpening[currency])
				{
					$scope.positionOpening[currency] = false;
				}

				Mongo.getCached(function(user)
				{
					$scope.user = user;

					transStartTime = DateNow();

					if($scope.tempStopLoss && (!$scope.tempStopLoss.loss || !$scope.tempStopLoss.profit))
					{
						$scope.tempStopLoss.loss = defLossLimit;
						$scope.tempStopLoss.profit = 0;
					}

					let posData = Mongo.getPosition(currency);
					if ($scope.user.positions && posData)
					{
						if(event == 'manualClick')
						{
							$rootScope.stoplossTooltipEnabled = false;
							window.localStorage.stoplossTooltipSeen = true;
						}

						$scope.trackEvent("Trade", "Stop loss", "open");
						$scope.tempStopLoss.loss = posData.lossLimit || defLossLimit;
						$scope.tempStopLoss.profit = posData.profitLimit || defProfitLimit;
					}
					else
					{
						$scope.trackEvent("Trade", "Buy/sell", "open");
					}

					$scope.transStarted = type;

					if(currency == $scope.currency)
					{
						Trading.setState('transStarted', true);
					}

					$timeout(function()
					{
						$scope.updateFormattedStoploss();
						$scope.updatePositionValue(currency);
						$rootScope.$broadcast('$$rebind::curr', 'start transaction');
					});
				}, function(err)
				{
					Mongo.get(function(user)
					{
						$scope.user = user;
						$timeout(function()
						{
							$scope.startTransaction(currency, type, event);
						}, 500);
					});
				});
			};

			$scope.cancelTransaction = function(currency)
			{
				if (window.isGoforex && $rootScope.getAssetSelectorState())
				{
					return;
				}

				Mongo.getCached(function(user)
				{
					$scope.user = user;

					if (DateNow() - transStartTime < 500)
					{
						return;
					}

					if ($scope.user.positions && Mongo.getPosition(currency))
					{
						$scope.trackEvent("Trade", "Stop loss", "close");
					}
					else
					{
						$scope.trackEvent("Trade", "Buy/sell", "close");
					}

					$scope.transStarted = null;
					Trading.setState('transStarted', false);
				});
			};

			var menuInstruments = {};
			$scope.menuInstrumentRate = {};

			var updateMenu = function(forceUpdate)
			{
				if (!$scope.isActive || $scope.assetSelectorState)
				{
					return;
				}

				if (!this.idx)
				{
					this.idx = 0;
				}
				this.idx++;

				if (window.appConfig.enableBattles) {
					getBattle().updateSwiperBattle($scope);
				}

				if (_.isEmpty(menuInstruments) || forceUpdate)
				{
					var index = 0;
					_.each(document.querySelectorAll('#instrument-buttons .swiper-slide'), function(button)
					{
						var ins = button.className.match(/asset\-([A-Z]{6,7})/);
						menuInstruments[ins[1]] = angular.element(button);
						button.index = index++;
					});
				}

				_.each(menuInstruments, function(button, ins)
				{
					if ($scope.currency == ins)
					{
						button.addClass('active button-calm');
					}
					else
					{
						button.removeClass('active button-calm');
					}

					if (('BATTLE' != ins) && ('HISTORY' != ins))
					{
						if($scope.user && $scope.user.positions && $scope.user.positions[ins])
						{
							$scope.updateSymbolColor(ins);
						}
					}

					if ('BATTLE' != ins)
					{
						var p = Mongo.getPosition(ins);
						// console.log(p, $scope.positionValue[ins]);
						if (window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).tradingQuizes == true && $scope.bonus && $scope.bonus.ready && $scope.bonus.ready[ins] && window.currentLang == 'en' && $scope.user && $scope.user.positions && !Mongo.getPosition(ins))
						{
							button.addClass('button-balanced');
						}
						else
						{
							button.removeClass('button-balanced');
						}

						if (p && ($scope.positionValue[ins] >= 0))
						{
							// console.log('perf-up addClass');
							button.addClass('perf-up');
						}
						else if(p && ($scope.positionValue[ins] < 0))
						{
							// console.log('perf-up removeClass');
							button.removeClass('perf-up');
						}
						else
						{
							// console.log('perf-up removeClass');
							button.removeClass('perf-up');
							var sym = SymbolData.getSymbol(ins);
							var rate = sym ? sym.mid : 0;
							if (_.isNumber(rate))
							{
								rate = $rootScope.formatRate(rate);
							}
							$timeout(function()
							{
								$scope.menuInstrumentRate[ins] = rate;
							});
						}

						var marketOpen = $scope.isMarketOpen(ins);
						if(!marketOpen)
						{
							button.addClass('market-closed');
						}
						else
						{
							button.removeClass('market-closed');
						}
					}
					else
					{
						if (!!$scope.battle)
						{
							button.addClass('battle-started');
						}
						else
						{
							button.removeClass('battle-started');
						}

						if ($scope.user && $scope.user.finishedBattle)
						{
							button.addClass('battle-completed');
						}
						else
						{
							button.removeClass('battle-completed');
						}

						if ($scope.user && $scope.user.finishedBattle && $scope.user.finishedBattle.isWin)
						{
							button.addClass('win');
						}
						else
						{
							button.removeClass('win');
						}
					}
				});
			};

			window.updateMenu = updateMenu;

			$scope.updateStopLoss = function(currency)
			{
				Mongo.getCached(function(user)
				{
					$scope.user = user;

					if(!$scope.user || !$scope.user.positions)
					{
						return;
					}

					var pos = Mongo.getPosition(currency);
					if(!pos)
					{
						return;
					}

					var update = function(type, limit)
					{
						var up = true;

						var pct = limit;
						var origLimit = limit;

						// todo - Goforex only?
						if(pct == null)
						{
							pct = 100;
						}

						pct = parseFloat(pct);

						if (!pos.amount)
						{
							return;
						}

						limit = pos.quant / 100 * limit;
						// limit = Math[limit < 0 ? 'floor' : 'ceil'](limit);

						if ('loss' == type)
						{
							limit = limit * -1;
							up = !up;
						}

						if ('sell' == pos.type)
						{
							limit = limit * -1;
							up = !up;
						}

						if (currency.substr(0, 3) == 'USD')
						{
							up = !up;
						}

						// goforex? if (pct == 0)
						if(window.isGoforex)
						{
							if (pct == 0)
							{
								StopLoss.remove(currency, up ? 'up' : 'down');
							}
							else
							{
								var sellRate = calculateStopLossPrice(pos, origLimit, type);

								StopLoss.set(currency, up ? 'up' : 'down', sellRate);
							}
						}
						else
						{
							if ((pct > 99) && ('profit' == type))
							{
								StopLoss.remove(currency, up ? 'up' : 'down');
							}
							else
							{
								var sellRate = calculateStopLossPrice(pos, origLimit, type);

								StopLoss.set(currency, up ? 'up' : 'down', sellRate);
							}
						}

						return pct;
					};

					var stopLossPreUpdate = {
						lossLimit: $scope.tempStopLoss.loss,
						profitLimit: $scope.tempStopLoss.profit
					};

					if(!window.isGoforex)
					{
						if(stopLossPreUpdate.profitLimit > 99)
						{
							stopLossPreUpdate.profitLimit = null;
						}
					}

					var stopLossUpdate = {
						lossLimit: update('loss', stopLossPreUpdate.lossLimit),
						profitLimit: update('profit', stopLossPreUpdate.profitLimit)
					};

					Mongo.updatePosition(currency, stopLossUpdate);
				});
			};

			$scope.openPosition = function(type, currency)
			{
				if(!$scope.positionOpening)
				{
					$scope.positionOpening = {};
				}

				// resetting this, because sometimes you can click close position button after it's 'closed', after the popup and then this gets stuck
				if($scope.positionClosing && $scope.positionClosing[currency])
				{
					$scope.positionClosing[currency] = false;
				}

				if ($scope.positionOpening[currency]) {
					return;
				}

				$scope.positionOpening[currency] = true;
				Mongo.getCached(function(user)
				{
					$scope.user = user;

					if (Mongo.getPosition(currency))
					{
						$scope.positionOpening[currency] = false;
						return;
					}

					$scope.trackEvent("Trade", "Open position", $scope.currency);

					var amounts = $scope.getAvailableCashAmounts(user);
					var posAmount = amounts[$scope.posAmount];
					posAmount = posAmount.amount || posAmount[0];
					if (!posAmount) {
						posAmount = amounts[amounts.length - 1];
					}

					var leverages = $scope.getLeverages(currency);
					var posLeverage = leverages[$scope.posLeverage];
					if (!posLeverage) {
						posLeverage = leverages[leverages.length - 1];
					}

					if (($scope.user.cash < posAmount) && (posAmount > 1))
					{
						$scope.positionOpening[currency] = false;
						return;
					}

					var symbol = $scope.sym(currency);
					var price = symbol[type == 'sell' ? 'bid' : 'ask'];

					// positions are opened at mid price, both buy and sell
					price = symbol.mid;

					var size = posAmount * posLeverage;

					var spread = (symbol.ask - symbol.bid) / 2;
					var breakEven = price + (spread * (type == 'sell' ? -1 : 1));

					if (currency.substr(0, 3) == 'USD')
					{
						var quant = size * price;
						type = (type == 'sell') ? 'buy' : 'sell';
					}
					else
					{
						var quant = size / price;
					}

					var position = {
						pair: currency,
						type: type,
						price: price,
						breakEven: breakEven,
						amount: posAmount,
						leverage: posLeverage || 1,
						quant: quant,
						size: size,
						lossLimit: null,
						profitLimit: null,
						spread: spread,
						openX: Math.ceil(ChartData.getLastX(currency)) + 1,
						date: new Date().getTime()
					};

					$scope.positionAlert = position;

					$scope.formattedStopLossProfit = Math.max(1, Math.ceil(Math.abs(position.amount * 100 / 100)));
					$scope.formattedStopLossLoss = Math.max(1, Math.ceil(Math.abs(position.amount * 100 / 100)));
					$scope.formattedProcentStopLoss = {profit: 0, loss: 0};
					$scope.tempStopLoss = {profit: 0, loss: 0};

					Mongo.openPosition(currency, position).then(function(response)
					{
						if(window.isGoforex)
						{
							if(posLeverage == $scope.getLeverages()[0])
							{
								$scope.maxLeverageUnblocked = false;
								window.localStorage.maxLeverageUnblocked = false;
								// defaulting to a lower leverage
								$scope.posLeverage = 1;
							}

							if($scope.cashAmounts.findIndex(o => o.amount === posAmount) == 0)
							{
								$scope.maxAmountUnblocked = false;
								window.localStorage.maxAmountUnblocked = false;
								// defaulting to a lower amount
								$scope.posAmount = 1;
							}
						}

						$scope.positionOpening[currency] = false;
						Mongo.updateBreakdown();

						if (isBattleEnabled)
						{
							getBattle().openPosition($scope, position);
						}
					}).catch(function(err) {
						$scope.positionOpening[currency] = false;
						console.log('Could not open position', err);
					});
				}, function(err) {
					$scope.positionOpening[currency] = false;
				});
			};

			$scope.closePosition = function(currency, stopLossRate)
			{
				if(!$scope.positionClosing)
				{
					$scope.positionClosing = {};
				}

				if ($scope.positionClosing[currency])
				{
					return;
				}

				if(!$scope.user)
				{
					return;
				}

				var currentCash = $scope.user.cash;

				$scope.positionClosing[currency] = true;
				window.userErrorTimeout = $timeout(function()
				{
					$timeout.cancel(window.userErrorTimeout);
					console.log('there might be an error in positionClosing?');
					$scope.positionClosing[currency] = false;
					Mongo.get(function(user)
					{
						$rootScope.$broadcast('resetting-user-data', user);
					});
				}, 5000);

				var processClose = function(price) {
					$scope.trackEvent("Trade", "Close position", $scope.currency);

					var thisPos = JSON.parse(JSON.stringify(Mongo.getPosition(currency)));
					thisPos.openPrice = thisPos.price;
					var closePrice = Mongo.getPositionPrice(currency, stopLossRate);
					thisPos.closePrice = closePrice;
					thisPos.isStopLoss = !!stopLossRate;

					var value = Mongo.positionCashValue(currency, price);

					thisPos.spread = CanvasJS.formatNumber(Math.abs(thisPos.spread), "0.00#######");

					$scope.positionAlert = thisPos;
					$scope.tradeValue = value - $scope.positionAlert.amount;
					$scope.positionAlert.price = Mongo.getPositionPrice(currency, price);
					$scope.positionAlert.pair = currency;
					$scope.positionAlert.positionTime = (new Date().getTime() - thisPos.date) / 1000;

					if ('USD' == currency.substr(0, 3))
					{
						$scope.positionAlert.totalAmount = $scope.positionAlert.quant / $scope.positionAlert.price;
					}
					else
					{
						$scope.positionAlert.totalAmount = $scope.positionAlert.quant * $scope.positionAlert.price;
					}

					if (isBattleEnabled)
					{
						getBattle().closePosition($scope, currency);
					}

					var thisPosValue = $scope.tradeValue;

					$scope.closePositionCallback(currency);

					if(window.chart && window.chart.scope && !window.chart.scope.isMultipleTimeframesVisible())
					{
						window.chart.scope.reset();
					}

					Mongo.deletePosition(currency, $scope.tradeValue).then(function(response)
					{
						// todo - should be done from backend
						Mongo.addTradeHistoryRecord(thisPos, thisPosValue);

						if(window.isOtherApp)
						{
							// add tradeRecord locally to scope.history
							if(formatHistoryTrade)
							{
								if(!$scope.history)
								{
									$scope.history = [];
								}

								var positionToAdd = formatHistoryTrade(thisPos, thisPosValue);
								$scope.history.unshift(positionToAdd);
							};
						}

						$scope.positionClosing[currency] = false;

						$scope.user.positions = response.data;

						//sometimes websocket update does not catch up or something, idk
						//scope.user.positions is updated manually just in case above already, lets try updating user.cash as well
						if($scope.user.cash != (currentCash + $scope.positionAlert.amount + $scope.tradeValue))
						{
							$scope.user.cash = currentCash + $scope.positionAlert.amount + $scope.tradeValue;
						}

						// needs fixing/changing
						if (isBonusQuestionsEnabled && 0)
						{
							getBonusQuestions().closePosition($scope);
						}

						// todo - remove stoploss from backend
						StopLoss.remove(currency, 'up');
						StopLoss.remove(currency, 'down');

						Mongo.updateBreakdown();
						$timeout.cancel(window.userErrorTimeout);
					}).catch(function(err) {
						// failed request should be retried automatically until it succeeds
						// $scope.positionClosing[currency] = false;
						console.log(err);
					});
				}

				Mongo.getCached(function(user)
				{
					$scope.user = user;

					if (!$scope.user.positions || !Mongo.getPosition(currency))
					{
						$scope.positionClosing[currency] = false;
						return;
					}

					if ((typeof stopLossRate !== 'undefined') && (stopLossRate > 0))
					{
						processClose(stopLossRate);
					}
					else
					{
						var sym = SymbolData.getSymbol(currency);

						var verifyRateAndClose = function(sym)
						{
							var closePrice = Mongo.getPositionPrice(currency);
							var price = sym.mid;

							var pct = (Math.abs(price - closePrice) / Math.min(price, closePrice)) * 100;
							if (pct > 2)
							{
								console.error(pct, '% price difference from the actual price');
								$scope.positionClosing[currency] = false;
								return;
							}

							processClose(closePrice);
						};

						if (sym && sym.mid) {
							verifyRateAndClose(sym);
						}
					}
				});
			};

			$scope.undoTransaction = function(currency) {
				var processUndo = function() {
					var thisPos = Mongo.getPosition(currency);

					if (Date.now() - thisPos.date > 5 * 3600 * 1000) {
						return;
					}

					thisPos.openPrice = thisPos.price;
					thisPos.length = 1;
					thisPos.isUndo = true;
					thisPos.closePrice = Mongo.getPositionPrice(currency);

					Mongo.deletePosition(currency, 0).then(function(response)
					{
						Mongo.addTradeHistoryRecord(thisPos, 0);

						$rootScope.settings.lastUndo = Date.now();
						Mongo.update({settings: $rootScope.settings});
					});
				};

				if (getAds()) {
					getAds().show('undo', function() {
						processUndo();
					});
				} else {
					processUndo();
				}
            };

            var currContainer = null;
            $scope.updateSymbolColor = function(ins)
            {
                if (ins && (ins != $scope.currency))
                {
                    var currToUpdate = ins;
                }
                else
                {
                    return;
                }

                var sym = $scope.sym(currToUpdate);

                if (!sym)
                {
                    return;
                }

                if (_.get($scope.user, ['positions', currToUpdate]))
                {
                    $scope.positionValue[currToUpdate] = Mongo.positionValue(currToUpdate);
                    $scope.positionPctValue[currToUpdate] = Mongo.positionPctValue(currToUpdate);

                    $rootScope.$broadcast('$$rebind::positionValue');
                }

                if (!currContainer || !currContainer.length)
                {
                    currContainer = angular.element(document.getElementById('currency-container'));
                }

                var currency = $scope.currency;
                var color = ((!$scope.user || !$scope.user.positions || !Mongo.getPosition(currency)) && (sym.chg < 0) || ($scope.user && $scope.user.positions && Mongo.getPosition(currency) && ($scope.positionValue[currency] < 0))) ? 'down' : 'up';

                if (currContainer[0] && (currContainer[0].className.indexOf(color) == -1))
                {
                    currContainer.removeClass(color == 'up' ? 'down' : 'up');
                    currContainer.addClass(color);
                }
            };

            $scope.getContractSize = function(currency)
            {
                if($scope.categories[3].instruments.indexOf(currency) > -1 || $scope.categories[5].instruments.indexOf(currency) > -1)
                {
                    return "";
                }
                else if(currency == "SHIUSD")
                {
                    return "10,000";
                }
                else
                {
                    return "1";
                }
            };

            $scope.getSymbolHalfs = function(currency)
            {
                if (!$scope.assetCats) {
                    $scope.assetCats = {};
                    for (var i=1; i < $scope.categories.length; i++) {
                        var cat = $scope.categories[i];
                        for (var k=0; k < cat.instruments.length; k++) {
                            $scope.assetCats[cat.instruments[k]] = cat.name;
                        }
                    }
                }

                var assetCat = $scope.assetCats[currency];
                var parts = [];
                if(assetCat == 'Forex')
                {
                    parts = $scope.symbolNames[currency].split('/');
                }
                else if(assetCat == 'Stocks')
                {
                    var currencyPart = currency.substr(3);
                    parts = ['SHARE', currencyPart];
                }
                else if(assetCat == 'Commodities')
                {
                    if(currency == 'OILUSD')
                    {
                        parts = ['BARREL', 'USD'];
                    }
                    else if(currency == 'GASUSD')
                    {
                        parts = ['MMBtu', 'USD'];
                    }
                    else if(["COPUSD", "PLDUSD", "PLAUSD", "XAGUSD", "XAUUSD"].indexOf(currency) >= 0)
                    {
                        parts = ['TROY OUNCE', 'USD'];
                    }
                    else if(["WHEUSD", "SUGUSD", "COTUSD"].indexOf(currency) >= 0)
                    {
                        parts = ['CONTRACT', 'USD'];
                    }
                    else
                    {
                        parts = [$scope.symbolNames[currency].toUpperCase(), 'USD'];
                    }
                }
                else if(assetCat == 'Index' || assetCat == 'Crypto')
                {
                    if(currency == "GEREUR")
                    {
                        parts = ['GER30', 'EUR'];
                    }
                    else
                    {
                        parts = [$scope.symbolNames[currency].toUpperCase(), 'USD'];
                    }
                }
                else
                {
                    // not assigned
                    parts = ['USD', 'USD'];
                }
                if (1 == parts.length) {
                    parts.push('USD');
                }
                return parts;
            };

			var bindElements = [];
			var updateBindRates = function()
			{
				if (!bindElements.length)
				{
					bindElements = document.getElementsByClassName('bind-rate');
				}

				_.each(bindElements, function(el)
				{
					if (!el.bind)
					{
						el.bind = angular.element(el).attr('bind');
					}

					var value = $scope[el.bind];

					if (value) {
						el.innerHTML = value;
					}
				});

				self.setState('rate-loaded', !!$scope.formattedMid);
			};

			$scope.updateBindRates = updateBindRates;

			$scope.lastValue = 0;
			$scope.updatePositionValue = function(currency, price)
			{
				var sym = SymbolData.getSymbol(currency);
				if (!sym)
				{
					$scope.formattedMid = $scope.symbol ? $rootScope.formatRate($scope.symbol.mid) : '';
					$scope.formattedAsk = $scope.formattedMid;
					$scope.formattedBid = $scope.formattedMid;

					if (currency == $scope.currency)
					{
						updateBindRates(currency);
					}

					return;
				}

				if(!sym.spread)
				{
					sym.spread = SymbolData.getSpread(currency);
				}

				if((!sym.ask || !sym.bid) && !price)
				{
					console.log('!sym.ask or bid');
					return;
				}

				if(!price)
				{
					if(sym.prev)
					{
						var price = sym.prev;
					}
					else if(sym.mid)
					{
						var price = sym.mid;
					}
					else if ($scope.symbol && $scope.symbol.mid) {
						var price = $scope.symbol.mid;
					}
					else
					{
						var price = (sym.ask + sym.bid) / 2;
					}
				}

				if ($scope.user)
				{
					$scope.lastValue = sym.bid;
					self.setState('closing-rate-loaded', !$scope.isOpen && $scope.isOnline);
				}

				var position = _.get($scope.user, ['positions', currency]);
				if (position)
				{
					if (currency == $scope.currency)
					{
						$scope.currentDynamicPrice = price;
						$scope.positionValue[currency] = Mongo.positionValue(currency);
						$scope.positionPctValue[currency] = Mongo.positionPctValue(currency);
						$scope.formattedPositionChange = CanvasJS.formatNumber(Math.abs($scope.positionValue[currency]), '$0.00');

						var v = $scope.positionPctValue[currency];
						var stopLossV = Math[v > 0 ? 'ceil' : 'floor'](v * 2) / 2;
						$scope.minStopLoss[currency] = [Math.abs(Math.min(stopLossV, -0.5)), Math.max(stopLossV, 0.5)];

						self.setState('win', $scope.positionValue[currency] >= 0);
						self.setState('loss', $scope.positionValue[currency] < 0);
						$rootScope.$broadcast('$$rebind::positionValue');

						var sinceOpening = Math.floor((Date.now() - position.date) / 1000);
						var timeLeft = (1 * 3600) - sinceOpening;

						var padZero = function(str)
						{
							return ('0' + str.toString()).substr(-2);
						};

						$scope.isUndoEnabled = timeLeft > 0;

						var last = $scope.user.settings.lastUndo;
						if (last) {
							var sinceLast = Math.floor((Date.now() - last) / 1000);
							if (sinceLast < 86400) {
								timeLeft = 86400 - sinceLast;

								$scope.isUndoEnabled = false;
							}
						}

						if (timeLeft > 0) {
							var hrs = Math.floor(timeLeft / 3600);
							$scope.undoCountdown = padZero(hrs) + ':' + padZero(Math.floor((timeLeft - (3600 * hrs)) / 60)) + ':' + padZero(timeLeft % 60);
						} else {
							$scope.undoCountdown = 'Expired';
						}

						var button = $scope.menuInstruments ? $scope.menuInstruments[currency] : null;
						if (button) {
							if (($scope.positionValue[currency] >= 0))
							{
								button.addClass('perf-up');
							}
							else
							{
								button.removeClass('perf-up');
							}
						}
					}
					else
					{
						$scope.positionValue[currency] = Mongo.positionValue(currency);
						$scope.positionPctValue[currency] = Mongo.positionPctValue(currency);
					}
				}

				if (currency == $scope.currency)
				{
					if ($scope.updateSymbolColor)
					{
						$scope.updateSymbolColor();
					}

					// digest cycle doesn't seem to run at all...?
					$scope.formattedBid = $rootScope.formatRate(price + sym.spread);
					$scope.formattedAsk = $rootScope.formatRate(price - sym.spread);
					$scope.formattedMid = $rootScope.formatRate(price);

					if (!$scope.formattedMidGhost || ($scope.formattedMid.length >= $scope.formattedMidGhost.length)) {
						$scope.formattedMidGhost = $scope.formattedMid + '.';
					}

					updateBindRates();

					$rootScope.$broadcast('$$rebind::symbolPrice');

					if ($scope.user && ($scope.transStarted || !_.keys($scope.cashAmounts).length))
					{
						if ($scope.getAvailableCashAmounts)
						{
							$scope.cashAmounts = $scope.getAvailableCashAmounts($scope.user);
						}
					}
				};
			};

			function calculateStopLossPrice(pos, newLimit, a)
			{
				// if(a == 'loss')
				// {
				// 	var limit = pos.lossLimit;
				// }
				// else if(a == 'profit')
				// {
				// 	var limit = pos.profitLimit;
				// }
				// else
				// {
				// 	return false;
				// }

				var limit = newLimit;

				if ($scope.currency.substr(0, 3) == 'USD')
				{
					var cost = pos.quant / pos.price;
				}
				else
				{
					var cost = pos.quant * pos.price;
				}

				var up = true;
				var pct = limit;

				if (!pos.amount)
				{
					return false;
				}

				limit = pos.amount / 100 * limit;
				// limit = Math[limit < 0 ? 'floor' : 'ceil'](limit);

				if ('loss' == a)
				{
					limit = limit * -1;
					up = !up;
				}

				if ('sell' == pos.type)
				{
					limit = limit * -1;
					up = !up;
				}

				if ($scope.currency.substr(0, 3) == 'USD')
				{
					up = !up;
				}

				if ((pct > 99) && ('profit' == pos.type))
				{
					return false;
				}
				else
				{
					if ($scope.currency.substr(0, 3) == 'USD')
					{
						var rate = 1 / ((cost + limit) / pos.quant);
					}
					else
					{
						var rate = (cost + limit) / pos.quant;
					}

					return rate;
				}
            }

            $scope.stopLoss = function(currency, pct)
            {
                if (!$scope.user || !$scope.user.positions)
                {
                    return;
                }

                var pos = Mongo.getPosition(currency);
                if (!pos)
                {
                    return;
                }

                var amount = pos.amount * pct / 100;

                $scope.formattedProcentStopLoss.profit = $scope.tempStopLoss.profit;
                $scope.formattedProcentStopLoss.loss = $scope.tempStopLoss.loss;

                return amount;
            };

            $scope.changeStopLoss = function(a, b, min)
            {
                if(b == 'decrease')
                {
					if(window.isGoforex)
					{
						var v = $scope.positionPctValue[$scope.currency];
						var stopLossV = Math[v > 0 ? 'ceil' : 'floor'](v * 2) / 2;
						min = [Math.abs(Math.min(stopLossV, -0.5)), Math.max(stopLossV, 0.5)];

						if(a == 'profit')
						{
							if($scope.tempStopLoss[a] > min[1])
							{
								$scope.tempStopLoss[a] = parseFloat($scope.tempStopLoss[a]) - 0.5;
							}
							else
							{
								$scope.tempStopLoss[a] = 0;
							}
						}
						else
						{
							if($scope.tempStopLoss[a] > min[0])
							{
								$scope.tempStopLoss[a] = parseFloat($scope.tempStopLoss[a]) - 0.5;
							}
							else
							{
								$scope.tempStopLoss[a] = 0;
							}
						}
					}
					else
					{
						$scope.tempStopLoss[a] = ($scope.tempStopLoss[a] >= min) ? parseFloat($scope.tempStopLoss[a]) - 0.5 : min;
					}
                }
                else if(b == 'increase' && $scope.tempStopLoss[a] < 100)
                {
                    $scope.tempStopLoss[a] = ($scope.tempStopLoss[a] >= min) ? parseFloat($scope.tempStopLoss[a]) + 0.5 : min;
                }

                $scope.updateFormattedStoploss();
            };

			$scope.shareStreak = function()
			{
				var root = 'https://financeillustrated.com/share/';
				var params = root + 'image.php?streak=' + encodeURIComponent($scope.user.streak) + '&profit=' + encodeURIComponent($scope.tradeValue) + '&msg=' + encodeURIComponent($scope.shareMsg);

				var options = {
					method: "share",
					caption: window.appConfig.appName,
					href: params,
					picture: params,
				};

				facebookConnectPlugin.showDialog(options, function(success) { }, function(failure) {  })
			};

			window.clearInterval(window.afterUserLoaded);
			window.afterUserLoaded = window.setInterval(function()
			{
				if($scope.user && $scope.currency && $scope.user.positions && Mongo.getPosition($scope.currency))
				{
					if($scope.currency)
					{
						if($scope.user.positions)
						{
							if(Mongo.getPosition($scope.currency))
							{
								let posDataForStoploss = Mongo.getPosition($scope.currency);
								$scope.tempStopLoss.loss = posDataForStoploss.lossLimit;
								$scope.tempStopLoss.profit = posDataForStoploss.profitLimit;
								// $scope.updateStopLoss();
								$scope.updateFormattedStoploss();
							}
						}
					}
					window.clearInterval(window.afterUserLoaded);
				}
			}, 100);

            $interval.cancel(window.setsCurrencyI);
            window.setsCurrencyI = $interval(function()
            {
                if($scope.assetSelectorState)
                {
                    return;
                }

                $scope.setCurrency($scope.currency);
            }, 1000, 10);

			$scope.renderCallback = function(scope, onlyRegisterScope)
			{
				// $scope.updatePositionValue($scope.currency);

				if (onlyRegisterScope) {
					chartList['inactive-' + scope.currency] = scope;
					return;
				}

				chartList[scope.currency] = scope;

				if (scope.symbol != $scope.currency) {
					// console.error('Expected', $scope.currency, ' got ', scope.symbol);
					$scope.setCurrency(scope.symbol);
					return;
				}

				ChartHelper.prepareTextCacheOnce();

				var pos = Mongo.getPosition(scope.currency);

				var chart = scope.getChart();
				var ctx = chart.ctx.canvas.getContext("2d");
				var xAxis = scope.getXAxis();
				var yAxis = scope.getYAxis();
				var size = VMin(2.5);
				var cs = scope;
				var color = '#4b9e6a';

				if (!yAxis || !xAxis) {
					console.log('axis instance missing');
					return;
				}

				var postpone = [];

				if (pos && pos.openX)
				{
					if (xAxis)
					{
						var yAxis = chart.axisY2[0] || chart.axisY[0];

						var isGreen = pos.type == 'buy';
						if (pos.pair.substr(0, 3) == 'USD')
						{
							isGreen = !isGreen;
						}

						var breakEvenOnGraph = pos.breakEven + (SymbolData.getPositionSpread(scope.currency));

						var yBreakEven = yAxis.convertValueToPixel(breakEvenOnGraph);
						if(isGreen)
						{
							color = '#4b9e6a';
						}
						else
						{
							color = '#d83c41';
						}

						// reverse colors if pair starts with 'USD', cuz pos.type gets reversed
						if(pos.type == 'buy')
						{
							var sideLabelColor = '#4b9e6a';

							if(pos.pair.substr(0, 3) == 'USD')
							{
								var sideLabelColor = '#d83c41';
							}
						}
						else
						{
							var sideLabelColor = '#d83c41';

							if(pos.pair.substr(0, 3) == 'USD')
							{
								var sideLabelColor = '#4b9e6a';
							}
						}

						// horizontal line
						if(window.isOtherApp)
						{
							ChartHelper.drawSolidCustomLine(ctx, 0, yBreakEven, canvasWidth, yBreakEven, sideLabelColor, 1, 1);
						}

						ChartHelper[window.appConfig.positionOpenLineFunc || ChartHelper.getRateLineFunction()](ctx, window.appConfig.positionOpenLineOffset || 0, yBreakEven, chart.x2, yBreakEven, sideLabelColor, 1, 1);

						// open position time
						var openX = scope.getPositionOpenX(pos);

						// draw stoploss
						if (!window.appConfig.disableStopLossLines) {
							var greenColor = "rgba(75, 158, 106, 0.5)";
							var redColor = "rgba(242, 98, 98, 0.5)";

							var iconSize = window.appConfig.stopLossIconSize || VMin(7);
							var iconLeft = window.appConfig.stopLossIconLeft || VMin(3.5);
							var func = window.appConfig.stopLossLineFunc || 'drawSolidCustomLine';

							if($scope.tempStopLoss['loss'] > 0 && $scope.tempStopLoss['loss'] <= 100)
							{
								var stopLossPrice = calculateStopLossPrice(pos, $scope.tempStopLoss['loss'], 'loss');
								var stopLossY = yAxis.convertValueToPixel(stopLossPrice);
								ChartHelper[func](ctx, 0, stopLossY, window.chart.x2, stopLossY, redColor, 1, 1);
								ChartHelper.drawIcon(iconLeft, stopLossY + (window.appConfig.stopLossIconYLoss || 0), 'close-if-loss', ctx, iconSize);
							}

							if($scope.tempStopLoss['profit'] > 0 && $scope.tempStopLoss['profit'] <= 100)
							{
								var stopProfitPrice = calculateStopLossPrice(pos, $scope.tempStopLoss['profit'], 'profit');
								var stopProfitY = yAxis.convertValueToPixel(stopProfitPrice);
								ChartHelper[func](ctx, 0, stopProfitY, window.chart.x2, stopProfitY, greenColor, 1, 1);
								ChartHelper.drawIcon(iconLeft, stopProfitY + (window.appConfig.stopLossIconYProfit || 0), 'close-if-profit', ctx, iconSize);
							}
						}

						// draw opening price icon and line
						if (openX && scope.isInView(openX))
						{
							var openXChart = xAxis.convertValueToPixel(openX);
							var openYChart = yAxis.convertValueToPixel(scope.getPositionOpenY(pos, openX));

							if(window.isOtherApp)
							{
								// vertical line from breakEven to openPrice
								// openXChart is wrong or yAxis.convertValueToPixel is wrong, or pos.price is wrong/not alligned with chart
								// ChartHelper.drawSolidCustomLine(ctx, openXChart, yBreakEven, openXChart, yAxis.convertValueToPixel(pos.price), (isGreen ? '#4b9e6a' : '#d83c41'), 1, 1);
							}
							else
							{
								ChartHelper[ChartHelper.getRateLineFunction()](ctx, openXChart, openYChart, openXChart, yBreakEven, (window.isOtherApp ? (isGreen ? greenColor : redColor) : color), 1, 1);
							}

							ChartHelper.drawIcon(openXChart, yBreakEven, (window.appConfig.chartPositionIconPrefix || '') + (isGreen ? 'position-up' : 'position-down'), ctx, window.appConfig.chartPositionIconSize || VMin(3));
						}

						// draw current price on left side and line
						postpone.push(function() {
							if(window.isGoforex)
							{
								// reverse colors if pair starts with 'USD', cuz pos.type gets reversed
								if(pos.type == 'buy')
								{
									var sideLabelColor = '#4b9e6a';

									if(pos.pair.substr(0, 3) == 'USD')
									{
										var sideLabelColor = '#d83c41';
									}
								}
								else
								{
									var sideLabelColor = '#d83c41';

									if(pos.pair.substr(0, 3) == 'USD')
									{
										var sideLabelColor = '#4b9e6a';
									}
								}

								ChartHelper.drawRateSideLabel(pos.breakEven, yBreakEven, sideLabelColor, ctx, scope, ChartHelper.getDefaultFont(), undefined, undefined, VMin(3), true);
							}
							else
							{
								ChartHelper.drawRateSideLabel(pos.breakEven, yBreakEven, (isGreen ? '#4b9e6a' : '#d83c41'), ctx, scope, ChartHelper.getDefaultFont(), undefined, undefined, VMin(3), true);
							}
						});
					}
				}
				/*
				else if (!pos && yAxis)
				{
					var data = scope.getData();

					if (data && data[2])
					{
						ChartHelper.drawLineLabel('BUY', yAxis.convertValueToPixel(data[2].dataPoints[0].y), '#ee586c', scope, ChartHelper.getLineLabelSize(), ChartHelper.getLineLabelOffset(), 1);
						ChartHelper.drawLineLabel('SELL', yAxis.convertValueToPixel(data[1].dataPoints[0].y) + (size * 1.75), '#81cab8', scope, ChartHelper.getLineLabelSize(), ChartHelper.getLineLabelOffset(), 40);
					}
				}
				*/

				if (isChartSocialTradeEnabled)
				{
					getChartSocialTrade().draw(scope.currency, ctx, cs.getChart().options.data[0].dataPoints, xAxis, yAxis);
				}

				// marker
				var cs = scope;
				if (lineChartMarkerCallback && cs.getPadding() && ('line' == cs.type))
				{
					var data = cs.getChart().options.data[0].dataPoints;
					if (!data)
					{
						cs.reset();
						return;
					}

					ctx.save();

					var last = data[data.length - 1];
					var markerX = Math.round(xAxis.convertValueToPixel(last.x));
					var markerY = yAxis.convertValueToPixel(last.y);

					var cache = cs.getLabelCache('y');
					var lastLabel = ((cache && cache[0]) ? cache[0] : label) || '';
					var label = (data[data.length - 1].y).toString();
					label = (label + (label.indexOf('.') > -1 ? '' : '.') + '00000').substr(0, lastLabel.length);

					lineChartMarkerCallback(ctx, markerX, markerY, label);

					ctx.restore();
				}

				// render side label of the actual rate
				if (('candlestick' == cs.type || 'line' == cs.type))
				{
					var pos = Mongo.getPosition(scope.currency);

					var sym = SymbolData.getSymbol(scope.currency);

					if (cs.isEnd)
					{
						var cd = cs.getChart().options.data;
						if (!cd) {
							return;
						}

						var data = cd[0].dataPoints;

						var last = data[data.length - 1];
					}

					var price = sym ? sym.mid : 0;

					if(scope.currency && price)
					{
						$scope.updatePositionValue(scope.currency);
					}

					var y = yAxis.convertValueToPixel(price);
					var color = window.appConfig.positionLineUpColor;

					var labelType = 'price';
					if (pos)
					{
						positionPositive = self.hasState('win');
						labelType = positionPositive ? 'up' : 'down';
					}

					// buy/sell lines first
					if (!pos && sym && (!window.appConfig || !window.appConfig.disableBuySellLines)) {
						var buyY = yAxis.convertValueToPixel(price + sym.spread);
						var sellY = yAxis.convertValueToPixel(price - sym.spread);
						ChartHelper.drawSpreadLine(ctx, 0, buyY, chart.x2, yAxis.convertValueToPixel(price + sym.spread), '#81cab8');
						ChartHelper.drawSpreadLine(ctx, 0, sellY, chart.x2, yAxis.convertValueToPixel(price - sym.spread), '#ee586c');
						ChartHelper.drawLineLabel(' BUY PRICE', buyY - (ChartHelper.getLineLabelSize() / 1), '#81cab8', scope, ChartHelper.getLineLabelSize(), 0, 1);
						ChartHelper.drawLineLabel(' SELL PRICE', sellY + (ChartHelper.getLineLabelSize() / 2), '#ee586c', scope, ChartHelper.getLineLabelSize(), 0, 40);
					}

					// solid line over all chart for the current y position of label
					if(pos)
					{
						if (!positionPositive) {
							ChartHelper.drawSolidCustomLine(ctx, 0, y, canvasWidth - 35, y, window.appConfig.positionLineDownColor, 0.33, 1);
						}
						else
						{
							ChartHelper.drawSolidCustomLine(ctx, 0, y, canvasWidth - 35, y, window.appConfig.positionLineUpColor, 0.33, 1);
						}
					}
					else
					{
						ChartHelper.drawSolidCustomLine(ctx, 0, y, canvasWidth - 35, y, window.appConfig.rateLineColor, 0.33, 1);
					}

					if (window.isGoforex) {
						var labelPos = ChartHelper.drawRateSideLabel('.', y, 'transparent', ctx, scope, window.appConfig.rateSideLabelFontFamily, null, 1, window.appConfig.rateSideLabelFontSize || 15, false, pos);
					} else {
						color = (sym && sym.pch >= 0) ? '#4b9e6a' : '#d83c41';

						if (!pos) {
							var labelPos = ChartHelper.drawRateSideLabel(price, y, color, ctx, scope, ChartHelper.getDefaultFont(), null, 1, 15);
						}
					}

					if (!canvasWidth) {
						canvasWidth = ctx.canvas.scrollWidth;
					}

					if (labelPos && window.isGoforex) {
						ChartHelper.drawIcon(canvasWidth - 35, labelPos[1], 'chart-' + labelType + '-label', ctx, 60);
					}

					if(pos)
					{
						if (!positionPositive && window.isGoforex) {
							color = window.appConfig.positionLineDownColor;
						}

						var priceChangeNum = Mongo.positionValue(scope.currency);
						if (!window.isGoforex) {
							color = (priceChangeNum >= 0) ? '#4b9e6a' : '#d83c41';
						}

						var priceChange = CanvasJS.formatNumber(Math.round(priceChangeNum / pos.amount * 10000) / 100, '0.00') + '%';
						var labelPos = ChartHelper.drawRateSideLabel(priceChange, y, window.isGoforex ? 'transparent' : color, ctx, scope, (window.appConfig.rateSideLabelFontFamily || 'BebasBold'), null, 1, window.appConfig.rateSideLabelFontSize || 15, false, pos);
						var rateLineFunc = window.appConfig.positionLineFunc || 'drawSolidCustomLine';
						if (last && last.x && scope.isInView(last.x))
						{
							if(last && last.x && labelPos)
							{
								ChartHelper[rateLineFunc](ctx, window.appConfig.priceLineFullWidth ? 0 : xAxis.convertValueToPixel(last.x), labelPos[1], labelPos[0], labelPos[1], color, 2, 1);
							}
						}
						else
						{
							if (labelPos)
							{
								// for solidCustomLine to not go over left breakEvenLabel vai checking y coordinates
								ChartHelper[rateLineFunc](ctx, ((y >= cs.breakEvenLabelY && y <= cs.breakEvenLabelY + cs.breakEvenLabelHeight) && !window.appConfig.priceLineFullWidth ? cs.breakEvenLabelWidth : 0), y, labelPos[0], y, color, 1, 1);
							}
						}
					}
					else
					{
						if(!spreads)
						{
							var spreads = [];
						}
						spreads[sym] = SymbolData.getSpread(scope.currency);
						var sym = SymbolData.getSymbol(scope.currency);

						if (window.isGoforex) {
							var color = window.appConfig.rateLineColor;
						}

						if (sym)
						{
							var labelPos = ChartHelper.drawRateSideLabel(price, y, 'transparent', ctx, scope, ChartHelper.getDefaultFont(), null, 1, window.appConfig.rateSideLabelFontSize || 15);
						}

						// todo - cleanup needed
						if (window.isGoforex) {
							color = ChartHelper.getRateLineColor() || color;
						}

						if (last && last.x && scope.isInView(last.x) && !window.appConfig.priceLineFullWidth)
						{
							if(last && last.x && labelPos)
							{
								ChartHelper[ChartHelper.getRateLineFunction()](ctx, xAxis.convertValueToPixel(last.x), labelPos[1], labelPos[0], labelPos[1], color, 2, 1);
							}
						}
						else
						{
							if(labelPos)
							{
								ChartHelper[ChartHelper.getRateLineFunction()](ctx, 0, y, labelPos[0], y, color, 1, 1);
							}
						}
					}

					if (labelPos && window.appConfig.drawLabelToPointConnector && last) {
						ChartHelper.drawSolidCustomLine(ctx, xAxis.convertValueToPixel(last.x), y, labelPos[0], y, color, 1, 1);

						if (window.isGoforex) {
							ChartHelper.drawSolidCustomLine(ctx, 0, y, xAxis.convertValueToPixel(last.x), y, color, 0.33, 1);
						}
					}

					if (cs.isEnd && labelPos && !window.appConfig.disablePulsingPoint)
					{
						var x = xAxis.convertValueToPixel(last.x);
						var y = labelPos[1];

						if ($scope.isOpen && window.isGoforex) {
							var renderDiff = (Date.now() - lastPointRender) % pointSpeed;
							lastPointRender = Date.now();

							pointSize += (maxPointSize * (renderDiff / pointSpeed));

							if (pointSize > maxPointSize) {
								pointSize = maxPointSize * -1;
							}

							if (Math.abs(pointSize) < minPointSize) {
								pointSize = minPointSize;
							}
						} else {
							pointSize = maxPointSize;
						}

						ChartHelper.drawFilledCircle(ctx, x - (cs.type == 'candlestick' ? 0.5 : 0), y, VMin(Math.abs(pointSize)), color);
					}
				};

				for (var k = 0; k < postpone.length; k++) {
					postpone[k]();
				}

				var data = cs.getChart().options.data;
				for (var k = 0; k < data.length; k++) {
					if (data[k].sideLabel) {
						var d = data[k];

						if (d.dataPoints && d.dataPoints.length) {
							for (var i = 0; i < d.dataPoints.length; i++) {
								if (scope.isInView(d.dataPoints[i].x)) {
									break;
								}
							}

							if (!d.dataPoints[i]) {
								i = 0;
							}

							var sideLabelPos = yAxis.convertValueToPixel(d.dataPoints[i].y);

							sideLabelPos = Math.max(10, sideLabelPos);
							sideLabelPos = Math.min(yAxis.bounds.y2, sideLabelPos);

							// drawRateSideLabel: function(label, y, color, ctx, cs, font, fontColor, priceNowLabel, customFontSize, breakEvenLabel, pos)
							ChartHelper.drawRateSideLabel(d.sideLabel, sideLabelPos, d.color, ctx, scope, ChartHelper.getDefaultFont(), undefined, undefined, VMin(3), true);
						}
					}
				}
			};

			window.clearInterval(window.tradeIntv);
			var tradeIntvFunc = function()
			{
				var chartScope = chartList[$scope.currency];
				$scope.chartScope = chartScope;

				$scope.isOnline = !!OnlineStatus.is();
				self.setState('online', $scope.isOnline);
				self.setState('offline', !$scope.isOnline);
				self.setState('open', $scope.isOpen);
				self.setState('closed', !$scope.isOpen);

				if (!$state.is(tradeStateName))
				{
					if ($scope.isActive)
					{
						if (chartScope)
						{
							chartScope.deactivate();
						}

						$scope.isActive = false;
						window.clearTimeout(window.updateMenuInterval);

						if ($state.is('tab.dash'))
						{
							$rootScope.setScreen('home', $scope);

							if (isPortfolioTitleEnabled)
							{
								PortfolioTitle.start();
							}
						}
					}

					return;
				}
				else if (!$scope.isActive)
				{
					$scope.isActive = true;

					$rootScope.setScreen('play', $scope);

					if (chartScope)
					{
						chartScope.activate();
					}
					else
					{
						$scope.hasChart[$scope.currency] = false;
					}

					$rootScope.$broadcast('$$rebind::curr', 'trade intv, scope not active');

					if (window.updateMenu)
					{
						window.updateMenu();
					}

					if (isPortfolioTitleEnabled)
					{
						PortfolioTitle.start();
					}
				}

				if (!chartScope && $scope.isActive && ($http && $http.isLoading && !$http.isLoading($scope.currency)) && !window.isPaused && !($scope.currency == 'HISTORY' || $scope.currency == 'BATTLE') && !$rootScope.getAssetSelectorState()) {
					$scope.hasChart[$scope.currency] = false;
					var curr = $scope.currency;
					$scope.currency = null;
					$scope.setCurrency(curr);
					$rootScope.$broadcast('$$rebind::curr', 'missing chartScope');

					return;
				}

				if (!this.idx)
				{
					this.idx = 0;
				}

				this.idx++;

				if (!(this.idx % 10))
				{
					if (window.updateMenu)
					{
						window.updateMenu();
					}
				}

				if (!window.isPaused && $scope.isOnline && $scope.isActive && ($scope.currency != 'BATTLE') && ($scope.tradeState != 'BONUS') && ($scope.currency != 'HISTORY'))
				{
					if (!chartScope)
					{
						$rootScope.$broadcast('$$rebind::curr', 'still missing chartScope');
					}

					if (chartScope && !chartScope.isActive()/* && chartScope.isEnd*/)
					{
						// console.log('Activating', $scope.currency);
						chartList[$scope.currency].activate();
					}
				}

				if (noData > 20)
				{
					console.log('no data', $scope.currency, noData);
					ChartData.resetAll();
					$scope.hasChart = {};
					$rootScope.$broadcast('$$rebind::curr', 'no data');
					noData = 0;

					window.setTimeout(function () {
						firebase.database().goOnline();
						ChartRef.goOnline();
					}, 100);
				}

				if ((!$scope.user || !$scope.user.firebaseKeyId) && $scope.loadUser)
				{
					$scope.loadUser(true);
				}

				if (!$scope.isOpen)
				{
					$scope.untilMarketOpenStr = MarketStatus.untilOpen(SymbolData.getMarket($scope.currency));

					//todo: ? DOM element might be resetting so getting the element once and saving it to localStorage does not work
					//after going to trade, back to dash and back to trade, as it reloads the trade section kinda
					if (!window.untilMarketOpen || !window.untilMarketOpen.parentNode || 1)
					{
                        window.untilMarketOpen = document.getElementById('until-market-open');
					}

					if (window.untilMarketOpen)
					{
						window.untilMarketOpen.innerHTML = $scope.untilMarketOpenStr;
					}

					if ($scope.isMarketOpen($scope.currency))
					{
						$scope.isOpen = true;
						self.setState('open', true);
						self.setState('closed', true);
					}
				}

				if (isBattleEnabled)
				{
					getBattle().updateInterval($scope);
				}
			};

			tradeIntvFunc();

			window.clearInterval(window.tradeIntv);
			window.tradeIntv = window.setInterval(tradeIntvFunc, 500, 0, false);

			// init asset swiper
			$timeout(function()
			{
				var opts = {
						speed: 150,
						slidesPerView: window.appConfig.sliderSlidesPerView || 5,
						slidesPerGroup: 5,
						observer: true,

						resistance: false,
						resistanceRatio: 0,
						threshold: 10,
						longSwipesRatio: 0,
						longSwipesMs: 0
					};

				if(!(screen.width / screen.height >= 768/1224))
				{
					opts.slidesPerView = window.appConfig.sliderSlidesPerView || 5;
					opts.slidesPerGroup = 5;
				}

				if (window.appConfig.disableAssetSwiper) {
					opts.allowTouchMove = false;
					opts.shortSwipes = false;
					opts.longSwipes = false;
					opts.followFinger = false;

					if($scope.activePairs.length > 5)
					{
						$scope.activePairs.splice(5);
						window.localStorage.activePairs = JSON.stringify($scope.activePairs);
					}
				}

				$scope.swiper = new Swiper(window.appConfig.assetSwiperSelector || '.swiper-container', opts);

				// for some reason - bug?
				// When redirecting to trade section from lessons section with push notifications stoploss notification,
				// $scope.swiper creates as a array with 3 objects that are the same
				if($scope.swiper && Array.isArray($scope.swiper))
				{
					$scope.swiper = $scope.swiper[0];
				}

				if (window.appConfig.enableBattles) {
					window.setTimeout(function()
					{
						getBattle().updateSwiperBattle($scope);
					}, 100);
				}

				if($scope.isPairActive(window.localStorage['activeCurrency']))
				{
					$scope.setCurrency(window.localStorage['activeCurrency'] || 'EURUSD');
				}
				else
				{
					var j = 0;
					while($scope.activePairs[j] == 'HISTORY' || $scope.activePairs[j] == 'BATTLE')
					{
						j++;
					}
					$scope.setCurrency($scope.activePairs[j]);
				}
				$scope.symbol = SymbolData.getSymbol($scope.currency);

				$timeout.cancel(broadcastTradingInitT);
				var broadcastTradingInitT = $timeout(function()
				{
					if (!window.appConfig.disableAssetSwiper) {
						if($scope.activePairs)
						{
							$scope.swiper.slideTo(_.difference($scope.activePairs, ['BATTLE']).indexOf(window.localStorage['activeCurrency']) - ($scope.battleDisabled ? 0 : 1), 0);
						}
						else
						{
							$scope.swiper.slideTo($scope.activePairs.indexOf(window.localStorage['activeCurrency']), 0);
						}
					}

					$scope.tradingLoaded = true;
					$rootScope.$broadcast('$$rebind::tradingInit');
				}, 100, false);
			});

			var slideHandle = null;
			Trading.setCurrency(function(currency)
			{
				// switch between currency / history slides
				if (!slideHandle)
				{
					slideHandle = $ionicSlideBoxDelegate.$getByHandle('tradeSlider');
				}

				var callback = function()
				{
					var current = slideHandle.currentIndex();
					var newSlide = currency == "HISTORY" ? 1 : 0;
					if (current != newSlide)
					{
						slideHandle.slide(newSlide);
					}

					if ((currency == "HISTORY") || ('BATTLE' == currency))
					{
						$rootScope.$broadcast('$$rebind::curr', 'setcurrency callback (battle, history)');
						updateMenu(true);
						return;
					}

					Trading.setState('transStarted', false);

					var isLastLeverage = !$scope.leverages || ($scope.leverages.length - 1 == $scope.posLeverage);

					$scope.leverages = $scope.getLeverages(currency);

					if (isLastLeverage)
					{
						$scope.posLeverage = $scope.leverages.length - 1;
					}

					$scope.isOpen = $scope.isMarketOpen($scope.currency);
					Trading.setState('open', $scope.isOpen);
					Trading.setState('closed', !$scope.isOpen);
					window.clearTimeout(window.setStateOpenTimeout);
					window.setStateOpenTimeout = window.setTimeout(function()
					{
						Trading.setState('open', $scope.isOpen);
						Trading.setState('closed', !$scope.isOpen);
					}, 1000);

					if ($scope.swiper && ($scope.swiper.lastSlide != currency) && !window.appConfig.disableAssetSwiper)
					{
						$scope.swiper.slideTo(_.difference($scope.activePairs, ['BATTLE']).indexOf(currency), 0);
						$scope.swiper.lastSlide = currency;
					}

					updateMenu(true);

					var chart = $scope.chartList[currency];
					if (chart && chart.candleReset)
					{
						chart.candleReset();
					}
				}

				if (!slideHandle._instances.length || !document.getElementById('trading-container'))
				{
					$interval.cancel(window.waitForSlideIntv);
					window.waitForSlideIntv = $interval(function()
					{
						$rootScope.$broadcast('$$rebind::tradingInit');
						// console.log('waiting...' + (!!document.getElementById('trading-container')));
						if ((slideHandle._instances.length) && (document.getElementById('trading-container')))
						{
							$interval.cancel(window.waitForSlideIntv);
							callback();
						}
					}, 100, false, false);
				}
				else
				{
					callback();
				}

				return true;
			});

			window.setTimeout(function() {
				Trading.enablePortfolioTitle();
			});
		},

		getPositiveColor: function()
		{
			return positiveColor;
		},

		getNegativeColor: function()
		{
			return negativeColor;
		},

		setPositiveColor: function(color)
		{
			positiveColor = color;
		},

		setNegativeColor: function(color)
		{
			negativeColor = color;
		},

		setCurrency: function(callback)
		{
			setCurrencyCallback = callback;
		},

		getChartList: function()
		{
			return chartList;
		},

		historyLoaded: function(callback)
		{
			historyCallback = callback;
		},

		enableBattles: function()
		{
			isBattleEnabled = true;
		},

		enableBonusQuestions: function()
		{
			isBonusQuestionsEnabled = true;
		},

		disableBonusQuestions: function()
		{
			isBonusQuestionsEnabled = false;
		},

		enablePortfolioTitle: function()
		{
			isPortfolioTitleEnabled = true;

			$timeout(function()
			{
				PortfolioTitle.start();
			});
		},

		setState: function(name, state)
		{
			if(name == 'transStarted')
			{
				cssState = {};
				window.tradingContainer = document.getElementById('trading-container');
				window.tradingContainer = angular.element(tradingContainer);
				window.appElement = angular.element(document.getElementById('app'));
			}

			if (!window.tradingContainer || !window.tradingContainer[0] || !window.tradingContainer[0].parentNode)
			{
				cssState = {};
				window.tradingContainer = document.getElementById('trading-container');

				if (!window.tradingContainer)
				{
					return;
				}
				else
				{
					window.tradingContainer = angular.element(window.tradingContainer);
				}
			}

			window.cssState = cssState;

			if (cssState[name] === state)
			{
				return;
			}

			if (state)
			{
				window.tradingContainer.addClass('state-' + name);

				if(name == 'transStarted') {
					window.appElement.addClass('state-' + name);
					window.setTimeout(function()
					{
						window.appElement.addClass('opacity-transition');
						window.tradingContainer.addClass('opacity-transition');
					}, 1);
				}
			}
			else
			{
				window.tradingContainer.removeClass('state-' + name);

				if(name == 'transStarted') {
					window.appElement.removeClass('state-' + name);
					window.appElement.removeClass('opacity-transition');
					window.tradingContainer.removeClass('opacity-transition');
				}
			}

			// todo - t g only?
			window.clearTimeout(window.stateRebindTimeout);
			window.stateRebindTimeout = window.setTimeout(function() {
				$rootScope.$broadcast('$$rebind::curr');
			}, 200);

			cssState[name] = state;
		},

		hasState: function(name) {
			return cssState[name];
		},

		setLineChartMarker: function(markerCallback)
		{
			lineChartMarkerCallback = markerCallback;
        }

        // number of digest cycles per second
        //~ var lastDigest = 0;
        //~ var nbDigest = 0;
        //~ $rootScope.$watch(function() {
        //~ nbDigest++;
        //~ if (Date.now() - lastDigest > 1000)
        //~ {
            //~ console.log(nbDigest);
            //~ nbDigest = 0;
            //~ lastDigest = Date.now();
        //~ }
        //~ });

        // prosta intervaals
        //~ var i = 0;
        //~ var testingInterval = setInterval(function()
        //~ {
            //~ if(i > 1)
            //~ {
                //~ i = 0;
            //~ }

            //~ $scope.setCurrency($scope.pairs[i]);

            //~ i++;
        //~ }, 250);

        //~ setTimeout(function()
        //~ {
            //~ clearInterval(testingInterval);
        //~ }, 60000);

    };

    return Trading;
})
