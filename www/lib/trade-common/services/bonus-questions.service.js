angular.module('starter.trade')

.service('BonusQuestions', function(ChartData, $rootScope, $timeout, ChartHelper, VMin, Mongo)
{
	var bonusQuestions = window.bonusquestions[0];

	var getFilledData = function(currency, questionId)
	{
		var bonusData = window.bonusquestions[0][currency][questionId].chart;

		var breakIndex = bonusData.breakIndex;

		var completeData = [];
		var tempObj = {};

		for(var i = 0; i < bonusData.dataPoints.length; i++)
		{
			tempObj = {};
			tempObj["x"] = bonusData.dataPoints[i][0];
			if(bonusData.dataPoints[i].y)
				tempObj["y"] = bonusData.dataPoints[i].y;
			else
				tempObj["y"] = parseFloat(bonusData.dataPoints[i][2]);

			completeData.push(tempObj);
		}

		var newBreakIndex = breakIndex * 5;

		var newCompletedData = [];
		var expandData = [];
		var dataLeap = {};
		var fillerData = [];

		for(var i = 0; i < completeData.length - 1; i++)
		{
			expandData = [];
			dataLeap = {};
			fillerData = [];

			expandData.push(completeData[i]);
			dataLeap = completeData[i + 1];
			dataLeap["x"] = (i + 1) * 5;
			expandData.push(dataLeap);

			fillerData = ChartData.getRandomDataPoints(expandData[0], expandData[1], 1);
			newCompletedData.push(completeData[i]);
			for(var j = 0; j < fillerData.length - 1; j++)
			{
				newCompletedData.push(fillerData[j]);
			}
		}
		newCompletedData.push(completeData[completeData.length - 1]);

		var inCompleteData = [];

		var averageY = 0;

		for(var i = 0; i < bonusData.dataPoints.length; i++)
		{
			tempObj = {};
			tempObj["x"] = bonusData.dataPoints[i][0];
			if(bonusData.dataPoints[i].y)
				tempObj["y"] = bonusData.dataPoints[i].y;
			else
				tempObj["y"] = parseFloat(bonusData.dataPoints[i][2]);

			if(bonusData.breakIndex < i)
			{
				tempObj["lineColor"] = "transparent";
			}

			inCompleteData.push(tempObj);
		}

		var newInCompletedData = [];
		var expandData = [];
		var dataLeap = {};
		var fillerData = [];

		for(var i = 0; i < completeData.length - 1; i++)
		{
			expandData = [];
			dataLeap = {};
			fillerData = [];

			expandData.push(completeData[i]);
			dataLeap = completeData[i + 1];
			dataLeap["x"] = (i + 1) * 5;
			expandData.push(dataLeap);

			fillerData = ChartData.getRandomDataPoints(expandData[0], expandData[1], 1);

			newInCompletedData.push(completeData[i]);
			for(var j = 0; j < fillerData.length - 1; j++)
			{

				newInCompletedData.push(fillerData[j]);

				if(i == completeData.length - 1)
				{
					newInCompletedData.push(completeData[completeData.length - 1]);
				}
			}
		}

		var averageAxisY = 0;
		var breakPointValue = newInCompletedData[newBreakIndex]["y"];
		for(var i = 0; i < newInCompletedData.length; i++)
		{
			averageAxisY += newInCompletedData[i]["y"];
			var biggestDiff = 0;
			var tempTest = Math.abs(newInCompletedData[i]["y"] - breakPointValue);
			if(tempTest > biggestDiff)
			{
				biggestDiff = tempTest;
			}
		}

		var dataObject = {};

		dataObject["breakIndex"] = newBreakIndex;
		dataObject["inCompleteData"] = newInCompletedData;
		dataObject["completeData"] = newCompletedData;

		return dataObject;
	};

	var previousCurrency = null;

	return {

		initController: function($scope)
		{
			var self = this;

			$scope.isBonusAnswered = {};

			$scope.bonusQuestions = bonusQuestions;

			$scope.setBonusActive = function(currency)
			{
				if (!bonusQuestions[$scope.currency])
				{
					$scope.closeBonusQuestion($scope.currency);
					return;
				}

				self.setBonusActive(currency, $scope);
			};

			$scope.answerBonusQuestion = function(currency, answer, qid)
			{
				self.answerBonusQuestion(currency, answer, qid, $scope);
			};

			$scope.closeBonusQuestion = function(currency)
			{
				self.closeBonusQuestion(currency, $scope);
			};

			$scope.renderBonusCallback = function(chartScope)
			{
				self.renderBonusCallback(chartScope, $scope);
			};

			Mongo.getCached(function(user)
			{
				if (user.bonus)
				{
					$scope.bonus = user.bonus;
					window.localStorage.bonus = JSON.stringify($scope.bonus);
				}

				if (!user.bonus)
				{
					window.localStorage.bonus = "";
				}

				$timeout(function()
				{
					$scope.$apply();
				});
			});
		},

		setCurrency: function($scope)
		{
			$scope.tradeState = '';
			$scope.formattedMid = $scope.symbol ? $rootScope.formatRate($scope.symbol.mid) : '';
			$scope.formattedAsk = $scope.formattedMid;
			$scope.formattedBid = $scope.formattedMid;
			$scope.updateBindRates();

			if (window.currentLang == 'en')
			{
				var bonusCurrency = $scope.currency;
				$scope.bonusCurrency = bonusCurrency;

				if(bonusCurrency != previousCurrency)
				{
					if(previousCurrency && $scope.setBonusActive)
					{
						$scope.setBonusActive(bonusCurrency);
					}
				}

				previousCurrency = $scope.currency;

				var tradeState;

				if(window.localStorage.bonus && 'undefined' != window.localStorage.bonus && window.localStorage.settings && JSON.parse(window.localStorage.settings).tradingQuizes && $scope.user && $scope.user.positions && $scope.currency)
				{
					if(!Mongo.getPosition($scope.currency))
					{
						var localBonusData = JSON.parse(window.localStorage.bonus);
						{
							if(localBonusData.active)
							{
								if(localBonusData.active[$scope.currency])
								{
									$scope.tradeState = 'BONUS';
									tradeState = 'BONUS';
									window.updateMenu();
								}
							}
						}
					}
				}
				else
				{
					$scope.tradeState = '';
				}

				if('BONUS' == tradeState)
				{
					$rootScope.$broadcast('$$rebind::curr', 'bonus');
					return;
				}
			}

			return true;
		},

		setBonusActive: function(currency, $scope)
		{
			if(currency == "BATTLE")
			{
				return;
			}

			if(window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).tradingQuizes == false)
			{
				return;
			}

			var length = bonusQuestions[currency] && bonusQuestions[currency].length;
			if(length){
				var randomInt = Math.floor( Math.random() * ( length ) ) + 0;
			}
			else
			{
				return;
			}

			Mongo.getCached(function(user){

				if(user.positions)
				{
					if(Mongo.getPosition(currency))
					{
						return;
					}
				}

				if(user.battleId)
				{
					return;
				}
				if(!user.bonus)
				{
					user.bonus = {}
				}
				if(!user.bonus.ready)
				{
					user.bonus.ready = {};
				}
				if(user.bonus.ready[currency])
				{
					if(!user.bonus.active)
					{
						user.bonus.active = {};
					}
					if(!user.bonus.active[currency])
					{
						user.bonus.active[currency] = true;
						// user.$ref().child('bonus').child('active').child(currency).set(true);
					}

					if(length)
					{
						if(!user.bonus.questionId)
						{
							user.bonus.questionId = {};
						}
						if(!user.bonus.questionId[currency])
						{
							user.bonus.questionId[currency] = randomInt;
							// user.$ref().child('bonus').child('questionId').child(currency).set(randomInt);

							if(!user.bonus.filledBonusData)
							{
								user.bonus.filledBonusData = {};
							}
							if(!user.bonus.filledBonusData[currency])
							{
								user.bonus.filledBonusData[currency] = {};
							}
							if(!user.bonus.filledBonusData[currency][randomInt])
							{
								user.bonus.filledBonusData[currency][randomInt] = {};
							}

							if(user.bonus.filledBonusData[currency][randomInt])
							{
								user.bonus.filledBonusData[currency][randomInt] = getFilledData(currency, randomInt);
								// user.$ref().child('bonus').child('filledBonusData').child(currency).child(randomInt).set(getFilledData(currency, randomInt));

								if(!user.bonus.bonusReward)
								{
									user.bonus.bonusReward = {};

									if(!user.bonus.bonusReward[currency])
									{
										user.bonus.bonusReward[currency] = {};
										var newCash;
										var bonusReward = user.cash * 0.035;

										if(bonusReward <= 50)
										{
											newCash = user.cash += 50;
											bonusReward = 50;
											user.bonus.bonusReward[currency] = bonusReward;
										}
										else if(bonusReward >= 200)
										{
											newCash = user.cash += 200;
											bonusReward = 200;
											user.bonus.bonusReward[currency] = bonusReward;
										}
										else
										{
											bonusReward = Math.round(bonusReward / 10) * 10;
											newCash = user.cash + bonusReward;
											user.bonus.bonusReward[currency] = bonusReward;
										}

										bonusReward = Math.round(bonusReward);

										// user.$ref().child('bonus').child('bonusReward').child(currency).set(bonusReward);
									}
								}
							}

						}
					}

					Mongo.update({bonus: user.bonus});
					$scope.filledBonusData = user.bonus.filledBonusData;
					$scope.bonus = user.bonus;
					window.localStorage.bonus = JSON.stringify($scope.bonus);
				}
			});
		},

		answerBonusQuestion: function(currency, answer, qid, $scope)
		{
			$scope.isBonusAnswered[window.localStorage['activeCurrency']] = true;

			var self = this;

			Mongo.getCached(function(user){
				if(!user.bonus.resultActive)
				{
					user.bonus.resultActive = {};
				}

				//parbaudit vai atbilde pareiza, vai ne
				if(!user.bonus.answerCorrect)
				{
					user.bonus.answerCorrect = {};
				}

				//UP = 1
				//DOWN = 0

				if(!user.bonus.userAnswer)
				{
					user.bonus.userAnswer = {};
				}
				if(!user.bonus.userAnswer[currency])
				{
					user.bonus.userAnswer[currency] = answer;
					// user.$ref().child('bonus').child('userAnswer').child(currency).set(answer);
					Mongo.update({bonus: user.bonus});
				}

				if (!_.get(bonusQuestions, [currency, qid]))
				{
					self.closeBonusQuestion(currency, $scope);
					return;
				}

				if(bonusQuestions[currency][qid].r == answer)
				{
					user.bonus.answerCorrect[currency] = true;
					// user.$ref().child('bonus').child('answerCorrect').child(currency).set(true);
				}
				else
				{
					user.bonus.answerCorrect[currency] = false;
					// user.$ref().child('bonus').child('answerCorrect').child(currency).set(false);
				}

				//ja ir pareiza atbilde, ja jau nav piešķirts, tad piešķiram 100 $
				//jauztaisa caur to api prikolu tik.

				if(!user.bonus.alreadyCashed)
				{
					user.bonus.alreadyCashed = {};
				}
				if(!user.bonus.alreadyCashed[currency])
				{
					if(user.bonus.answerCorrect[currency])
					{
						if(!$scope.bonus.bonusReward)
						{
							$scope.bonus.bonusReward = {};
							$scope.bonus.bonusReward[currency] = 50;
						}
						var newCash = user.cash + ($scope.bonus.bonusReward[currency] || 50);
						// user.$ref().child('cash').set(newCash);
						Mongo.update({cash: newCash});
					}
					user.bonus.alreadyCashed[currency] = true;
					// user.$ref().child('bonus').child('alreadyCashed').child(currency).set(true);
				}

				user.bonus.resultActive[currency] = true;
				// user.$ref().child('bonus').child('resultActive').child(currency).set(true);
				Mongo.update({bonus: user.bonus});

				$scope.bonus = user.bonus;
			});
		},

		closeBonusQuestion: function(currency, $scope)
		{
			$scope.currency = currency;
			Mongo.getCached(function(user){

				if(!user.assetTradeCount)
				{
					user.assetTradeCount = {};
				}
				var newCount = (user.assetTradeCount[currency] || 0) + 1;
				// user.$ref().child('assetTradeCount').child(currency).set(newCount);
				Mongo.update({assetTradeCount: user.assetTradeCount});

				if(user.bonus)
				{
					if(user.bonus.ready)
					{
						if(user.bonus.ready[currency])
						{
							delete user.bonus.ready[currency];
						}
					}

					if(user.bonus.active)
					{
						if(user.bonus.active[currency])
						{
							delete user.bonus.active[currency];
						}
					}

					if(user.bonus.resultActive)
					{
						if(user.bonus.resultActive[currency])
						{
							delete user.bonus.resultActive[currency];
						}
					}

					if(user.bonus.questionId)
					{
						if(user.bonus.questionId[currency])
						{
							delete user.bonus.questionId[currency];
						}
					}

					if(user.bonus.answerCorrect)
					{
						if(user.bonus.answerCorrect[currency])
						{
							delete user.bonus.answerCorrect[currency];
						}
					}

					if(user.bonus.alreadyCashed)
					{
						if(user.bonus.alreadyCashed[currency])
						{
							delete user.bonus.alreadyCashed[currency];
						}
					}

					if(user.bonus.userAnswer)
					{
						if(user.bonus.userAnswer[currency])
						{
							delete user.bonus.userAnswer[currency];
						}
					}

					if(user.bonus.filledBonusData)
					{
						if(user.bonus.filledBonusData[currency])
						{
							delete user.bonus.filledBonusData[currency];
						}
					}

					if(user.bonus.bonusReward)
					{
						if(user.bonus.bonusReward[currency])
						{
							delete user.bonus.bonusReward[currency];
						}
					}
				}

				// user.$ref().child('bonus').child('ready').child(currency).remove();
				// user.$ref().child('bonus').child('active').child(currency).remove();
				// user.$ref().child('bonus').child('resultActive').child(currency).remove();
				// user.$ref().child('bonus').child('questionId').child(currency).remove();
				// user.$ref().child('bonus').child('answerCorrect').child(currency).remove();
				// user.$ref().child('bonus').child('alreadyCashed').child(currency).remove();
				// user.$ref().child('bonus').child('userAnswer').child(currency).remove();
				// user.$ref().child('bonus').child('filledBonusData').child(currency).remove();
				// user.$ref().child('bonus').child('bonusReward').child(currency).remove();

				Mongo.update({bonus: user.bonus});

				$scope.bonus = user.bonus;
				window.localStorage.bonus = JSON.stringify($scope.bonus);

				$rootScope.$broadcast('$$rebind::curr', 'close bonus');
			});

			$scope.tradeState = '';

			window.updateMenu(true);
			$rootScope.$broadcast('$$rebind::curr', 'finish bonus');
		},

		renderBonusCallback: function(chartScope, $controllerScope)
		{
			// var pos = _.get($controllerScope.user, ['positions', $controllerScope.currency]);
			var pos = Mongo.getPosition($controllerScope.currency);

			var cs = chartScope;

			if (!chartScope)
			{
				return;
			}

			$timeout(function(){

				var ctx = cs.getChart().ctx.canvas.getContext("2d");
				var xAxis = cs.getChart().axisX[0];
				var yAxis = cs.getChart().axisY[0];
				var data = cs.getChart().options.data[0].dataPoints;
				var breakIndex = data[cs.getChart().options.data[0].breakIndex];
				var breakIndexPosX = xAxis.convertValueToPixel(breakIndex.x);
				var breakIndexPosY = yAxis.convertValueToPixel(breakIndex.y);

				if(!chartScope.answer)
				{
					ChartHelper.drawDashLineB(ctx, breakIndexPosX + 6, breakIndexPosY + 6, breakIndexPosX + 35, breakIndexPosY + 35, '#666');
					ChartHelper.drawDashLineB(ctx, breakIndexPosX + 6, breakIndexPosY - 6, breakIndexPosX + 35, breakIndexPosY - 35, '#666');
					ChartHelper.drawIcon(breakIndexPosX + 40, breakIndexPosY - 39, 'position-up', ctx, VMin(6));
					ChartHelper.drawIcon(breakIndexPosX + 40, breakIndexPosY + 39, 'position-down', ctx, VMin(6));
				}
				else
				{
					if(!chartScope.useranswer)
					{
						var coloring = '#C8D92B';
						var breakIndexImage = 'position-up';
					}
					else
					{
						var coloring = '#F26262';
						var breakIndexImage = 'position-down';
					}
					ChartHelper.drawSolidLine(ctx, 0, breakIndexPosY, 1024, breakIndexPosY, coloring);
					ChartHelper.drawDashLineB(ctx, breakIndexPosX, 0, breakIndexPosX, 1024, '#666');
					ChartHelper.drawIcon(breakIndexPosX, breakIndexPosY, breakIndexImage, ctx, VMin(4));
				}

			}, 40, false);
		},

		closePosition: function($scope)
		{
			if(window.currentLang == 'en')
			{
				var user = $scope.user;

				if(!user.assetTradeCount)
				{
					var newAssetCounter = {EURUSD: 0, BTCUSD: 0, GBPUSD: 0, ETHUSD: 0, USDJPY: 0, XAUUSD: 0, OILUSD: 0, AAPUSD: 0, GOOUSD: 0};
					user.assetTradeCount = newAssetCounter;
				}

				var key = $scope.currency;

				if(!user.battle)
				{
					if(!user.assetTradeCount[key])
					{
						user.assetTradeCount[key] = 0;
					}

					if(user.assetTradeCount[key] >= 0)
					{
						if(!user.assetTradeCountTime)
						{
							user.assetTradeCountTime = {};
						}
						if(!user.assetTradeCountTime[key])
						{
							user.assetTradeCountTime[key] = 0;
						}

						var timeCheck = new Date().getTime();
						if(timeCheck - user.assetTradeCountTime[key] >= 0)
						{
							var smallestTimeDiff = 99999999999;
							for(assetCountTime in user.assetTradeCountTime)
							{
								if((timeCheck - user.assetTradeCountTime[assetCountTime]) < smallestTimeDiff)
								{
									smallestTimeDiff = timeCheck - user.assetTradeCountTime[assetCountTime];
								}
							}

							if(smallestTimeDiff > 0)
							{
								user.assetTradeCount[key]++;
								user.assetTradeCountTime[key] = timeCheck;
							}
						}
					}
				}

				if(((user.assetTradeCount[key])  == 3 || ((user.assetTradeCount[key]) % 10) == 0) && user.assetTradeCount[key] > 0)
				{
					if(!user.bonus)
					{
						user.bonus = {};
					}

					if(!user.bonus.ready)
					{
						user.bonus.ready = {};
					}

					user.bonus.ready[key] = true;
					$scope.bonus = user.bonus;
					$rootScope.$broadcast('$$rebind::curr');
				}

				Mongo.update({assetTradeCount: user.assetTradeCount, assetTradeCountTime: user.assetTradeCountTime});
			}
		}
	}
})

