angular.module('starter.trade')

.service('DelayedPrice', function(SymbolData)
{
	return {
		get: function(curr)
		{
			return _.get(SymbolData.getSymbol(curr), ['mid']);
		}
	};
})

.service('Battle', function($rootScope, API, $interval, $firebaseObject, Country, DateNow, $timeout, DelayedPrice, MarketStatus, $ionicScrollDelegate, SymbolData, Mongo, TopSymbols)
{
	var battleSecs = 0;

	var battleTimeLine = null;

	var probability = {'EURUSD': 15, 'USDJPY': 8, 'GBPUSD': 8, 'USDCAD': 4, 'OILUSD': 7, 'GOOUSD': 8, 'USDZAR': 3, 'XAUUSD': 6, 'ETHUSD': 5, 'BTCUSD': 7, 'AAPUSD': 8, 'TSLUSD': 9, 'XOMUSD': 8, 'NKEUSD': 9, 'DISUSD': 9 };

	_.each(TopSymbols.get(), function(sym) {
		if (!probability[sym]) {
			probability[sym] = 2;
		}
	});

	var getRandomSymbol = function(except)
	{
		var sumOfWeights = _.reduce(probability, function(x, weight, key)
		{
			probability[key] = x + weight;
			return x + weight;
		}, 0);

		var tries = 0;
		except = except || {};
		do
		{
			var rnd = Math.random() * sumOfWeights;
			var instruments = _.pickBy(probability, function(p, i) { return p > rnd; });
			var i = _.keys(_.mapValues(_.invert(_.invert(instruments)),parseInt)).shift();

			if (!MarketStatus.isOpen(i))
			{
				i = null;
			}
		}
		while ((!i || except[i]) && (tries++ < 50));

		// last resort fallback
		if (!i)
		{
			i = Math.random() < 0.5 ? 'BTCUSD' : 'ETHUSD';
		}

		return i;
	};

	var Battle = {
		initController: function($scope)
		{
			window.setTimeout(function()
			{

				$scope.formattedBattleResult = function(res)
				{
					return Math.abs(Math.round(res * 100) / 100);
				};

				$scope.addScore = function(player, score)
				{
					var currScore = _.get($scope.battle, ['scores', player]) || 0;
					$scope.battle.$ref().child('scores').child(player).set(score + (currScore || 0));
				};

				$scope.$watch('user.battleId', function(battleId, old)
				{
					if (!battleId)
					{
						if (old)
						{
							$timeout(function()
							{
								API.get('saveBattlesTimeLineMongo');
							}, 1000, false);

							$scope.closingBattle = true;

							$scope.trackEvent("Battle", "Finish", 'now');

							$timeout(function()
							{
								$scope.battle = null;
							}, 3000);
						}
					}
					else
					{
						$scope.battle = new $firebaseObject(firebase.database().ref('battles').child(battleId));
						$scope.battle.$loaded().then(function()
						{
							if (!$scope.battle.time)
							{
								Mongo.update({battleId: ""});
							}
						}).catch(err => {console.log(err)});
					}
				});

				$scope.$watch('battle.time', function(time)
				{
					if (!time)
					{
						$scope.opponent = null;
					}
					else
					{
						if (window.randomProfileLoop)
						{
							$interval.cancel(window.randomProfileLoop);
							randomProfileLoop = null;
						}

						if($scope.user && !$scope.user.name)
						{
							$scope.user.name = "Unknown Name";
						}

						$scope.opponent = $scope.battle.t2;
						if(!$scope.opponent.name)
						{
							$scope.opponent.name = "Opponent";
						}

						if($scope.user.name == $scope.opponent.name)
						{
							$scope.opponent = $scope.battle.t1;
						}

						// $scope.opponent = ($scope.battle.t1.name == $scope.user.name) ? $scope.battle.t2 : $scope.battle.t1;
						$scope.opponent.fullCountry = Country.getFullName($scope.opponent.country);

						if($scope.opponent.name.indexOf(' ') >= 1)
						{
							$scope.opponent.shortName = $scope.opponent.name.split(' ').shift();
						}
						else
						{
							$scope.opponent.shortName = $scope.opponent.name;
						}

						if($scope.user.name.indexOf(' ') >= 1)
						{
							$scope.shortName = $scope.user.name.split(' ').shift();
						}
						else
						{
							$scope.shortName = $scope.user.name;
						}

						if ($scope.battle.isBot && !$scope.battle.botInstruments)
						{
							var open = {};
							$scope.battle.botInstruments = {};
							_.each($scope.battle.timeLine, function(i)
							{
								if ($scope.battle.botInstruments[i])
								{
									delete(open[$scope.battle.botInstruments[i]]);
								}
								else
								{
									var disallowed = JSON.parse(JSON.stringify((open)));

									for (var k = i - 2; k <= i - 1; k++)
									{
										if ($scope.battle.botInstruments[k])
										{
											disallowed[$scope.battle.botInstruments[k]] = true;
										}
									}

									var sym = getRandomSymbol(disallowed);
									open[sym] = true;

									$scope.battle.botInstruments[i] = sym;
									$scope.battle.$ref().child('botInstruments').set($scope.battle.botInstruments);
								}
							});
						}
					}
				});

				$scope.battleTime = function(ts)
				{
					return moment.unix(ts).fromNow();
				};

				var positionScore = function(tr)
				{
					// do not count binary transactions that are not closed yet
					if (tr.length && !tr.forceClose)
					{
						return 0;
					}

					var mid = DelayedPrice.get(tr.pair);
					var isWin = PositionStatus.isWin(tr.pair, mid);
					var gain = tr.length ? ((isWin ? tr.win : 0) - tr.amount) : Mongo.positionValue(tr.pair, mid);
					return (gain / tr.amount) * 100;
				};

				var lastOpenScore = 0;
				var lastTimeLineScore = 0;

				var battleButtonTime = null;
				var oppTimeLine = null;

				var randomProfileIndex = 0;
				var randomProfileLoop = false;

				var openBotPosition = function(sym, secs)
				{
					if (secs > 590)
					{
						return;
					}

					var isBuy = Math.random() > 0.5;

					var price = _.get(SymbolData.getSymbol(sym), [isBuy ? 'ask' : 'bid']);

					$scope.battle.$ref().child('botPositions').child(sym).set({isBuy: isBuy, rate: price});

					$scope.battle.$ref().child('log').push({
						amount: 1000,
						battleTime: secs,
						date: DateNow(),
						leverage: _.shuffle($scope.getLeverages(sym)).shift(),
						lossLimit: 50,
						pair: sym,
						player: 't2',
						price: price,
						profitLimit: 50,
						quant: 1000,
						size: 1000,
						type: isBuy ? 'buy' : 'sell'
					});
				};

				var closeBotPosition = function(sym, secs)
				{
					var p = _.get($scope.battle, ['botPositions', sym]);
					if (p)
					{
						var rate = DelayedPrice.get(sym);
						var diff = rate - p.rate;
						if (!p.isBuy)
						{
							diff = diff * -1;
						}

						var logKey = null;
						_.each($scope.battle.log, function(pos, key)
						{
							if ((pos.pair == sym) && (pos.player == 't2') && !pos.forceClose)
							{
								logKey = key;
							}
						});

						var pos = $scope.battle.log[logKey];
						var score = Math.round((diff / p.rate) * 100 * 100) / 100;
						if(!pos.leverage)
						{
							pos.leverage = 1;
						}
						score = score * pos.leverage;

						score = Math.round(score * 100) / 100;
						// make the bot score between -0.2 to 0.2% in case it's 0
						if (!score)
						{
							score = Math.round(((Math.random() - 0.5) / 2) * 100) / 100;
						}

						$scope.battle.$ref().child('log').child(logKey).update({forceClose: rate, result: score});
						pos.forceClose = rate;
						pos.result = score;

						$scope.addScore('t2', score);

						$scope.battle.$ref().child('botPositions').child(sym).set(null);
					}
				};

				var battleContent = null;
				var getBattleContent = function()
				{
					if (!battleContent || !battleContent[0].parentNode)
					{
						battleContent = angular.element(document.getElementById('battle-content'));
					}

					return battleContent;
				};

				$scope.recalculateScore = function()
				{
					var openScore = 0;

					var player = $scope.battle.t1.name == $scope.user.name ? 't1' : 't2';
					var opponent = player == 't1' ? 't2' : 't1';
					$scope.playerID = player;
					$scope.opponentID = opponent;

					if (openScore != lastOpenScore)
					{
						$scope.battle.$ref().child('openScores').child(player).set(openScore);
					}
					lastOpenScore = openScore;

					var timeLineScore = openScore + (_.get($scope.battle, ['scores', player]) || 0);

					// update timeline record if changed
					var secs = Math.round((DateNow() - $scope.battle.started) / 1000) - 3;

					if ((secs > 600))
					{
						secs = 600;
					}

					battleSecs = secs;

					if ((battleSecs > 590) && (battleSecs < 595) && $scope.battle.isBot && $scope.battle.log)
					{
						_.each($scope.battle.log, function(item)
						{
							if ((item.player == 't2') && (!item.forceClose))
							{
								closeBotPosition(item.pair, secs);
							}
						});
					}

					if ('BATTLE' == $scope.currency)
					{
						var time = document.getElementById('battle-time');
						if (time)
						{
							var left = 600 - Math.max(0, secs);

							$scope.battleLeft = moment.utc(left * 1000).format('mm:ss');
							time.innerHTML = $scope.battleLeft;

							if ($scope.battleLeft == '10:00')
							{
								getBattleContent().addClass('battle-starting');
							}
							else
							{
								getBattleContent().removeClass('battle-starting');
							}

							if (left > 597)
							{
								angular.element(document.getElementById('battle-content')).removeClass('isGettingReady');
							}
						}
					}

					$scope.myScore = Math.round(timeLineScore * 100) / 100;
					var oppScore = 0;
					if ($scope.battle.isBot)
					{
						if (!oppTimeLine)
						{
							oppTimeLine = [];
							_.each($scope.battle.timeLine, function(score, seconds)
							{
								oppTimeLine.push({score: score, seconds: parseInt(seconds)});
								oppTimeLine = _.sortBy(oppTimeLine, 'seconds');
							});
						}

						var botQueue = [];
						while ((oppTimeLine.length > 0) && (oppTimeLine[0].seconds <= secs))
						{
							botQueue.push(oppTimeLine.shift());
						}

						// filter out positions that are to be closed immediately
						var filteredQueue = [];
						for (var k = 0; k < botQueue.length; k++)
						{
							if (_.filter(botQueue, function(tl) { return tl.score == botQueue[k].score; }).length == 1)
							{
								filteredQueue.push(botQueue[k]);
							}
						}

						for (var k = 0; k < filteredQueue.length; k++)
						{
							var tl = filteredQueue[k];
							var i = tl.score;
							var o = $scope.battle.botInstruments[i];

							// open/close bot position
							if ($scope.battle.botPositions && $scope.battle.botPositions[o])
							{
								closeBotPosition(o, secs);
							}
							else
							{
								openBotPosition(o, secs);
							}

							$scope.battle.$ref().child('timeLine').child(tl.seconds).set(null);
						}
					}

					oppScore = (_.get($scope.battle, ['scores', opponent]) || 0) + (_.get($scope.battle, ['openScores', opponent]) || 0);
					oppScore = Math.round(oppScore * 100) / 100;

					if (!isNaN(oppScore))
					{
						$scope.oppScore = oppScore;
					}

					$scope.isBattleWin = ($scope.myScore > $scope.oppScore) || (($scope.myScore == $scope.oppScore) && ($scope.myScore > 0));

					$timeout(function()
					{
						$scope.$apply();
					});
				};

				$rootScope.closeBattleLogin = function()
				{
					angular.element(document.getElementById('battle-login')).removeClass('is-visible');
				};

				$scope.initBattle = function()
				{
					if (!$scope.user.facebook && !$scope.user.oauthID)
					{
						angular.element(document.getElementById('battle-login')).addClass('is-visible');
						return;
					}

					if ($scope.beforeInitBattle)
					{
						$scope.beforeInitBattle();
					}

					getBattleContent().addClass('battle-starting');

					window.clearInterval(window.waitForProgressBar);
					window.waitForProgressBar = window.setInterval(function()
					{
						var progressBar = document.getElementById('battle-progress-bar');
						if (progressBar)
						{
							window.clearInterval(window.waitForProgressBar);

							var steps = 50;

							$interval(function(i)
							{
								progressBar.style.width = ((i / steps) * 100) + '%';
							}, 100, steps, false);
						}
					}, 50);

					Mongo.update({finishedBattle: ""});
					$scope.battle = null;
					$scope.myScore = 0;
					$scope.oppScore = 0;
					$scope.isBattleWin = false;
					$scope.isSearching = true;
					$scope.opponent = null;
					oppTimeLine = null;

					$scope.trackEvent("Battle", "Start", 'now');

					API.get('initBattleMongo', function(res)
					{
						console.log('success?', res);

						// testing for slowslowslow connection or possibly server problems
						$timeout(function()
						{
							function getUserStuff()
							{
								Mongo.get(function(user)
								{
									$scope.user = user;
								}, function()
								{
									window.setTimeout(function()
									{
										getUserStuff();
									}, 1000);
								});
							}

							getUserStuff();
						}, 3000);

						angular.element(document.getElementById('battle-content')).addClass('isGettingReady');
						$scope.isBattleStarted = true;
						$scope.isSearching = false;
						document.getElementById('battle-progress-bar').style.width = '0px';

						if ($scope.afterInitBattle)
						{
							$scope.afterInitBattle();
						}

						if (res.success !== 0)
						{
							window.clearTimeout(cancelTimeout);
						}
					}, function(err)
					{
						console.log('initBattleMongo error', err);

						// temp check as it looks like this gets returned, but err says {success: 1}
						// if ($scope.afterInitBattle)
						// {
						// 	$scope.afterInitBattle();
						// }
						if(err && err.success)
						{
							$timeout(function()
							{
								function getUserStuff()
								{
									Mongo.get(function(user)
									{
										$scope.user = user;
									}, function()
									{
										window.setTimeout(function()
										{
											getUserStuff();
										}, 1000);
									});
								}
	
								getUserStuff();
							}, 3000);
	
							angular.element(document.getElementById('battle-content')).addClass('isGettingReady');
							$scope.isBattleStarted = true;
							$scope.isSearching = false;
							document.getElementById('battle-progress-bar').style.width = '0px';
	
							if ($scope.afterInitBattle)
							{
								$scope.afterInitBattle();
							}
	
							if (err.success !== 0)
							{
								window.clearTimeout(cancelTimeout);
							}
						}
					});

					var cancelTimeout = window.setTimeout(function()
					{
						$scope.cancelBattle();

						if ($scope.afterInitBattle)
						{
							$scope.afterInitBattle();
						}
					}, 15000);
				};

				$scope.collectBattle = function()
				{
					Mongo.update({finishedBattle: null, battleId: "", battleFallback: ""});

					$scope.trackEvent("Battle", "Collect", 'now');

					API.get('collectBattleWinningsMongo');

					$timeout(function(){
						$ionicScrollDelegate.scrollTop();

						$scope.isBattleStarted = true;
						$scope.isSearching = false;
						$scope.battle = null;
						$scope.user.finishedBattle = null;
						$scope.battleId = "";
						$scope.battleFallback = "";

						$rootScope.$broadcast('$$rebind::curr');

						Mongo.get(function(user) {
							$scope.user = user;
							$scope.$apply();
						})
					}, 50);
				};

				$scope.cancelBattle = function()
				{
					$scope.isBattleStarted = true;
					$scope.isSearching = false;
					$scope.cancelled = DateNow();

					Mongo.update({cancelBattle: true});
				};
			}, 500);
		},

		setCurrency: function($scope)
		{
			if ($scope.currency == "BATTLE")
			{
				Mongo.get(function(user)
				{
					$scope.user = user;
					if(!$scope.user)
					{
						return;
					}
					
					if ($scope.user.finishedBattle)
					{
						if (!$scope.user.finishedBattle.isWin)
						{
							// ~ $scope.user.$ref().child('finishedBattle').remove();
						}

						$scope.playerID = $scope.user.finishedBattle.player;
						$scope.opponentID = 't1' == $scope.playerID ? 't2' : 't1';
						$scope.opponent = user.finishedBattle.opp;
					}
				});

				$rootScope.$broadcast('$$rebind::curr');
			}

			return true;
		},

		openPosition: function($scope, position)
		{
			// add to battle log
			if ($scope.battle)
			{
				var player = $scope.battle.t1.name == $scope.user.name ? 't1' : 't2';
				position.player = player;

				// @todo: calculate battle time
				position.battleTime = battleSecs;
				var pos = JSON.parse(JSON.stringify(position));

				if ('USD' == pos.pair.substr(0, 3))
				{
					pos.type = ('sell' == pos.type) ? 'buy' : 'sell';
				}

				$scope.battle.$ref().child('log').push(pos);
			}
		},

		closePosition: function($scope, currency)
		{
			if ($scope.battle)
			{
				var pos = $scope.positionAlert;
				var res = (($scope.tradeValue / pos.amount) * 100) || 0;
				_.each($scope.battle.log, function(item, key)
				{
					if ((item.date == pos.date) && (item.pair == pos.pair))
					{
						$scope.battle.$ref().child('log').child(key).update({result: res, battleTimeClose: battleSecs, forceClose: $scope.positionAlert.price});
						$scope.addScore($scope.playerID, res);
					}
				});
			}
		},

		updateInterval: function($scope)
		{
			if ($scope.battle && $scope.battle.t1)
			{
				if (window.randomProfileLoop)
				{
					$interval.cancel(window.randomProfileLoop);
					window.randomProfileLoop = null;
				}

				$scope.recalculateScore();
			}
			else
			{
				$scope.isBattleWin = false;

				if (battleTimeLine && (_.keys(battleTimeLine).length > 10))
				{
					// was not ever called, because the api function name was wrong
					// so skipping it at the moment
					// correct function name would be saveBattlesTimeLine + Mongo now
					// API.get('saveBattleTimeLine', {timeLine: JSON.stringify(battleTimeLine)});
				}

				battleTimeLine = null;
				lastTimeLineScore = 0;

				if (!window.randomProfileLoop && $scope.randomProfiles)
				{
					window.randomProfileLoop = $interval(function()
					{
						randomProfileIndex = randomProfileIndex % $scope.randomProfiles.length;
						randomProfileIndex++;
						$scope.opponent = $scope.randomProfiles[randomProfileIndex - 1];
					}, 200);
				}
			}
		},

		setRandomProbabilities: function(prob)
		{
			probabilities = prob;
		},

		updateSwiperBattle: function($scope)
		{
			if($scope.battleDisabled == undefined)
			{
				$scope.battleDisabled = false;
			}

			if (Battle.prevBattleStatus === $scope.battleDisabled)
			{
				return;
			}

			if(!$scope.swiper.container)
			{
				return;
			}

			if($scope.battleDisabled)
			{
				$scope.swiper.container[0].classList.add('full-width');
				$scope.swiper.params.slidesPerView = (window.appConfig.sliderSlidesPerView || 5) + 1;
				$scope.swiper.params.slidesPerGroup = 6;

				// everything else that has a standart mobile phone screen ratio
				if(!(screen.width / screen.height >= 768/1224))
				{
					$scope.swiper.params.slidesPerView = window.appConfig.sliderSlidesPerView || 5;
					$scope.swiper.params.slidesPerGroup = 5;
				}
			}
			else if ($scope.swiper && $scope.swiper.container && $scope.swiper.container[0])
			{
				$scope.swiper.container[0].classList.remove('full-width');
				$scope.swiper.params.slidesPerView = window.appConfig.sliderSlidesPerView || 5;
				$scope.swiper.params.slidesPerGroup = 5;

				// everything else that has a standart mobile phone screen ratio
				if(!(screen.width / screen.height >= 768/1224))
				{
					$scope.swiper.params.slidesPerView = (window.appConfig.sliderSlidesPerView || 5) - 1;
					$scope.swiper.params.slidesPerGroup = 4;
				}
			}

			Battle.prevBattleStatus = $scope.battleDisabled;

			if ($scope.swiper)
			{
				$scope.swiper.update();
			}

			$rootScope.$broadcast('$$rebind::curr', 'battle swiper');
		}

	};

	return Battle;
})
