angular.module('starter.controllers', [])

.controller('RootCtrl', function($scope) {
})

.controller('TopCtrl', function($scope, $sce, $rootScope, $timeout, $interval, OnlineStatus, PortfolioTitle, Mongo, Ads, $ionicViewSwitcher, $state) {
	var isLoading = false;
	PortfolioTitle.stop();
	PortfolioTitle.start();

	var isLoading = false;
	var loadUserWhenOnline = function()
	{
		if ('top' == $rootScope.screen)
		{
			$scope.isOnline = OnlineStatus.is();
			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });

			if (!$scope.isOnline)
			{
				//
			}
			else if (!isLoading && !$scope.user)
			{
				loadUser();
			}
		}
	};

	$interval.cancel(window.loadCaseUserInterval);
	window.loadCaseUserInterval = $interval(loadUserWhenOnline, 500, 0, false);

	$scope.isOnline = true;

	function loadUser()
	{
		isLoading = true;

		Mongo.getCached(function(user)
		{
			$scope.user = user;

			if(!$scope.user || !user)
			{
				return;
			}

			PortfolioTitle.start();
		}, function() {
			console.log('Error loading user data');

			Mongo.get(function(user)
			{
				if($scope.user)
				{
					return;
				}

				$scope.user = user;
				loadUser();
			}, function(error)
			{
				isLoading = false;
			});
		});

		$timeout.cancel(isLoadingT);
		var isLoadingT = $timeout(function()
		{
			isLoading = false;
		}, 5000);
	};

	$interval.cancel(window.topIntv);
	window.topIntv = $interval(function()
	{
		$scope.isOnline = OnlineStatus.is();

		if (!$scope.isOnline)
		{
			isLoading = false;
		}
		else if ($scope.isOnline && !isLoading)
		{
			loadPlatformData();
			$interval.cancel(window.topIntv);
		}
	}, 500);

	$scope.currYear = new Date().getFullYear();

	const mergeObjects = function(target, source)
	{
		// Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
		for (const key of Object.keys(source)) {
			if (source[key] instanceof Object) Object.assign(source[key], mergeObjects(target[key], source[key]))
		}
		// Join `target` and modified `source`
		Object.assign(target || {}, source)
		return target
	}

	function applyTranslations(data)
	{
		var brokers = data;
		_.each(brokers, function(broker)
		{
			if(broker.translations)
			{
				var translations = broker.translations;
				delete broker.translations;

				if(translations[window.currentLang])
				{
					// overwrite translations object to broker object with translated values while keeping the rest of the broker object intact even the nested properties
					mergeObjects(broker, translations[window.currentLang]);
				}

			}
		});

		return brokers;
	}

	$scope.countryExclusions = {"okx": ['US', 'MY', 'SG', 'BS', 'CA', 'NL', 'BE', 'FR', 'IE']};
	if($rootScope.appConfig && $rootScope.appConfig.countryExclusions)
	{
		$scope.countryExclusions = $rootScope.appConfig.countryExclusions;
	}

	$scope.shouldHideBroker = function(id)
	{
		if(!window.localStorage.userCountry)
		{
			return false;
		}

		if($scope.countryExclusions[id] && $scope.countryExclusions[id].indexOf(window.localStorage.userCountry) > -1)
		{
			return true;
		}

		return false;
	}

	try
	{
		var cachedPlatformData = window.localStorage.cachedPlatformDataV2 ? JSON.parse(window.localStorage.cachedPlatformDataV2) : '';
	} catch(e)
	{
		var cachedPlatformData = null;
	}

	if(cachedPlatformData)
	{
		if(cachedPlatformData.brokers)
		{
			if($scope.user && $scope.user.country && $scope.user.country == 'US')
			{
				$scope.brokerData = cachedPlatformData.brokers["us"];
			}
			else
			{
				$scope.brokerData = cachedPlatformData.brokers["other"];
			}

			// translations
			$scope.brokerData = applyTranslations($scope.brokerData);
		}
		else
		{
			$scope.brokerData = [
				{
					"badges": [
					  {
						"id": "beginners",
						"text": "Best for beginners"
					  },
					  {
						"id": "winner",
						"text": "Winner 2022"
					  }
					],
					"deposit": "$50",
					"depositText": "Start from",
					"domain": "etoro.com",
					"esmaText": "Trade with money you can afford. 79% Lose with this broker",
					"features": [
					  {
						"name": "Founded",
						"value": 2007
					  },
					  {
						"name": "Accounts",
						"value": "20M+"
					  }
					],
					"id": "etoro",
					"img": "img/etoro-logo.png",
					"link": "https://etoro.live/index.php?_DEVICEID_",
					"subtitle": "Forex, Stocks, Crypto, CFD, Commodities, CopyTradeTM",
					"title": "Etoro",
					"translations": {
					  "de": {
						"badges": [
						  {
							"text": "Am besten für Anfänger"
						  },
						  {
							"text": "Gewinner 2022"
						  }
						],
						"depositText": "Beginnen ab",
						"esmaText": "Handle mit Geld, das du dir leisten kannst. 79 % verlieren bei diesem Broker",
						"features": [
						  {
							"name": "Gegründet"
						  },
						  {
							"name": "Konten"
						  }
						],
						"trust": {
						  "name": "Vertrauenswert"
						}
					  },
					  "es": {
						"badges": [
						  {
							"text": "El mejor para principiantes"
						  },
						  {
							"text": "Ganador 2022"
						  }
						],
						"depositText": "Inicio desde",
						"esmaText": "Opera con dinero que puedas permitirte. El 79 % pierde con este bróker",
						"features": [
						  {
							"name": "Fundado"
						  },
						  {
							"name": "Cuentas"
						  }
						],
						"trust": {
						  "name": "Puntuación conf."
						}
					  },
					  "fr": {
						"badges": [
						  {
							"text": "Le meilleur pour les débutants"
						  },
						  {
							"text": "Vainqueur 2022"
						  }
						],
						"depositText": "À partir de",
						"esmaText": "Tradez avec de l'argent que vous pouvez vous permettre. 79 % perdent avec ce courtier",
						"features": [
						  {
							"name": "Fondée"
						  },
						  {
							"name": "Comptes"
						  }
						],
						"trust": {
						  "name": "Score confiance"
						}
					  },
					  "it": {
						"badges": [
						  {
							"text": "Il migliore per i principianti"
						  },
						  {
							"text": "Vincitore 2022"
						  }
						],
						"depositText": "Inizia da",
						"esmaText": "Fai trading con denaro che puoi permetterti. Il 79% perde con questo broker",
						"features": [
						  {
							"name": "Fondata"
						  },
						  {
							"name": "Account"
						  }
						],
						"trust": {
						  "name": "Punteggio fiducia"
						}
					  },
					  "pt": {
						"badges": [
						  {
							"text": "Melhor para iniciantes"
						  },
						  {
							"text": "Vencedor 2022"
						  }
						],
						"depositText": "Comece de",
						"esmaText": "Opere com dinheiro que você pode se dar ao luxo. 79% perdem com este corretor",
						"features": [
						  {
							"name": "Fundada"
						  },
						  {
							"name": "Contas"
						  }
						],
						"trust": {
						  "name": "Pontuação conf."
						}
					  }
					},
					"trust": {
					  "name": "Trust Score",
					  "value": 4.8
					}
				}
			];
		}

		if(cachedPlatformData.traders)
		{
			$scope.traderData = cachedPlatformData.traders;
		}
		else
		{
			$scope.traderData = [
				{
					"id": "Ajayedwardsmith",
					"name": "Jay Edward Smithhhhhhhh",
					"image": "img/avatars/avatar-100.png",
					"link": "https://etoro.tw/2JZQX9q",
					"risk": "6",
					"gain": "6",
					"copiers": "2322"
				}
			];
		}
	}
	else
	{
		$scope.brokerData = [
			{
				"badges": [
				  {
					"id": "beginners",
					"text": "Best for beginners"
				  },
				  {
					"id": "winner",
					"text": "Winner 2022"
				  }
				],
				"deposit": "$50",
				"depositText": "Start from",
				"domain": "etoro.com",
				"esmaText": "Trade with money you can afford. 79% Lose with this broker",
				"features": [
				  {
					"name": "Founded",
					"value": 2007
				  },
				  {
					"name": "Accounts",
					"value": "20M+"
				  }
				],
				"id": "etoro",
				"img": "img/etoro-logo.png",
				"link": "https://etoro.live/index.php?_DEVICEID_",
				"subtitle": "Forex, Stocks, Crypto, CFD, Commodities, CopyTradeTM",
				"title": "Etoro",
				"translations": {
				  "de": {
					"badges": [
					  {
						"text": "Am besten für Anfänger"
					  },
					  {
						"text": "Gewinner 2022"
					  }
					],
					"depositText": "Beginnen ab",
					"esmaText": "Handle mit Geld, das du dir leisten kannst. 79 % verlieren bei diesem Broker",
					"features": [
					  {
						"name": "Gegründet"
					  },
					  {
						"name": "Konten"
					  }
					],
					"trust": {
					  "name": "Vertrauenswert"
					}
				  },
				  "es": {
					"badges": [
					  {
						"text": "El mejor para principiantes"
					  },
					  {
						"text": "Ganador 2022"
					  }
					],
					"depositText": "Inicio desde",
					"esmaText": "Opera con dinero que puedas permitirte. El 79 % pierde con este bróker",
					"features": [
					  {
						"name": "Fundado"
					  },
					  {
						"name": "Cuentas"
					  }
					],
					"trust": {
					  "name": "Puntuación conf."
					}
				  },
				  "fr": {
					"badges": [
					  {
						"text": "Le meilleur pour les débutants"
					  },
					  {
						"text": "Vainqueur 2022"
					  }
					],
					"depositText": "À partir de",
					"esmaText": "Tradez avec de l'argent que vous pouvez vous permettre. 79 % perdent avec ce courtier",
					"features": [
					  {
						"name": "Fondée"
					  },
					  {
						"name": "Comptes"
					  }
					],
					"trust": {
					  "name": "Score confiance"
					}
				  },
				  "it": {
					"badges": [
					  {
						"text": "Il migliore per i principianti"
					  },
					  {
						"text": "Vincitore 2022"
					  }
					],
					"depositText": "Inizia da",
					"esmaText": "Fai trading con denaro che puoi permetterti. Il 79% perde con questo broker",
					"features": [
					  {
						"name": "Fondata"
					  },
					  {
						"name": "Account"
					  }
					],
					"trust": {
					  "name": "Punteggio fiducia"
					}
				  },
				  "pt": {
					"badges": [
					  {
						"text": "Melhor para iniciantes"
					  },
					  {
						"text": "Vencedor 2022"
					  }
					],
					"depositText": "Comece de",
					"esmaText": "Opere com dinheiro que você pode se dar ao luxo. 79% perdem com este corretor",
					"features": [
					  {
						"name": "Fundada"
					  },
					  {
						"name": "Contas"
					  }
					],
					"trust": {
					  "name": "Pontuação conf."
					}
				  }
				},
				"trust": {
				  "name": "Trust Score",
				  "value": 4.8
				}
			}
		];

		$scope.traderData = [
			{
				"id": "jayedwardsmith",
				"name": "AJay Edward Smithhhhhhhh",
				"image": "img/avatars/avatar-100.png",
				"link": "https://etoro.tw/2JZQX9q",
				"risk": "6",
				"gain": "6",
				"copiers": "2322"
			}
		];
	}

	var allPlatformData;

	$scope.disclaimerTraders = $sce.trustAsHtml(window.localStorage.cachedDisclaimerTraders || '');
	$scope.disclaimerBrokers = $sce.trustAsHtml(window.localStorage.cachedDisclaimerBrokers || '');

	var loadPlatformData = function()
	{
		var platformDataVersionRef = firebase.database().ref('platformData-v2').child('platformDataVersion');
		platformDataVersionRef.once('value', function(snap)
		{
			var platformDataVersion = snap.val();
			try
			{
				if(	!window.localStorage.platformDataVersionV2 ||
					!window.localStorage.cachedPlatformDataV2 ||
					(window.localStorage.platformDataVersionV2 && parseInt(window.localStorage.platformDataVersionV2) < parseInt(platformDataVersion)))
				{
					var platformDataRef = firebase.database().ref('platformData-v2');
					platformDataRef.once('value', function(snap)
					{
						allPlatformData = snap.val();

						if(allPlatformData.disclaimerTraders)
						{
							$scope.disclaimerTraders = $sce.trustAsHtml(allPlatformData.disclaimerTraders);
							window.localStorage.cachedDisclaimerTraders = allPlatformData.disclaimerTraders;
						}
						else
						{
							$scope.disclaimerTraders = '';
							window.localStorage.removeItem('cachedDisclaimerTraders');
						}

						if(allPlatformData.disclaimerBrokers)
						{
							$scope.disclaimerBrokers = $sce.trustAsHtml(allPlatformData.disclaimerBrokers);
							window.localStorage.cachedDisclaimerBrokers = allPlatformData.disclaimerBrokers;
						}
						else
						{
							$scope.disclaimerBrokers = '';
							window.localStorage.removeItem('cachedDisclaimerBrokers');
						}

						updateData();
					});
				}
				else
				{
					updateData(true);
				}
			} catch(e)
			{
				console.log(e);
				window.localStorage.removeItem('platformDataVersion');
				window.localStorage.removeItem('cachedPlatformData');
			}
		});
	};

	$scope.brokersVisible = window.localStorage.brokersVisible ? window.localStorage.brokersVisible : 0;
	$scope.lastUserWins = window.localStorage.lastUserWins ? window.localStorage.lastUserWins : 0;

	// +4 wins makes up 8% of width atm, using that as minimum so there's something to show with no wins
	var requiredWins = 50 + 4;
	$scope.progressBar = 8 + (($scope.lastUserWins / requiredWins) * 100);

	$scope.allBrokersVisible = window.localStorage.allBrokersVisible ? window.localStorage.allBrokersVisible : 0;
	$scope.allTradersVisible = window.localStorage.allTradersVisible ? window.localStorage.allTradersVisible : 0;

	$scope.platformType = 0;

	// initial switch for equal-ish analytics
	$rootScope.trackEvent('Brokers', 'Switch_brokers');
	$scope.switchPlatformType = function(index)
	{
		$rootScope.trackEvent('Brokers', 'Switch_' + (index ? 'traders' : 'brokers'));
		$scope.platformType = index;
	}

	$scope.watchAd = function(type)
	{
		$rootScope.trackEvent('Brokers', 'Ad_' + type);
		if(type == 'brokers')
		{
			$scope.allBrokersVisible = 1;
			window.localStorage.allBrokersVisible = 1;
		}
		else
		{
			$scope.allTradersVisible = 1;
			window.localStorage.allTradersVisible = 1;
		}
		Ads.show();
	};

	$scope.goToPro = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.pro');
	}

	$scope.showBrokers = function(lucky)
	{
		$rootScope.trackEvent("Brokers", "Show_" + (lucky ? "Lucky" : "Trades_50"));
		$scope.brokersVisible = 1;
		window.localStorage.brokersVisible = 1;
	}

	function updateData(useCached)
	{
		Mongo.getCached(function(user)
		{
			$scope.user = user;

			if($scope.user && $scope.user.wins)
			{
				$scope.lastUserWins = $scope.user.wins;
				window.localStorage.lastUserWins = $scope.lastUserWins;

				if($scope.lastUserWins >= 50)
				{
					$scope.showBrokers();
				}
			}

			if(useCached)
			{
				try
				{
					if($scope.user && $scope.user.country && $scope.user.country == 'US')
					{
						$scope.brokerData = JSON.parse(window.localStorage.cachedPlatformDataV2).brokers["us"];
					}
					else
					{
						$scope.brokerData = JSON.parse(window.localStorage.cachedPlatformDataV2).brokers["other"];
					}

					// translations
					$scope.brokerData = applyTranslations($scope.brokerData);

					$scope.traderData = JSON.parse(window.localStorage.cachedPlatformDataV2).traders;
				} catch(e)
				{
					updateData(false);
				}
			}
			else
			{
				if($scope.user && $scope.user.country && $scope.user.country == 'US')
				{
					$scope.brokerData = allPlatformData.brokers["us"];
				}
				else
				{
					$scope.brokerData = allPlatformData.brokers["other"];
				}

				// translations
				$scope.brokerData = applyTranslations($scope.brokerData);

				$scope.traderData = allPlatformData.traders;
				try
				{
					window.localStorage.cachedPlatformDataV2 = JSON.stringify(allPlatformData);
				} catch(e)
				{
					console.log(e);
				}
				window.localStorage.platformDataVersionV2 = allPlatformData.platformDataVersion;
			}
		});
	}

	$scope.toggleAnswer = function(el)
	{
		if(!el || !el.target)
		{
			return
		}

		var element = el.target.querySelectorAll('.answer')[0];
		element.parentNode.classList.toggle('show');
	    if (!element.style.height || element.style.height == '0' || element.style.height == '0px') {
			$rootScope.trackEvent('Brokers', 'FAQ_Open');
	        element.style.height = element.scrollHeight + 'px';
	    } else {
	        element.style.height = '0';
	    }
	}

	$scope.openTopLink = function(event)
	{
		var el = angular.element(event.target);
		while (el[0] && (el[0].tagName != 'TR'))
		{
			el = el.parent();;
		}

		event.preventDefault();

		var l = el.find('a');
		var url = l.attr('ng-click');

		/* var url = l.attr('href');var url = 'openLink("' + url + '")'; */
		url = url.substring(10, url.length);
		url = url.substring(0, url.length - 2);
		$scope.openLink(url, 'top');
	};

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url != '/top')
		{
			return;
		}

		PortfolioTitle.stop();
		PortfolioTitle.start();
		updateData(true);
	});
})

.controller('LessonsCtrl', function($scope, $ionicHistory, $ImageCacheFactory, Lessons, $rootScope, $state, RenderedLessons, $ionicLoading, $timeout, LessonOpener, $sce, $cordovaMedia, SectionLock, PortfolioTitle, $ionicSideMenuDelegate, $state, $ionicViewSwitcher, BestTimeMarket, MarketStatus, LoaderOverlay) {
	PortfolioTitle.stop();
	PortfolioTitle.start();

	$ionicSideMenuDelegate.canDragContent(false);

	$scope.play = function(src) {
		var media = new Media(src, null, null, mediaStatusCallback);
		$cordovaMedia.play(media);
	}

	var mediaStatusCallback = function(status) {
		if(status == 1) {
			// if($ionicLoading._getLoader().$$state.status)
			// {
				// LoaderOverlay.forceShow();
			// }
		} else {
			// LoaderOverlay.hide();
		}
	}
	$scope.isCompleted = function(i)
	{
		return SectionLock.isCompletedLesson(i);
	};

	$scope.isUniversityLocked = function()
	{
		var locked = false;
		_.each(window.articleCategories[0], function(id)
		{
			if (!SectionLock.isCompletedLesson(id))
			{
				locked = true;
			}
		});

		return locked;
	};

	var idx = 0;
	if (LessonOpener.getLast() >= 8)
	{
		idx = 1;
	}
	else
	{
		//~ idx = $scope.isUniversityLocked() ? 0 : 1;
		idx = 0;
	}

	$scope.options = {
		onTouchStart: function()
		{
			$rootScope.$emit('stopsvg');
		},
		speed: 500,
		slidesPerView: 1.07,
		centeredSlides: true,
		touchMoveStopPropagation: true,
		onTouchEnd: function()
		{
			clearTimeout(touchEndT);
			var touchEndT = setTimeout(function(){
				$rootScope.$emit('startsvg');
			}, 800);
		},
		resistance: false,
		resistanceRatio: 0,
		threshold: 0,
		longSwipesRatio: 0,
		longSwipesMs: 0,
		initialSlide: idx
	};

	$scope.types = [0, 1];

	$scope.listOptions = {
		onlyExternal: true,
		autoHeight: true,
		speed: 500,
		initialSlide: idx
	};

	$scope.$on("$ionicSlides.sliderInitialized", function(event, data)
	{
		if (angular.element(data.slider.container.parent()).hasClass('lessons-list-container'))
		{
			$scope.lessonsSlider = data.slider;
		}
		else
		{
			$scope.topSlider = data.slider;
		}
	});

	$scope.$on("$ionicSlides.slideChangeStart", function(event, data){
		if (!$scope.lessonsSlider || isNaN(data.slider.progress))
		{
			return;
		}

		$scope.lessonsSlider.slideTo(data.slider.progress);
	});

	$scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
		$scope.setType(data.slider.progress, 0, false);
		//~ $scope.setLocalStorage('schoolSlide', data.slider.progress, true);
	});

	var arr = Lessons.all($scope.type);
	for (var c = 0; c < _.keys(arr).length; c++) {
		var key = _.keys(arr)[c];
		for (var k = 0; k < arr[key].length; k++) {
			arr[key][k].isCompleted = SectionLock.isCompletedLesson(arr[key][k].id);
		}
	}

	$scope.lessons = arr;

	$scope.setType = function(type)
	{
		$scope.type = type;

		if ($scope.lessonsSlider)
		{
			$scope.lessonsSlider.slideTo(type);
			$scope.topSlider.slideTo(type);
		}

		$timeout.cancel(digestT);
		var digestT = $timeout(function()
		{
			$scope.$digest();
		});
	};

	$scope.open = function(id, evnt)
	{
		if (evnt == 'best-time')
		{
			$rootScope.trackEvent('Lessons', 'Open_BestTime');
		}
		else
		{
			$rootScope.trackEvent('Lessons', 'Open_Manually_' + id);
		}
		$scope.$destroy();

		if(id == 999)
		{
			$ionicViewSwitcher.nextDirection("enter");
			$state.go('tab.game');
			return;
		}

		LessonOpener.open(id);
	};

	var currentBestTime = window.localStorage.lastBestTradingTime || 'Best time to trade starts in <span class="icon-clock"></span> <b>1:30:10</b>';
	$scope.bestTradingTime = currentBestTime;

	var calculateBestTime = function() {

		var bestTime = MarketStatus.formatTime(BestTimeMarket.untilOpen());
		var pre = $rootScope.t('Best time to trade starts in <span class="icon-clock"></span> <b>');
		var newBestTime = pre.concat(bestTime);

		if ('0:00:00' == bestTime)
		{
			var bestTimeEnds = MarketStatus.formatTime(BestTimeMarket.untilClose());
			var pre = $rootScope.t('Best time to trade starts in <span class="icon-clock"></span> <b>');
			var newBestTime = pre.concat(bestTimeEnds).concat('</b>');
		}
		else
		{
			bestTimeEnds = null;
		}

		if (newBestTime != currentBestTime)
		{
			currentBestTime = newBestTime;
		}

		$scope.bestTradingTime = currentBestTime;

		$scope.$apply();
	};

	function startBestTime()
	{
		window.bestTradingTimeInterval = window.setInterval(function()
		{
			calculateBestTime();
			$scope.$digest();
		}, 500);
	}

	startBestTime();

	function scrollStuff()
	{
		var scrollEl = document.querySelector('.lessons .scroll');
		if(scrollEl)
		{
			scrollEl.addEventListener('scrollend', function()
			{
				window.localStorage.lessonsLastScrollPos = scrollEl.scrollTop;
			});
		}
	}

	$timeout(function()
	{
		scrollStuff();
	}, 500);

	function scrollTo(element, to, duration) {
	    if (duration <= 0) return;
	    var difference = to - element.scrollTop;
	    var perTick = difference / duration * 10;

	    setTimeout(function() {
	        element.scrollTop = element.scrollTop + perTick;
	        if (element.scrollTop === to) return;
	        scrollTo(element, to, duration - 10);
	    }, 10);
	}

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url != '/lessons')
		{
			window.localStorage.lastBestTradingTime = $scope.bestTradingTime;
			window.clearInterval(window.bestTradingTimeInterval);
			return;
		}

		if(window.lessonScrollTo) window.clearTimeout(window.lessonScrollTo);
		window.lessonScrollTo = window.setTimeout(function()
		{
			if(fromState && fromState.name == 'tab.lessons-read' && window.localStorage.lessonsLastScrollPos)
			{
				var scrollEl = document.querySelector('.lessons .scroll');
				if(scrollEl)
				{
					scrollTo(scrollEl, window.localStorage.lessonsLastScrollPos, 200);
				}
			}
		}, 100);

		startBestTime();
	});
})

.controller('LessonsReadCtrl', function($scope, RenderedLessons, $stateParams, QuizCountdown, Lessons, $ionicScrollDelegate, $ionicPopup, $rootScope, $timeout, $sce, $rootScope, LessonOpener, SectionLock, OnlineStatus, PortfolioTitle, $ionicScrollDelegate, CoinGame, Mongo, $ionicSideMenuDelegate) {
	//~ RenderedLessons.clearCache();

	$ionicSideMenuDelegate.canDragContent(false);

	var id = $stateParams.lessonId;
	$scope.id = id;
	$scope.lesson = Lessons.get(id);
	$scope.isLast = Lessons.isLast(id);
	$scope.isSocialTrading = Lessons.isSocialTrading(id);

	$timeout(function()
	{
		var textEl = document.querySelectorAll('.lesson-text');
		if(textEl && textEl[0] && textEl[0].children && textEl[0].children[0] && textEl[0].children[0].innerHTML == '')
		{
			$scope.open(id);
		}
	}, 30);

	var allArticles = [];
	_.each(window.articleCategories, function(cat)
	{
		allArticles = allArticles.concat(cat);
	});

	var nextIndex = allArticles.indexOf(parseInt(id)) + 1;
	while ((nextIndex < allArticles.length) && !_.filter(window.training[window.currentLang], function(article) { return article.id == allArticles[nextIndex]}).shift())
	{
		nextIndex++;
	}

	$scope.nextLessonID = allArticles[nextIndex];

	// $timeout.cancel(portfolioT);
	// var portfolioT = $timeout(function()
	// {
	// 	var view = document.getElementById('mainScroll_' + id).firstChild;
	// 	view.addEventListener('scroll', function (e)
	// 	{
	// 		if (view.scrollTop > 30)
	// 		{
	// 			PortfolioTitle.start();
	// 		}

	// 		if(view.scrollTop <= 30)
	// 		{
	// 			// PortfolioTitle.stop($scope.lesson.title);
	// 			PortfolioTitle.restore($scope.lesson.title);
	// 		}
	// 	});
	// }, 0, false);

	$rootScope.setScreen('lessonsread', $scope);

	$scope.trackView('Lesson: ' + $scope.lesson.title);

	$scope.getReward = $rootScope.getReward;

	// PortfolioTitle.restore($scope.lesson.title);

	PortfolioTitle.stop();
	PortfolioTitle.start();

	$scope.getRewardComplete = function(id)
	{
		var text = '';

		if (window.rewards[id])
		{
			text = $scope.t('collected') + ' $' + CanvasJS.formatNumber(window.rewards[id], "#") + ' ' + $scope.t(' play money');
		}
		else
		{
			if (11 == id)
			{
				text = $scope.t('Unlocked candlestick charts');
			}
			else if (12 == id)
			{
				text = $scope.t('unlocked stock trading');
			}
			else if (13 == id)
			{
				text = $scope.t('unlocked gold trading');
			}
			else if (14 == id)
			{
				text = $scope.t('unlocked oil trading');
			}
			else if (15 == id)
			{
				text = $scope.t('unlocked cryptocurrency trading');
			}
			else if (16 == id)
			{
				text = $scope.t('unlocked high leverage trading');
			}
		}

		return $sce.trustAsHtml(text);
	};

	$scope.reward = $rootScope.getReward($scope.lesson.id);

	$scope.finishMsg = $rootScope.t('To finish the lesson answer 3 questions', null, 'To finish the lesson answer 3 questions and');
	if($scope.lesson.questions)
	{
		var qs = $scope.lesson.questions.length;
		if (qs < 3)
		{
			$scope.finishMsg = $scope.finishMsg.replace('3', qs);
		}
	}

	// QuizCountdown.setScope($scope);
	// QuizCountdown.setTimeLimit(30000);

	// $scope.countdownTimeout = function()
	// {
	// 	$scope.setAnswer(null);
	// };

	$timeout.cancel(resizeT);
	var resizeT = $timeout(function() {
		$scope.$broadcast('scroll.resize')
		$ionicScrollDelegate.$getByHandle('mainScroll').resize();
		$ionicScrollDelegate.resize();

	}, 5000, false);

	$rootScope.trackEvent("Lessons", "Open_" + $scope.lesson.id);

	$scope.open = function(id)
	{
		// $rootScope.$emit('deletesvg');

		window.clearTimeout(deleteT);
		var deleteT = window.setTimeout(function()
		{
			// $scope.$destroy();
			$scope.$digest();
			LessonOpener.open(id);
		});
	};

	$scope.completeLesson = function()
	{
		$rootScope.trackEvent("Lessons", "OpenQuiz_" + $scope.lesson.id);
		if (!$scope.lesson.questions || !$scope.lesson.questions.length)
		{
			$scope.setAnswer(0, 0, 0, true);
			return;
		}

		var questions = angular.copy($scope.lesson.questions);
		questions = _.shuffle(questions).slice(0, 3);
		$scope.questions = questions;
		$scope.questionIndex = 0;
		$scope.questionCount = questions.length;

		$scope.question = questions[0];

		$scope.showQuestion = true;

		if (!$scope.wrongAnswer)
		{
			var progressSpacer = $scope.questionCount == 2 ? '<div class="spacer"></div>' : '';
			$scope.questionPopup = $ionicPopup.show({
				template: '<div class="question-progress">' + progressSpacer + '<div ng-repeat="(i, q) in questions" ng-class="{\'active\': i == questionIndex, \'correct\': i < questionIndex, \'wrong\': wrongAnswer}"></div>' + progressSpacer + '</div>\
				<div class="question-content" ng-show="!wrongAnswer"><div class="question-index">' + $scope.t('Question') + ' {{ questionIndex + 1 }}<t>/</t>{{ questionCount }}</div><div class="question">{{ question.question }}</div><count-down-timer></count-down-timer></div><ion-list class="lessons answers" ng-show="!wrongAnswer"> \
				<div ng-repeat="(i, answer) in question.answers" ng-click="setAnswer(i)" ng-class="{\'isRight\': i == question.right}" type="item-text-wrap" class="item item-thumbnail-left"> \
				<table><tr><td>{{ questionLetter(i) }}</td> \
				<td><span class="lesson-title">{{ answer }}</span></td></tr></table> \
				</div></ion-list></div> \
				<div id="incorrect-answer" ng-show="wrongAnswer"><div class="wrong-answer"><t>Oops, <em>wrong</em> answer!</t></div><div class="wrong-answer-explained"><t>To complete this lesson you need to answer all 3 questions <em>correctly</em>.</t>\
				<div ng-click="completeLesson()"><button class="button button-balanced"><t>Restart</t></button></div></div>',
				title: '',
				subTitle: '',
				backdrop: 'static',
				cssClass: 'lesson-questions',
				scope: $scope
			});
		}

		// QuizCountdown.start();
		$scope.wrongAnswer = false;

		$scope.closeBackdrop = function(e) {
			if (!e || e.target.tagName == 'HTML')
			{
				$scope.questionPopup.close();
				document.removeEventListener("click", $scope.closeBackdrop);
			}
		};

		document.addEventListener("click", $scope.closeBackdrop);
	};

	$scope.questionLetter = function(i)
	{
		return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'][i];
	};

	$scope.setAnswer = function(i, isRight, event, noQuestionsAsked)
	{
		if (($scope.question && ($scope.question.right == i)) || (noQuestionsAsked))
		{
			if (!noQuestionsAsked && ($scope.questionIndex < $scope.questionCount - 1))
			{
				$scope.questionIndex++;
				$scope.question = $scope.questions[$scope.questionIndex];
				// QuizCountdown.start();
				return;
			}

			// QuizCountdown.stop();

			$scope.isAnswered = true;

			if (!noQuestionsAsked)
			{
				$scope.closeBackdrop();
			}
			else
			{
				$scope.showQuestion = true;
			}

			$scope.setLocalStorage('completedLessons', id, true);
			Mongo.getCached(function(user)
			{
				Mongo.lessonCompleted({"id": parseInt(id)});
			});

			$scope.trackEvent("Lessons", "Complete", 'Right');
			Mongo.markCompleteLesson(id);
			$scope.isCompleted = true;

			if(!window.localStorage.lessonReviewSeen)
			{
				window.setTimeout(function()
				{
					$rootScope.toggleReviewFeedback('Lesson_1_Completed');
					window.localStorage.lessonReviewSeen = true;
				}, 1000);
			}
		}
		else
		{
			// QuizCountdown.stop();
			$scope.isAnswered = true;
			$scope.trackEvent("Lessons", "Complete", 'Wrong');
			$scope.wrongAnswer = true;

			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });
		}
	};

	$scope.isCompleted = SectionLock.isCompletedLesson(id);

	$scope.alreadyCompleted = $scope.isCompleted;
})

.controller('LessonsFinishCtrl', function($scope, Lessons, $rootScope) {

})

.controller('GameCtrl', function($scope, GameCats, $rootScope, $ionicScrollDelegate, $timeout, LessonOpener, SectionLock, PortfolioTitle, Mongo, $ionicSideMenuDelegate) {
	PortfolioTitle.stop();
	PortfolioTitle.restore($scope.t('QUIZ'));

	$ionicSideMenuDelegate.canDragContent(false);

	$scope.categories = GameCats.all();

	// no lock for pro quiz for now.
	// unlock Pro section offline if the first 3 lessons are completed
	$scope.isProLocked = false;
	// for (var k = 0; k <= 2; k++)
	// {
	// 	if (!$scope.getLocalStorage('completedLessons', k))
	// 	{
	// 		$scope.isProLocked = true;
	// 	}
	// }

	$scope.setCategory = function(cat)
	{
		$scope.category = cat;
		$scope.leverage = [5, 20][cat];
		$scope.gameHref = '#/tab/game/' + $scope.category;
		window.localStorage.quizCategory = cat;

		if (1 == cat && $scope.isProLocked)
		{
			document.querySelector('.quiz-game-href').classList.add('locked');
		}
		else
		{
			document.querySelector('.quiz-game-href').classList.remove('locked');
		}

		if(document.querySelector('.quiz-game-href'))
		{
			document.querySelector('.quiz-game-href').setAttribute('href', $scope.gameHref);
		}
	};

	// no lock for pro quiz for now.
	// Mongo.getCached(function(user)
	// {
	// 	$scope.proPass = [Mongo.portfolioValue() >= 2000, !!SectionLock.isCompletedLesson(1), !!SectionLock.isCompletedLesson(2)];
	// 	$scope.isProLocked = $scope.proPass.reduce(function(a, b) { return a + b; }, 0) < 3;
	// 	$timeout(function() { $scope.$apply(); });
	// });

	$scope.setCategory(parseInt(window.localStorage.quizCategory) || 0);

	$scope.openLesson = function(id)
	{
		LessonOpener.open(id);
	};
})

.controller('GamePlayCtrl', function($scope, $ionicPopup, VMin, QuizCountdown, GameCats, Game, $stateParams, $timeout, $interval, $rootScope, $ionicBackdrop, OnlineStatus, $ionicScrollDelegate, CoinGame, Mongo, $ionicSideMenuDelegate) {

	$rootScope.setScreen('quizplay', $scope);

	$ionicSideMenuDelegate.canDragContent(false);

	$scope.showLargeImage = false;

	$scope.Math = window.Math;

	QuizCountdown.setScope($scope);
	QuizCountdown.setTimeLimit(30000);

	$scope.showAnswers = false;

	$scope.options = {
		centeredSlides: true,
		touchMoveStopPropagation: true,
		pagination: false
	};

	$scope.listOptions = {
		onlyExternal: true,
		resistance : true,
		resistanceRatio : 0,
		speed: 200
	};

	$scope.$on("$ionicSlides.sliderInitialized", function(event, data)
	{
		$scope.lessonsSlider = data.slider;
	});

	var contentHeight = document.getElementsByTagName('ion-content')[0].clientHeight - (document.getElementById('progress').clientHeight * 4);

	var calculatePotentialBonus = function()
	{
		$scope.correctBonus = '$' + $scope.leverage;
		Mongo.getCached(function(user)
		{
			$scope.reducedBonus = Mongo.canReduceBonus(user, $scope.cat == 1) ? '- $' + $scope.leverage : '';
			if($scope.leverage == 20)
			{
				$scope.reducedBonus = Mongo.canReduceBonus(user, $scope.cat == 1) ? '- $' + ($scope.leverage / 2) : '';
			}
			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });
		});
	};

	var resizeLayout = function() {

		var q = $scope.questions[$scope.id];

		var qc = document.getElementsByClassName('question-and-chart')[0];
		var a = document.getElementsByClassName('answer-container')[0];

		var answerHeight = VMin((q.a.length * 20) + 5);

		var qContHeight = qc.parentNode.parentNode.clientHeight - answerHeight;

		a.style.height = answerHeight + 'px';
		qc.style.height = qContHeight + 'px';

		var textSizing = document.getElementsByClassName('question-text-sizing')[0];
		var availableHeight = qContHeight - VMin(27);

		if(document.getElementsByClassName('question-and-chart')[0].offsetWidth >= 768)
		{
			var availableHeight = qContHeight - VMin(15);
		}

		if (availableHeight < 100)
		{
			$interval.cancel(window.resizeLayoutI);
			window.resizeLayoutI = $interval(function() {
				resizeLayout();
			}, 100, 5, null);
			return;
		}

		textSizing.innerHTML = q.q;
		textSizing.style = '';
		if (q.image || q.chart)
		{
			var imgHeight = availableHeight / 2;
			var rounds = 0;
			while (textSizing.clientHeight + imgHeight > availableHeight)
			{
				textSizing.style.fontSize = Math.max(VMin(3), (getFontSize(textSizing) - 1)) + 'px';
				imgHeight = Math.max(40, imgHeight * 0.8);

				if (++rounds > 10)
				{
					break;
				}
			}

			var imgHeight = availableHeight - textSizing.clientHeight;
		}
		else
		{
			while (textSizing.clientHeight > availableHeight)
			{
				textSizing.style.fontSize = (getFontSize(textSizing) - 1) + 'px';
			}
		}

		$scope.imgHeight = imgHeight + 'px';
		$scope.fontSize = textSizing.style.fontSize ? getFontSize(textSizing) + 'px' : '';
	};

	$scope.playAgain = function(track)
	{
		QuizCountdown.start();
		$scope.answers = [];
		$scope.isRightAnswer = [];
		$scope.bonus = {};
		$scope.bonusTotal = 0;
		$scope.showAnswers = false;
		$scope.score = 0;
		$scope.finished = false;
		$scope.answered = false;
		$scope.cat = $stateParams.category;
		$scope.leverage = [5, 20][$scope.cat];

		calculatePotentialBonus();

		if ($scope.cat.indexOf('.') > 0)
		{
			$scope.cat = $scope.cat.substring(0, $scope.cat.indexOf('.'));
		}

		$scope.started = 1;
		$scope.gameTitle = GameCats.getTitle($scope.cat);
		$scope.questions = Game.getQuestions($scope.cat);
		$scope.id = 0;
		$scope.started = true;

		$scope.trackEvent("Quiz", "Play again", 'Clicked');
		$scope.trackView('Quiz: ' + $scope.gameTitle);

		$scope.nextRand = Math.round(Math.random() * 100000);

		$timeout.cancel(digestT);
		var digestT = $timeout(function() { $scope.$digest(); });

		$timeout.cancel(resizeT);
		var resizeT = $timeout(function() { $ionicScrollDelegate.resize(); }, 500);

		CoinGame.deleteCoin();

		resizeLayout();
	};

	$scope.doShowAnswers = function()
	{
		Mongo.addBonus(20);
		$scope.showAnswers = true;
		$scope.trackEvent("Quiz", "See Answers", 'Clicked');

		$timeout.cancel(resizeT);
		var resizeT = $timeout(function() { $ionicScrollDelegate.resize(); }, 500);

		CoinGame.deleteCoin();
	};

	$scope.playAgainLater = function()
	{
		$scope.trackEvent("Quiz", "Return to Quiz", 'Clicked');
		$timeout.cancel(playAgainT);
		var playAgainT = $timeout(function() { $scope.playAgain(); }, 500);
	};

	$scope.playAgain();

	$scope.$watch('id', function()
	{
		$scope.question = $scope.questions[$scope.id];
	});

	$scope.questionLetter = function(i)
	{
		return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'][i];
	};

	$scope.showLarge = function()
	{
		if ($scope.showLargeImage)
		{
			return;
		}

		$scope.showLargeImage = true;
		var bd = document.getElementsByClassName('backdrop')[0];
		bd.classList.add('clickable');
		bd.innerHTML = document.getElementById('quiz-large-image').outerHTML;
		$ionicBackdrop.retain();

		bd.onclick = null;

		var hash = window.location.hash;

		$interval.cancel($scope.backDropWatcher);
		$scope.backDropWatcher = $interval(function()
		{
			if (hash != window.location.hash)
			{
				$scope.hideLarge();
			}
		}, 20, 0, false);

		$scope.$on("$destroy", function() {
			$interval.cancel($scope.backDropWatcher);
		});

		bd.onclick = function()
		{
			bd.classList.remove('clickable');
			$scope.hideLarge();
		};
	};

	$scope.hideLarge = function()
	{
		if (!$scope.showLargeImage)
		{
			return;
		}

		$scope.showLargeImage = false;
		$ionicBackdrop.release();
		$interval.cancel($scope.backDropWatcher);
	};

	$scope.isLargeShown = function()
	{
		return $scope.showLargeImage;
	};

	$scope.countdownTimeout = function()
	{
		$scope.setAnswer(null);
	};

	$scope.setAnswer = function(i, isRight, event)
	{
		if ($scope.answers[$scope.id] !== undefined)
		{
			return;
		}

		var el = null;
		if (event)
		{
			var el = event.target;
			while ('DIV' != el.tagName)
			{
				el = el.parentNode;
			}

			angular.element(el).addClass('show-feedback ' + (isRight ? 'right' : 'wrong'));
			$timeout.cancel(answerT);
			var answerT = $timeout(function()
			{
				angular.element(el).removeClass('show-feedback').removeClass('right').removeClass('wrong');
			}, 700);
		}

		QuizCountdown.stop();

		$scope.hideLarge();
		$scope.answers[$scope.id] = i;
		$scope.isRight = $scope.question.r == i;
		$scope.isRightAnswer[$scope.id] = $scope.isRight;

		var setBonus = (function(id)
		{
			return function(amount)
			{
				$scope.bonus[id] = ~~amount;
				$scope.bonusTotal += amount;
				$timeout.cancel(digestT);
				var digestT = $timeout(function() { $scope.$digest; });
			}
		})($scope.id);

		if ($scope.isRight)
		{
			$scope.score++;
			Mongo.addBonus($scope.leverage, setBonus);
			window.localStorage.answeredQuiz = (parseInt(window.localStorage.answeredQuiz) || 0) + 1;
		}
		else
		{
			if($scope.leverage == 5)
			{
				// no reduction for amateur quiz for now
				// Mongo.reduceBonus($scope.leverage / 2, setBonus, $scope.cat == 1);
			}
			else
			{
				Mongo.reduceBonus($scope.leverage / 2, setBonus, $scope.cat == 1);
			}
		}

		$timeout.cancel(nextQuestionT);
		var nextQuestionT = $timeout(function()
		{
			$scope.nextQuestion(isRight, event);
		}, 500);
	};

	function getFontSize(element)
	{
		var size = computedStyle(element, 'font-size');
		if(size.indexOf('em') > -1){
			var defFont = computedStyle(document.body, 'font-size');
			if(defFont.indexOf('pt') > -1){
				defFont = Math.round(parseInt(defFont)*96/72);
			}else{
				defFont = parseInt(defFont);
			}
			size = Math.round(defFont * parseFloat(size)) + 1;
		}
		else if(size.indexOf('pt') > -1){
			size = Math.round(parseInt(size)*96/72)
		}
		return parseInt(size);
	}

	function computedStyle(element, property){
		var s = false;
		if(element.currentStyle){
			var p = property.split('-');
			var str = new String('');
			for(i in p){
				str += (i > 0)?(p[i].substr(0, 1).toUpperCase() + p[i].substr(1)):p[i];
			}
			s = element.currentStyle[str];
		}else if(window.getComputedStyle){
			s = window.getComputedStyle(element, null).getPropertyValue(property);
		}
		return s;
	}

	$scope.nextQuestion = function(isRight, event)
	{
		CoinGame.deleteCoin('free-money');
		if (event)
		{
			var q = document.getElementsByClassName('question-container-table')[0];
			var copy = document.createElement('table');
			copy.innerHTML = q.innerHTML;
			copy.className = 'question-container-table fade slide-out';
			q.parentNode.appendChild(copy);
			q.className = 'question-container-table fade slide-in';

			$timeout.cancel(nextQuestionT);
			var nextQuestionT = $timeout(function()
			{
				//~ q.parentNode.removeChild(copy);
				q.className = 'question-container-table';
			}, 1000);
		}

		$scope.id++;
		$scope.answered = false;

		calculatePotentialBonus();

		QuizCountdown.start();

		if ($scope.id >= $scope.questions.length)
		{
			$scope.finish();
		}
		else
		{
			try
			{
				resizeLayout();
			}
			catch (e)
			{
				return;
			}
		}
	};

	$scope.finish = function()
	{
		QuizCountdown.stop();
		$scope.trackEvent("Quiz", "Finished", $scope.gameTitle, $scope.score);
		$scope.answered = false;
		$scope.finished = true;

		if ($scope.score < 4)
		{
			$scope.level = 1;
		}
		else if ($scope.score < 7)
		{
			$scope.level = 2;
		}
		else if ($scope.score < 9)
		{
			$scope.level = 3;
		}
		else
		{
			$scope.level = 4;
		}

		Game.registerScore($scope.cat, $scope.score);

		$interval.cancel(window.removeThingsI);
		window.removeThingsI = $interval(function()
		{
			var r = document.getElementsByClassName('question-container-table');
			for (var k = 0; k < r.length; k++)
			{
				if (r[k].className.indexOf('slide-out') > 0)
				{
					r[k].parentNode.removeChild(r[k]);
				}
			}
		}, 100, 5, false);


		if(window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).coinGame == true)
		{
			var settingsRef = firebase.database().ref('settings');
			settingsRef.once('value', function(snap)
			{
				var settings = snap.val();

				Mongo.getCached(function(user)
				{
					if(settings.coinGameEnabled && !eval(settings.coinGameExceptions))
					{
						CoinGame.initCoinGame('Quiz');
					}
				});
			});
		}
	};
})

.controller('AccountCtrl', function($scope, PortfolioTitle, $rootScope, $stateParams, $state, $http, UserTop, $timeout, OnlineStatus, $interval, $ionicScrollDelegate, $ionicHistory, $ionicPopup, Mongo, $ionicSideMenuDelegate)
{
	PortfolioTitle.stop();
	PortfolioTitle.restore($rootScope.t('Profile'));
	$ionicSideMenuDelegate.canDragContent(false);

	var initCtrl = function() {
		$ionicSideMenuDelegate.canDragContent(false);
		PortfolioTitle.resetElements();
		PortfolioTitle.stop();
		PortfolioTitle.restore($rootScope.t('Profile'));
		Mongo.updateBreakdown();

		loadUser();
	};

	initCtrl();

	Mongo.updateBreakdown();

	var countries = {"United States":"US","Canada":"CA","United Kingdom":"GB","Argentina":"AR","Australia":"AU","Austria":"AT","Belgium":"BE","Brazil":"BR","Chile":"CL","China":"CN","Colombia":"CO","Croatia":"HR","Denmark":"DK","Dominican Republic":"DO","Egypt":"EG","Finland":"FI","France":"FR","Germany":"DE","Greece":"GR","Hong Kong":"HK","India":"IN","Indonesia":"ID","Ireland":"IE","Israel":"IL","Italy":"IT","Japan":"JP","Jordan":"JO","Kuwait":"KW","Lebanon":"LB","Malaysia":"MY","Mexico":"MX","Netherlands":"NL","New Zealand":"NZ","Nigeria":"NG","Norway":"NO","Pakistan":"PK","Panama":"PA","Peru":"PE","Philippines":"PH","Poland":"PL","Russia":"RU","Saudi Arabia":"SA","Serbia":"RS","Singapore":"SG","South Africa":"ZA","South Korea":"KR","Spain":"ES","Sweden":"SE","Switzerland":"CH","Taiwan":"TW","Thailand":"TH","Turkey":"TR","United Arab Emirates":"AE","Venezuela":"VE","Portugal":"PT","Luxembourg":"LU","Bulgaria":"BG","Czech Republic":"CZ","Slovenia":"SI","Iceland":"IS","Slovakia":"SK","Lithuania":"LT","Trinidad and Tobago":"TT","Bangladesh":"BD","Sri Lanka":"LK","Kenya":"KE","Hungary":"HU","Morocco":"MA","Cyprus":"CY","Jamaica":"JM","Ecuador":"EC","Romania":"RO","Bolivia":"BO","Guatemala":"GT","Costa Rica":"CR","Qatar":"QA","El Salvador":"SV","Honduras":"HN","Nicaragua":"NI","Paraguay":"PY","Uruguay":"UY","Puerto Rico":"PR","Bosnia and Herzegovina":"BA","Palestine":"PS","Tunisia":"TN","Bahrain":"BH","Vietnam":"VN","Ghana":"GH","Mauritius":"MU","Ukraine":"UA","Malta":"MT","The Bahamas":"BS","Maldives":"MV","Oman":"OM","Macedonia":"MK","Latvia":"LV","Estonia":"EE","Iraq":"IQ","Algeria":"DZ","Albania":"AL","Nepal":"NP","Macau":"MO","Montenegro":"ME","Senegal":"SN","Georgia":"GE","Brunei":"BN","Uganda":"UG","Guadeloupe":"GP","Barbados":"BB","Azerbaijan":"AZ","Tanzania":"TZ","Libya":"LY","Martinique":"MQ","Cameroon":"CM","Botswana":"BW","Ethiopia":"ET","Kazakhstan":"KZ","Namibia":"NA","Madagascar":"MG","New Caledonia":"NC","Moldova":"MD","Fiji":"FJ","Belarus":"BY","Jersey":"JE","Guam":"GU","Yemen":"YE","Zambia":"ZM","Isle Of Man":"IM","Haiti":"HT","Cambodia":"KH","Aruba":"AW","French Polynesia":"PF","Afghanistan":"AF","Bermuda":"BM","Guyana":"GY","Armenia":"AM","Malawi":"MW","Antigua":"AG","Rwanda":"RW","Guernsey":"GG","The Gambia":"GM","Faroe Islands":"FO","St. Lucia":"LC","Cayman Islands":"KY","Benin":"BJ","Andorra":"AD","Grenada":"GD","US Virgin Islands":"VI","Belize":"BZ","Saint Vincent and the Grenadines":"VC","Mongolia":"MN","Mozambique":"MZ","Mali":"ML","Angola":"AO","French Guiana":"GF","Uzbekistan":"UZ","Djibouti":"DJ","Burkina Faso":"BF","Monaco":"MC","Togo":"TG","Greenland":"GL","Gabon":"GA","Gibraltar":"GI","Democratic Republic of the Congo":"CD","Kyrgyzstan":"KG","Papua New Guinea":"PG","Bhutan":"BT","Saint Kitts and Nevis":"KN","Swaziland":"SZ","Lesotho":"LS","Laos":"LA","Liechtenstein":"LI","Northern Mariana Islands":"MP","Suriname":"SR","Seychelles":"SC","British Virgin Islands":"VG","Turks and Caicos Islands":"TC","Dominica":"DM","Mauritania":"MR","Aland Islands":"AX","San Marino":"SM","Sierra Leone":"SL","Niger":"NE","Republic of the Congo":"CG","Anguilla":"AI","Mayotte":"YT","Cape Verde":"CV","Guinea":"GN","Turkmenistan":"TM","Burundi":"BI","Tajikistan":"TJ","Vanuatu":"VU","Solomon Islands":"SB","Eritrea":"ER","Samoa":"WS","American Samoa":"AS","Falkland Islands":"FK","Equatorial Guinea":"GQ","Tonga":"TO","Comoros":"KM","Palau":"PW","Federated States of Micronesia":"FM","Central African Republic":"CF","Somalia":"SO","Marshall Islands":"MH","Vatican City":"VA","Chad":"TD","Kiribati":"KI","Sao Tome and Principe":"ST","Tuvalu":"TV","Nauru":"NR","Réunion":"RE"};

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
		'SANUSD': 'Sandbox',
		'NUXUSD': 'Nu Holdings'
	};

	var isLoading = false;

	var loadUserWhenOnline = function()
	{
		if ('account' == $rootScope.screen)
		{
			$scope.isOnline = OnlineStatus.is();
			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });

			if (!$scope.isOnline)
			{
				//
			}
			else if (!isLoading && !$scope.user)
			{
				Mongo.reloadUser();
				loadUser();
			}
		}
	};

	var isLoggedIn = false;

	Mongo.getInfo(function(userbatch)
	{
		$scope.userbatch = userbatch;
	});

	$rootScope.showAvatars = false;

	$scope.avatarList = ['avatar-100.png', 'avatar-101.png', 'avatar-102.png', 'avatar-103.png', 'avatar-104.png', 'avatar-105.png', 'avatar-106.png', 'avatar-107.png', 'avatar-108.png', 'avatar-109.png', 'avatar-110.png', 'avatar-111.png', 'avatar-112.png', 'avatar-113.png', 'avatar-114.png', 'avatar-115.png', 'avatar-116.png', 'avatar-117.png', 'avatar-118.png', 'avatar-119.png', 'avatar-120.png', 'avatar-121.png', 'avatar-122.png', 'avatar-123.png', 'avatar-124.png', 'avatar-125.png', 'avatar-126.png', 'avatar-127.png', 'avatar-128.png', 'avatar-129.png', 'avatar-130.png', 'avatar-131.png', 'avatar-132.png', 'avatar-133.png', 'avatar-134.png', 'avatar-135.png', 'avatar-136.png', 'avatar-137.png', 'avatar-138.png', 'avatar-139.png', 'avatar-140.png', 'avatar-141.png', 'avatar-142.png', 'avatar-143.png', 'avatar-144.png', 'avatar-145.png', 'avatar-146.png', 'avatar-147.png', 'avatar-148.png', 'avatar-149.png', 'avatar-150.png', 'avatar-151.png', 'avatar-152.png', 'avatar-153.png', 'avatar-154.png', 'avatar-155.png', 'avatar-156.png', 'avatar-157.png', 'avatar-158.png', 'avatar-159.png', 'avatar-160.png', 'avatar-161.png', 'avatar-162.png'];

	if(!window.localStorage.currentAvatar)
	{
		var rand = Math.floor(Math.random() * $scope.avatarList.length);
		window.localStorage.currentAvatar = $scope.avatarList[rand];
	}

	$scope.currentAvatar = window.localStorage.currentAvatar;

	$rootScope.toggleAvatars = function()
	{
		$rootScope.trackEvent("Account", "Toggle_Avatars");
		var el = window.document.querySelectorAll('.account .avatars')[0];
		var appElm = angular.element(document.getElementById('app'));

		if($rootScope.showAvatars == false)
		{
			el.classList.add('open');
			$rootScope.showAvatars = true;
			appElm.addClass('state-avatars');
		}
		else
		{
			el.classList.remove('open');
			el.style.removeProperty('transform');
			el.scrollTop = 0;
			$rootScope.showAvatars = false;
            appElm.removeClass('state-avatars');
		}
	}

	$rootScope.getAvatarsState = function()
	{
		return $rootScope.showAvatars;
	}

	$scope.selectAvatar = function(avatarName)
	{
		window.localStorage.currentAvatar = avatarName;
		$scope.currentAvatar = window.localStorage.currentAvatar;
		Mongo.update({avatar: avatarName});
		$rootScope.toggleAvatars();
	}

	$interval.cancel(window.loadUserInterval);
	window.loadUserInterval = $interval(loadUserWhenOnline, 500, 0, false);

	$scope.isOnline = true;

	$scope.getSymbolPricePrefix = function(currency)
	{
		return currency.substr(3, 3) === 'USD' ? '$' : '';
	};

	$scope.getSymbolPriceSuffix = function(currency)
	{
		return currency.substr(3, 3) === 'USD' ? '' : ' ' + currency.substr(3, 3);
	};

	var getSelf = function()
	{
		return userSummary($scope.user, $scope.user.firebaseKeyId, $scope.userInfo);
	};

	$scope.totalTrades = window.localStorage.recentTotalTrades || 0;

	if(window.localStorage.daysTrading)
	{
		$scope.daysTrading = window.localStorage.daysTrading;
	}
	else
	{
		$scope.daysTrading = '1';
	}

	var initialHistoryLoaded = false;

	function loadUser()
	{
		isLoading = true;

		Mongo.getCached(function(user)
		{
			$scope.user = user;

			if($scope.user.avatar)
			{
				window.localStorage.currentAvatar = $scope.user.avatar;
			}

			if(window.localStorage.currentAvatar && !$scope.user.avatar)
			{
				Mongo.update({avatar: window.localStorage.currentAvatar});
				$scope.user.avatar = window.localStorage.currentAvatar;
			}

			$scope.currentAvatar = window.localStorage.currentAvatar;

			if(!$scope.user.oauthMethod && !$scope.loginShowedOnce)
			{
				// when account page is cached - opened atleast once previosuly clicking on account icon might be
				// triggering click-outside event for close login, therefore closing expandLogin. timeout fix works so far
				$timeout(function()
				{
					$scope.expandLogin();
				});
			}

			var registerDate = parseInt($scope.user.tradingSince || window.localStorage.registerDate);
			if(!registerDate)
			{
				var daysTrading = '1';
			}
			else
			{
				var daysTrading = Math.ceil((new Date().getTime() - registerDate) / (1000 * 60 * 60 * 24));
				window.localStorage.daysTrading = daysTrading;
				$scope.daysTrading = daysTrading;
			}

			if(!$scope.user || !user)
			{
				return;
			}

			PortfolioTitle.stop();
			PortfolioTitle.restore($rootScope.t('Profile'));

			var countryCallbackSuccess = false;

			var countryCallback = function(res)
			{
				countryCallbackSuccess = true;
				if (!$scope.user.country || ($scope.user.country != res.data.countrycode) || !window.localStorage.userCountry)
				{
					Mongo.update({country: res.data.countrycode});
					window.localStorage.userCountry = res.data.countrycode;
				}
			};

			$http.get('http://www.geoplugin.net/json.gp').then(countryCallback);

			$timeout(function()
			{
				if (countryCallbackSuccess)
				{
					return;
				}

				$http.get('http://www.geoplugin.net/json.gp').then(function(res)
				{
					res.data.countrycode = res.data.geoplugin_countryCode;
					countryCallback(res);
				});
			}, 2000);

			Mongo.getInfo(function(info)
			{
				$scope.userInfo = info;
				if($scope.userInfo.rank)
				{
					$scope.currentRank = $scope.userInfo.rank.day + 1;
				}
				$scope.self = getSelf();

				if($rootScope.isUserPro)
				{
					$scope.self.isUserPro = true;
				}

				$scope.userDataArray[0] = {_id: $scope.self._id, dps: $scope.self.weeksGrowthArray, color: 'blue', picture: $scope.self.picture || $scope.self.avatar};

				watchGrowthChart();

				isLoading = false;
			});

			if(!$scope.user.wins && !$scope.user.losses)
			{
				$scope.totalTrades = 0;
				$scope.loadingHistory = false;
				initialHistoryLoaded = true;
			}
			else
			{
				$scope.totalTrades = $scope.user.wins + $scope.user.losses;

				if(angular.equals($scope.tradeHistory, {}))
				{
					if($scope.totalTrades <= historyLimit)
					{
						var initialSkip = 0;
					}
					else
					{
						var initialSkip = $scope.totalTrades - historyLimit;
					}

					fetchHistory(initialSkip, historyLimit, true);
				}
			}

			if(window.localStorage.recentTotalTrades != undefined && $scope.totalTrades > window.localStorage.recentTotalTrades && initialHistoryLoaded)
			{
				// console.log('should fetch new trade records');
				fetchNewHistory();
			}
			else
			{
				// console.log('tradecount has not increased/no tradeHistory loaded previously or no trades made yet');
			}

			window.localStorage.recentTotalTrades = $scope.totalTrades;

			$timeout(function()
			{
				$scope.portfolioVal = $scope.portfolioValue();
				$scope.return = $scope.performance();
				window.localStorage.totalReturn = $scope.return;
			});

			$scope.posTrades = 0;
			window.localStorage.positiveTrades = $scope.posTrades;

		}, function() {
			console.log('Error loading user data');

			Mongo.get(function(user)
			{
				if($scope.user)
				{
					return;
				}

				$scope.user = user;
				loadUser();
			}, function(error)
			{
				isLoading = false;
			});
		});

		$timeout.cancel(isLoadingT);
		var isLoadingT = $timeout(function()
		{
			isLoading = false;
		}, 5000);

		function tradeHistoryScrollInit()
		{
			var scrollEl = document.querySelector('#account-content .scroll');
			if(scrollEl)
			{
				scrollEl.addEventListener('scroll', function()
				{
					if (scrollEl.offsetHeight + scrollEl.scrollTop >= (scrollEl.scrollHeight - 30)) {
						// loads in older records
						fetchMoreHistory();
					}
				});
			}
			else
			{
				$timeout(function()
				{
					tradeHistoryScrollInit();
				}, 200);
			}
		}

		$timeout(function()
		{
			tradeHistoryScrollInit();
		}, 500);

	};

	$scope.portfolioVal = window.localStorage.lastPortfolio || window.initialUserCash;
	$scope.return = window.localStorage.totalReturn || 0;
	$scope.posTrades = window.localStorage.positiveTrades || 0;

	// api currently returns from oldest to newest, need to reverse, etc
	var monthNames = ["Jan", "Feb", "March", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var historyLimit = 20;
	var skip;

	$scope.tradeTypes = {"sell": $rootScope.t("Sell"), "buy": $rootScope.t("Buy")};
	$scope.tradeHistory = {};
	$scope.tradeHistoryDayPerf = {};

	$scope.loadingHistory = false;

	function fetchHistory(s, l, reload)
	{
		if ($scope.loadingHistory) {
			return;
		}

		if(reload)
		{
			$scope.tradeHistory = {};
			$scope.tradeHistoryDayPerf = {};
		}

		$scope.loadingHistory = true;

		Mongo.getTradeHistory(s, l).then(function(resp)
    	{
    		var tradeHistoryRaw = resp.data;
    		tradeHistoryRaw.reverse();

    		_.each(tradeHistoryRaw, function(trade)
    		{
				var d = new Date(trade.closeDate);
				var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();

				if(!$scope.tradeHistory[burgerDate] || $scope.tradeHistory[burgerDate].length == 0)
				{
					$scope.tradeHistory[burgerDate] = [];
				}

    			var formattedTrade = formatTrade(trade);

				if (!$scope.tradeHistory[burgerDate].some(i => i._id == formattedTrade._id)) {
					$scope.tradeHistory[burgerDate].push(formattedTrade);
				}
    		});

    		_.each($scope.tradeHistory, function(day)
    		{
    			var sum = 0;
    			_.each(day, function(trade)
    			{
					sum += parseFloat(trade.value);
    			});

    			var d = new Date(day[0].closeDate);
    			var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();
    			var db = monthNames[d.getMonth()] + ' ' + (d.getDate() < 10 ? '0' : '') + d.getDate() + ', ' + d.getFullYear();
    			$scope.tradeHistoryDayPerf[burgerDate] = {db: db, sum: CanvasJS.formatNumber(sum, "0.00")};
    		});

    		$scope.loadingHistory = false;
			initialHistoryLoaded = true;
    	});
	};

	function formatTrade(trade)
	{
		var t = trade;

		t.openPrice = $rootScope.formatRate(t.openPrice);
		t.closePrice = $rootScope.formatRate(t.closePrice);
		t.amount = $rootScope.formatRate(t.amount);
		t.valueAbs = CanvasJS.formatNumber(Math.abs(parseFloat(t.value)), "0.00");

		if(t.valuePct == null || t.valuePct == undefined)
		{
			t.valuePct = 0.00;
		}

		if(t.valuePct != 0 && Math.abs(t.valuePct) < 0.01)
		{
			var valuePctString = t.valuePct.toString();
			var e = valuePctString.match(/(\.0*)/)[0].length - 1;
			t.valuePct = valuePctString.substring(0, (t.valuePct < 0 ? 4 : 3) + e);
		}
		else
		{
			t.valuePct = CanvasJS.formatNumber(parseFloat(t.valuePct), "0.00");
		}

		return t;
	}

	function fetchMoreHistory()
	{
		if($scope.loadingHistory)
		{
			return;
		}

		if(skip < 0)
		{
			$scope.loadingHistory = false;
			return;
		}

		if(skip == undefined)
		{
			skip = $scope.totalTrades - historyLimit;
		}

		skip = skip - historyLimit;
		var limit = historyLimit;

		if(skip < 0)
		{
			limit = historyLimit + skip;
			skip = 0;
		}

		fetchHistory(skip, limit);
	};

	function fetchNewHistory()
	{
		if($scope.totalTrades > historyLimit)
		{
			var skip = $scope.totalTrades - historyLimit;
		}
		else
		{
			var skip = 0;
		}

		Mongo.getTradeHistory(skip, historyLimit).then(function(resp)
		{
			var loadedTradeRecords = resp.data;

			if($scope.tradeHistory && Object.keys($scope.tradeHistory).length > 0)
			{
				var localTradeHistoryDays = Object.keys($scope.tradeHistory);
				var lastLocalTradeHistoryDay = localTradeHistoryDays[0];
				var lastDayTrades = $scope.tradeHistory[lastLocalTradeHistoryDay];
				var lastTrade = lastDayTrades[0];

				// gets index in loaded trade records for the last local trade if there is one
				var index = loadedTradeRecords.findIndex(obj => {
					return obj._id === lastTrade._id;
				});
			}

			// if the are <= historyLimit new trades then there should be an index
			// add the new trades to scope.tradeHistory

			// else
			// more than historyLimit new trades, replace scope.tradeHistory with the new trades
			if(index >= 0)
			{
				var tradesToAdd = loadedTradeRecords.slice(index + 1);
	    		// tradesToAdd.reverse();

	    		_.each(tradesToAdd, function(trade)
	    		{
					var d = new Date(trade.closeDate);
					var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();

					if(!$scope.tradeHistory[burgerDate] || $scope.tradeHistory[burgerDate].length == 0)
					{
						var newDayObj = {[burgerDate]: []}
						var finalObj = Object.assign(newDayObj, $scope.tradeHistory);
						$scope.tradeHistory = finalObj;
					}

	    			var formattedTrade = formatTrade(trade);

					if(!$scope.tradeHistory[burgerDate].some(i => i._id == formattedTrade._id))
					{
						// push the new trade in the front
						$scope.tradeHistory[burgerDate].unshift(formattedTrade);
					}

		    		_.each($scope.tradeHistory, function(day)
		    		{
		    			var sum = 0;
		    			_.each(day, function(trade)
		    			{
							sum += parseFloat(trade.value);
		    			});

		    			var d = new Date(day[0].closeDate);
		    			var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();
		    			var db = monthNames[d.getMonth()] + ' ' + (d.getDate() < 10 ? '0' : '') + d.getDate() + ', ' + d.getFullYear();
		    			$scope.tradeHistoryDayPerf[burgerDate] = {db: db, sum: CanvasJS.formatNumber(sum, "0.00")};
		    		});
	    		});
			}
			else
			{
				var tradesToAdd = loadedTradeRecords;
				skip = $scope.totalTrades - historyLimit;

				var freshTrades = {};
				var freshTradesDayPerf = {};

				_.each(tradesToAdd, function(trade)
	    		{
					var d = new Date(trade.closeDate);
					var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();

					if(!freshTrades[burgerDate] || freshTrades[burgerDate].length == 0)
					{
						freshTrades[burgerDate] = [];
					}

	    			var formattedTrade = formatTrade(trade);

					if (!freshTrades[burgerDate].some(i => i._id == formattedTrade._id)) {
						// push the new trade in the front
						freshTrades[burgerDate].unshift(formattedTrade);
					}
	    		});

	    		_.each(freshTrades, function(day)
	    		{
	    			var sum = 0;
	    			_.each(day, function(trade)
	    			{
						sum += parseFloat(trade.value);
	    			});

	    			var d = new Date(day[0].closeDate);
	    			var burgerDate = (monthNames[d.getMonth()]) + "-" + d.getDate() + "-" + d.getFullYear();
	    			var db = monthNames[d.getMonth()] + ' ' + (d.getDate() < 10 ? '0' : '') + d.getDate() + ', ' + d.getFullYear();
	    			freshTradesDayPerf[burgerDate] = {db: db, sum: CanvasJS.formatNumber(sum, "0.00")};
	    		});

				$scope.tradeHistory = freshTrades;
				$scope.tradeHistoryDayPerf = freshTradesDayPerf;
			}
		});
	}

	$interval.cancel(window.watchLoadIntv);
	window.watchLoadIntv = $interval(function()
	{
		if ($scope.isOnline)
		{
			loadUser();
			if($scope.user)
			{
				$interval.cancel(window.watchLoadIntv);
			}
		}
	}, 500);

	$scope.profitable = function()
	{
		if ($scope.user)
		{
			return Math.round($scope.user.wins / ($scope.user.wins + $scope.user.losses) * 100) || 0;
		}
	};

	$scope.performance = function()
	{
		if ($scope.user && $scope.user.cash && $scope.user.bonusCash)
		{
			var initial = $scope.user.bonusCash;
			var portfolioValue = Mongo.portfolioValue();
			var performance = Math.round((portfolioValue - initial) / initial * 10000) / 100;
			return performance;
		}
		else
		{
			return 0;
		}
	};

	$scope.portfolioValue = function()
	{
		if($scope.user && $scope.user.cash)
		{
			var portfolioValue = Mongo.portfolioValue();
			return portfolioValue;
		}
		else
		{
			return 0;
		}
	}

	$scope.loginGoogle = function() {
		let provider = new firebase.auth.GoogleAuthProvider();
		// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
		firebase.auth().signInWithPopup(provider).
		// firebase.auth().getRedirectResult().
		then(function (authData) {
			console.log(authData);
			//  this.navCtrl.push(TabsPage);
		}).catch(function (error) {
		  console.log(error);
		});
	};

	function userSummary(user, id, batchData)
	{
		var countryNames = _.invert(countries);
		return {id: id, name: user.name || '', isUserPro: user.isUserPro || false, country: user.country || '', growth: batchData.growth, portfolio: batchData.portfolio || 0, fullCountry: countryNames[user.country], rankChange: batchData.rankChange};
	};

	$scope.loginActive = false;
	var appElm = angular.element(document.getElementById('app'));

	$scope.loginShowedOnce = false;

	$scope.expandLogin = function(track) {
		if(track)
		{
			$rootScope.trackEvent("Account", "Login_Open");
		}
		$scope.loginActive = true;
		$scope.loginShowedOnce = true;
		appElm.addClass('state-trans-started');
		if(!window.appElement)
		{
			window.appElement = angular.element(document.getElementById('app'));
		}

		window.setTimeout(function()
		{
			window.appElement.addClass('opacity-transition');
		}, 1);
	};

	$scope.closeLogin = function() {
		$scope.loginActive = false;
		appElm.removeClass('state-trans-started');
		appElm.removeClass('opacity-transition');

		var el = window.document.querySelectorAll('.account-login')[0];
		el.classList.remove('open');
		el.style.removeProperty('transform');
	};

	//before leave
	$scope.$on('$ionicView.beforeLeave', function()
	{
		clearInterval(window.loadUserIntv);
	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url != '/account')
		{
			return;
		}

		loadUser();
	});
})

.controller('PlayCtrl', function($ionicSideMenuDelegate, SymbolData, $scope, LoaderOverlay, $ionicLoading, $ionicSlideBoxDelegate, $timeout, $rootScope, OnlineStatus, LessonOpener, $filter, DateNow, $http, Trading, Mongo, LoaderOverlay, ChartPeriods, UserConfig, Ads, Alert, $sce, PortfolioTitle, $state)
{
	Trading.initController($scope);

	$rootScope.getAlert();

	var timesEntered = 0;

	$scope.$on('$ionicView.beforeEnter', function()
	{
		if (window.chart && window.chart.scope) {
			console.log('Rendering chart');
			window.chart.scope.renderChart();
		}

		if (window.localStorage.getItem('langselected') && window.localStorage.setupAnswersDone && window.localStorage.helpSeen) {
			if (timesEntered > 0) {
				LoaderOverlay.forceShow();

				window.setTimeout(function() {
					LoaderOverlay.hide();
				}, 750);
			}
			timesEntered++;
		}
	});

	if (!window.localStorage.getItem('langselected'))
	{
		document.getElementById('lang-select').style.display = '';
	}
	else if(!window.localStorage.setupAnswersDone && !window.localStorage.helpSeen)
	{
		document.getElementById('app-setup').style.display = 'flex';
	}

	if(!window.localStorage.helpSeen)
	{
		window.setTimeout(function()
		{
			$rootScope.showHelp();
		}, 1000)
	}

	// show loader after language selection and how to
	$scope.$on('closed-how-to', function(event, key)
	{
		// re-inits the chart dimensions so the bottom labels show up after height increase, I think
		if($scope.chartList && $scope.chartList[$scope.currency])
		{
			$scope.chartList[$scope.currency].deactivate();
			$scope.chartList[$scope.currency].activate();
		}

		// LoaderOverlay.forceShow();
	});

	$rootScope.$on('resetting-user-data', function(event, user)
	{
		$scope.user = null;
		window.userResetTimeout = $timeout(function()
		{
			$timeout.cancel(window.userResetTimeout);

			// console.log('setting fresh scope.user?', user.data);
			if(!user || !user.data)
			{
				return;
			}

			$scope.user = user.data;

			$state.reload();

			$timeout(function()
			{
				PortfolioTitle.stop();
				PortfolioTitle.start();
			}, 100);
		}, 1000);
	});

	SymbolData.getSpread = function() { return 0; };

	$rootScope.isHowToSeen = !!window.localStorage.howToSeen;

	$rootScope.$on('force-show-alert', function(event, key)
	{
		forceShowAlertOnUser = function()
		{
			Mongo.getCached(function(user)
			{
				$timeout(function()
				{
					Alert.getSingle(key, function(a)
					{
						$rootScope.alert = a;

						if(window.localStorage.alertsVotedOn && JSON.parse(window.localStorage.alertsVotedOn)[$rootScope.alert.id])
						{
							$rootScope.alert.voted = true;
						}

						// should fix NaN if no one has voted yet
						if($rootScope.alert.voteEnabled)
						{
							if($rootScope.alert.voteData)
							{
								if(!$rootScope.alert.voteData[0])
								{
									$rootScope.alert.voteData[0] = 1
								}

								if(!$rootScope.alert.voteData[1])
								{
									$rootScope.alert.voteData[1] = 1
								}
							}
							else
							{
								$rootScope.alert.voteData = [1, 1];
							}
						}

						if($rootScope.alert.voteData && window.localStorage.alertsVotedOn && JSON.parse(window.localStorage.alertsVotedOn)[$rootScope.alert.id])
						{
							var totalVotes = $rootScope.alert.voteData[0] + $rootScope.alert.voteData[1];
							$rootScope.alert.voteDataPercent[0] = Math.round($rootScope.alert.voteData[0] / totalVotes * 100);
							$rootScope.alert.voteDataPercent[1] = Math.round($rootScope.alert.voteData[1] / totalVotes * 100);
							$rootScope.alert.totalVotes = totalVotes;
						}

						$rootScope.alert.title = angular.element($sce.getTrustedHtml($rootScope.alert.title))[0].innerHTML;
						$rootScope.alert.text = angular.element($sce.getTrustedHtml($rootScope.alert.text))[0].innerHTML;

						var container = document.createElement("p");
						container.innerHTML = $rootScope.alert.text;
						var anchors = container.getElementsByTagName("a");
						if(anchors && anchors.length)
						{
							var tempText = $rootScope.alert.text;
							var list = [];

							for (var i = 0; i < anchors.length; i++) {
								var loc = tempText.indexOf(anchors[i].outerHTML);
								var len = anchors[i].outerHTML.length;

								tempText = tempText.replace(anchors[i].outerHTML, '<span class="blue">' + anchors[i].innerHTML + '</span>');
							}

							var textWithoutLinks = tempText;

							if(tempText.length > (46 + 26))
							{
								var wordEnd = tempText.substring(0, 46 + 26).indexOf(' ');
								tempText = tempText.substring(0, 46 + 26 + wordEnd) + '.. ';

								$rootScope.alert.smallText = tempText;
							}
						}
						else
						{
							if($rootScope.alert.text.length > 46)
							{
								var wordEnd = $rootScope.alert.text.substring(0, 46).indexOf(' ');
								$rootScope.alert.smallText = $rootScope.alert.text.substring(0, 46 + wordEnd) + '.. ';
							}
						}

						$rootScope.trackEvent("Message", "Open");
						$rootScope.alertOpenTime = DateNow();

						$timeout(function()
						{
							$rootScope.$digest();
						});

						window.localStorage.removeItem('forceShowAlert');
					});
				}, 500);
			}, function(err)
			{
				$timeout(function()
				{
					forceShowAlertOnUser();
				}, 500);
			});
		}

		forceShowAlertOnUser();
	});

	$rootScope.chartToolsMenuVisible = false;

	$rootScope.toggleChartTools = function()
	{
		var el = window.document.querySelectorAll('.chart-tools')[0];
        var appElm = angular.element(document.getElementById('app'));
        var chartToolsEl = angular.element(document.querySelector('.chartTools'));

		if($rootScope.chartToolsMenuVisible == false)
		{
			$rootScope.trackEvent('TA', 'Open');
			el.classList.add('open');
            appElm.addClass('state-chart-tools');
            chartToolsEl.addClass('active');
			$rootScope.chartToolsMenuVisible = true;
		}
		else
		{
			el.classList.remove('open');
			el.style.removeProperty('transform');
            appElm.removeClass('state-chart-tools');
            chartToolsEl.removeClass('active');
			$rootScope.chartToolsMenuVisible = false;
		}
	}

	$scope.technicalIndicatorsIndex = 0;

	$scope.technicalIndicators = [
		{id: 'vol', func: 'volume', name: $rootScope.t('Trading Volume'), description: $rootScope.t("Is a measure of <b>how much a given financial asset has traded in a period of time.</b> Traders look to volume to determine liquidity and combine changes in volume with technical indicators to make trading decisions.")},
		{id: 'moving-average', func: 'simpleMovingAverage', name: $rootScope.t('Moving Average'), description: $rootScope.t("Moving Average shows the average price over a longer period of time. It’s wise to compare the current price movements to the moving average to see the strenght of the current trend in relation to a longer trend.")},
		{id: 'compare', func: 'compare', name: $rootScope.t('Compare'), description: ""},
		{id: 'rsi', func: 'rsi', name: $rootScope.t('RSI'), description: $rootScope.t("The relative strength index (RSI) is a momentum indicator used in technical analysis. RSI measures the speed and magnitude of a security's recent price changes to evaluate overvalued or undervalued conditions in the price of that security.")},
		{id: 'soon', enabled: false, disabled: true, name: '', description: 'soon'},
	];

	$scope.arrowPosition = 0;

	$scope.toggleTA = function(i, force)
	{
		window.labelCache['y'] = {};

		window.setTimeout(function() {
			window.labelCache['y'] = {};
		}, 300);

		if(i >= $scope.technicalIndicators.length)
		{
			return;
		}

		if (2 != i) {
			$scope.technicalIndicatorsIndex = i == -1 ? null : i;
		}

		// prevent selecting the compare tool
		$scope.arrowPosition = $scope.technicalIndicators[$scope.technicalIndicatorsIndex].description ? $scope.technicalIndicatorsIndex : 0;

		// chart scope not ready yet or something
		if(!$scope.chartList[$scope.currency])
		{
			return;
		}

		$scope.chartList[$scope.currency].setTechAnalysis($scope.technicalIndicators[i].func, force);
	};

	$rootScope.toggleTA = function(i, force) {
		$scope.toggleTA(i, force);
	};

	$scope.chartDescriptionClosed = false;
	if(window.localStorage.chartDescriptionClosed)
	{
		$scope.chartDescriptionClosed = window.localStorage.chartDescriptionClosed;
	}

	$scope.closeChartDescription = function()
	{
		$scope.chartDescriptionClosed = true;
		window.localStorage.chartDescriptionClosed = true;
	}

	$rootScope.timeFramesVisible = false;

	$rootScope.toggleTimeFrames = function(close)
	{
		var chartScope = $scope.chartList[$scope.currency];
		var el = window.document.querySelectorAll('.time-frames')[0];
		var appElm = angular.element(document.getElementById('app'));
		if($rootScope.timeFramesVisible == false && !close)
		{
			$rootScope.trackEvent("Timeframes", !$rootScope.timeFramesVisible ? "Opened" : "Closed");

			if($rootScope.chartToolsMenuVisible)
			{
				$rootScope.toggleChartTools();
			}

			el.classList.add('open');
            appElm.addClass('state-timeFrames');
			$rootScope.timeFramesVisible = true;
			$scope.currentPeriod = chartScope.getPeriod();
			$scope.chartType = chartScope.type;
		}
		else if($rootScope.timeFramesVisible == true)
		{
			$rootScope.trackEvent("Timeframes", !$rootScope.timeFramesVisible ? "Opened" : "Closed");

			el.classList.remove('open');
			el.style.removeProperty('transform');
            appElm.removeClass('state-timeFrames');
			$rootScope.timeFramesVisible = false;

			if (chartScope) {
				chartScope.hidePeriodSelection();
			}

			var noStyleChosen = $scope.chosenStyle.every(v => v === false);
			if(noStyleChosen)
			{
				$scope.setTimeFramesCategory(0);
			}
		}
	};

	$rootScope.getTimeFramesState = function()
	{
		return $rootScope.timeFramesVisible;
	}

	$scope.initLastTimeFrame = function()
	{
		var init = function()
		{
			if ($scope.chartList && $scope.chartList[$scope.currency])
			{

				var cs = $scope.chartList[$scope.currency];
				$scope.timeFramesCategory = ~~window.localStorage.lastTimeFramesCategory || 0;
				if($scope.timeFramesCategory)
				{
					$scope.setStyle(parseInt(window.localStorage.lastTradingStyle) || 0);
					cs.multipleTimeframes = true;
				} else {
					cs.multipleTimeframes = false;

					if(!$scope.currentPeriod)
					{
						$scope.currentPeriod = ~~window.localStorage.defaultLineChartPeriod || 0;
						$scope.setPeriod($scope.currentPeriod);
					}
				}

				cs.updateVisiblePeriods();

				return true;
			}
		};

		if (!init()) {
			window.clearInterval(window.initLastTimeFrame);
			window.initLastTimeFrame = window.setInterval(function() {
				if (init()) {
					window.clearInterval(window.initLastTimeFrame);
				}
			}, 100);
		}
	}

	$scope.periods = ChartPeriods.get('line');

	$scope.setTimeFramesCategory = function(i, track)
	{
		$scope.timeFramesCategory = i;
		// window.localStorage.lastTimeFramesCategory = i;

		if(i)
		{
			// $scope.toggleStyle(0);
			$rootScope.trackEvent("Timeframes", "TraderStyles");
		}
		else
		{
			if(track)
			{
				$rootScope.trackEvent("Timeframes", "Default");
			}

			if($scope.chartList && $scope.chartList[$scope.currency])
			{
				$scope.currentPeriod = $scope.chartList[$scope.currency].getPeriod();
				ChartPeriods.setVisiblePeriods([$scope.currentPeriod]);
				$scope.chartList[$scope.currency].updateVisiblePeriods();
			}

			window.localStorage.lastTimeFramesCategory = i;
			$scope.chosenStyle = [false, false, false, false];
		}
	}

    $scope.tradingStyles = [
    	{ name: $rootScope.t('Day Trader Preset'), description: $rootScope.t('Open and close trades within a day'), type: 'candlestick', periods: [2, 4, 5] },
    	{ name: $rootScope.t('Scalper Preset'), description: $rootScope.t('Trade fast and often by opening and closing  trades within minutes'), type: 'candlestick', periods: [0, 1, 2] },
    	{ name: $rootScope.t('Swing Trader Preset'), description: $rootScope.t('Look for trades that span a couple of days and weeks.'), type: 'line', periods: [4, 5, 6] },
    	{ name: $rootScope.t('Investor Preset'), description: $rootScope.t('You’re playing the long game. Look for opportunities to buy at a discount.'), type: 'line', periods: [5, 6, 7] }
    ];

    $scope.chosenStyle = [false, false, false, false];

    $scope.toggleStyle = function(i, e)
    {
		// trackevent only when enabling the style
		if(!$scope.chosenStyle[i])
		{
			var tradingStylesRaw = ['Day Trader', 'Scalper', 'Swing Trader', 'Investor'];
			$rootScope.trackEvent("Timeframes", "TraderStyles_" + tradingStylesRaw[i]);
		}

		if($scope.chosenStyle[i])
		{
			var defPeriod = ~~window.localStorage.defaultLineChartPeriod;
			$scope.chosenStyle[i] = !$scope.chosenStyle[i];

			$scope.currentPeriod = defPeriod;

			$scope.chartList[$scope.currency].setPeriod($scope.currentPeriod);
			ChartPeriods.setVisiblePeriods([$scope.currentPeriod]);
			$scope.chartList[$scope.currency].updateVisiblePeriods();
		}
		else
		{
			$scope.chosenStyle = [false, false, false, false];
	    	$scope.chosenStyle[i] = true;

			// only save lastTimeFramesCategory for initLastTimeFrame if style has been enabled;
			window.localStorage.lastTimeFramesCategory = $scope.timeFramesCategory;

			$scope.currentPeriod = $scope.tradingStyles[i].periods[0];
			window.localStorage.defaultStylesChartPeriod = $scope.currentPeriod;

	    	ChartPeriods.setVisiblePeriods($scope.tradingStyles[i].periods);
	    	$scope.chartList[$scope.currency].updateVisiblePeriods();
	    	$scope.chartList[$scope.currency].setPeriod($scope.currentPeriod, true);

	    	window.localStorage.lastTradingStyle = i;
			$scope.setType($scope.tradingStyles[i].type);
		}
    }

    $scope.setStyle = function(i, val)
    {
		if($scope.timeFramesCategory)
		{
			var defPeriod = $scope.tradingStyles[i].periods[~~window.localStorage.defaultStylesChartPeriod];
		}
		else
		{
			var defPeriod = ~~window.localStorage.defaultLineChartPeriod;
		}

		$scope.chartList[$scope.currency].setPeriod($scope.currentPeriod);
		ChartPeriods.setVisiblePeriods($scope.tradingStyles[i].periods);
		$scope.chartList[$scope.currency].updateVisiblePeriods();

		$scope.chosenStyle = [false, false, false, false];
		$scope.chosenStyle[i] = true;

		$scope.currentPeriod = $scope.tradingStyles[i].periods.indexOf(defPeriod) > -1 ? defPeriod : $scope.tradingStyles[i].periods[0];

		ChartPeriods.setVisiblePeriods($scope.tradingStyles[i].periods);
		$scope.chartList[$scope.currency].updateVisiblePeriods();

		if($scope.timeFramesCategory)
		{
			$scope.chartList[$scope.currency].setPeriod(~~window.localStorage.defaultStylesChartPeriod, true);
		}
		else
		{
			$scope.chartList[$scope.currency].setPeriod($scope.currentPeriod);
		}
    }

    $scope.setType = function(type) {
		var cs = $scope.chartList[$scope.currency];
		if ('line' == type) {
			cs.setTypeLine();
		} else {
			cs.setTypeCandleStick();
		}
	};

    $scope.setPeriod = function(i, closeTimeFrames)
    {
    	if(closeTimeFrames)
    	{
    		$rootScope.toggleTimeFrames();
    	}

    	if(!$scope.timeFramesCategory)
    	{
    		ChartPeriods.setVisiblePeriods([i]);
	    	$scope.chartList[$scope.currency].updateVisiblePeriods();
    	}

		if(closeTimeFrames && ChartPeriods.getVisiblePeriods() && ChartPeriods.getVisiblePeriods()[0] && ChartPeriods.getVisiblePeriods()[0].label)
		{
			$rootScope.trackEvent("Timeframes", "Selected_" + ChartPeriods.getVisiblePeriods()[0].label);
		}

    	$scope.chartList[$scope.currency].setPeriod(i, true);
    	$scope.currentPeriod = i;
    }

	$scope.assetSearch = '';

	$scope.updateSortedAssets = function(category) {
		var assets = category.instruments;

		// when remembering last used sort method
		if(!$scope.sym(category.instruments[0]))
		{
			return;
		}

		if ((category.popular) || ($scope.assetSearch)) {
			assets = $scope.categories.reduce(function(allAssets, cat) {

				if (!cat.popular) {
					allAssets = allAssets.concat(cat.instruments);
				}

				return allAssets;
			}, [])
		}

		if ($scope.assetSearch) {
			var c = $scope.assetSearch.toLowerCase();

			assets = assets.filter(function(a) {
				if ((a.toLowerCase().indexOf(c) > -1) || (($scope.symbolNames[a] || '').toLowerCase().indexOf(c) > -1)) {
					return true;
				}
			});
		}

		var sorted = assets.sort(function(a, b) {

			if (!category.popular) {
				var nameA = $scope.symbolNames[a] || a;
				var nameB = $scope.symbolNames[b] || b;

				return nameA > nameB ? 1 : -1;
			} else {
				var symA = $scope.sym(a);
				var symB = $scope.sym(b);

				a = Math.abs(parseFloat(symA.pch));
				b = Math.abs(parseFloat(symB.pch));

				return a < b ? 1 : -1;
			}
		});

		if (category.popular && !$scope.assetSearch) {
			sorted = sorted.filter($scope.isMarketOpen);

			// todo: merge winners and losers and shuffle
			sorted = sorted.slice(0, 10);
		}

		category.sorted = sorted;
	};

	$scope.updateAllSortedAssets = function() {
		for (var k = 0; k < $scope.categories.length; k++) {
			$scope.updateSortedAssets($scope.categories[k]);
		}

		$rootScope.$broadcast('$$rebind::sortedAssets');
	};

	$scope.updateAssetResults = function(assetSearch) {
		$scope.assetSearch = assetSearch;

		window.clearTimeout(window.assetSearchDebounce);
		window.assetSearchDebounce = window.setTimeout(function() {
			if (assetSearch) {
				$scope.trackEvent("Asset", "Search_" + assetSearch);
			}
		}, 1000);

		$scope.updateAllSortedAssets();
	};

	$scope.closeKeyboard = function(event)
	{
		if(Keyboard && Keyboard.hide)
		{
			if(window.device && window.device.platform == "iOS")
			{
				if(event && event.keyCode == '13')
				{
					document.querySelectorAll('#asset-select input')[0].blur();
					// Keyboard.hide();
				}
				else
				{
					return;
				}
			}
			else
			{
				Keyboard.hide();
			}
		}
	};

	$scope.clearAssetSearch = function()
	{
		var inputEl = document.querySelector('.asset-search input');
		if(inputEl)
		{
			inputEl.value = '';
			inputEl.dispatchEvent(new Event('input', {bubbles:true}));
			$scope.updateAssetResults($scope.assetSearch);
		}
	}

	var loadingUser = false;
	var loadingUserBackup = false;

	// todo - clean up and move to trading-common
	$scope.loadUser = function(forceLoad)
	{
		// todo - clean up
		function prepUserData()
		{
			if(!$scope.user)
			{
				return;
			}

			// PortfolioTitle.start() is called in Trading.initController but from testing it seems that it's sometimes stopped after some time or just not started for some reason?
			// and of course when portfolioLive is false in PortfolioTitle service, the loading icon is shown by the portfolioValue
			PortfolioTitle.stop();
			PortfolioTitle.start();

			if($scope.user.wins)
			{
				window.localStorage.lastUserWins = $scope.user.wins;
			}

			if($scope.user && $scope.currency && $scope.user.positions && Mongo.getPosition($scope.currency))
			{
				if($scope.currency)
				{
					if($scope.user.positions)
					{
						if(Mongo.getPosition($scope.currency))
						{
							$scope.tempStopLoss.loss = Mongo.getPosition($scope.currency).lossLimit;
							$scope.tempStopLoss.profit = Mongo.getPosition($scope.currency).profitLimit;
							// $scope.updateStopLoss();
							$scope.updateFormattedStoploss();
						}
					}
				}
			}

			if($scope.user.activePairs && $scope.user.activePairs.length > 0)
			{
				var pairs = $scope.user.activePairs;
			}
			else if(window.localStorage.activePairs)
			{
				var pairs = JSON.parse(window.localStorage.activePairs);
			}
			else
			{
				var pairs = window.appConfig.defaultPairs || ['EURUSD', 'BTCUSD', 'USDJPY', 'OILUSD', 'GBPUSD', 'XAUUSD', 'USDCAD', 'ETHUSD', 'USDZAR', 'GOOUSD', 'AAPUSD', 'TSLUSD', 'XOMUSD', 'NKEUSD', 'DISUSD', 'HISTORY'];
			}

			function differentItems(array1, array2)
			{
				return array1.filter(function(i) {return array2.indexOf(i) < 0;});
			}

			if($scope.user.positions && Object.keys($scope.user.positions).length > 0)
			{
				var positionsOpen = Object.keys($scope.user.positions);
				var differentPairs = differentItems(positionsOpen, pairs);

				for(var i in differentPairs)
				{
					$scope.closePosition(differentPairs[i]);
				}
			}

			// china crypto ban
			if($scope.user.country == 'CN')
			{
				var filteredPairs = [];

				for(var i in pairs)
				{
					if($scope.categories[5].instruments.indexOf(pairs[i]) == -1)
					{
						filteredPairs.push(pairs[i]);
					}
				}

				pairs = filteredPairs;
			}

			if($scope.user.friendsInvited)
			{
				window.localStorage.friendsInvited = $scope.user.friendsInvited;
			}

			if($scope.user.battleDisabled || window.isGoforex)
			{
				$scope.battleDisabled = $scope.user.battleDisabled;
				if(pairs.indexOf('BATTLE') > -1)
				{
					pairs.splice(pairs.indexOf('BATTLE'), 1);
				}
			}
			else
			{
				if(pairs.indexOf('BATTLE') == -1)
				{
					pairs.push('BATTLE');
				}

				$scope.battleDisabled = false;
				if(typeof $scope.user.battleDisabled == "undefined")
				{
					Mongo.setBattleDisabled(false);
				}
			}

			$scope.$on('symbol-rates-updated', function(event, sym)
			{
				var rate = SymbolData.getSymbolRate(sym);
				if (_.isNumber(rate))
				{
					rate = $rootScope.formatRate(rate);
				}

				$timeout(function()
				{
					$scope.menuInstrumentRate[sym] = rate;

					if($scope.user && $scope.user.positions && $scope.user.positions[sym])
					{
						$scope.updatePositionValue(sym, rate);
					}
				});
			});

			$timeout(function()
			{
				var checkedPairs = checkForDisabledAssets(pairs);
				$scope.activePairs = checkedPairs;

				SymbolData.initSymbolRates($scope.activePairs);

				$scope.pairs = $scope.activePairs;
				window.localStorage.activePairs = JSON.stringify($scope.pairs);

				if($scope.pairs.indexOf($scope.currency) == -1)
				{
					$scope.setCurrency($scope.pairs[0]);
				}

				$rootScope.$broadcast('$$rebind::curr', 'load user');
				if(window.updateMenu)
				{
					window.updateMenu(true);
				}

				if(!$scope.user.activePairs || $scope.user.activePairs != $scope.activePairs)
				{
					Mongo.update({activePairs: $scope.activePairs});
				}
			});
		}

		if ($scope.user && $scope.user.$value)
		{
			return;
		}

		var loadPlatformData = function()
		{
			var platformDataVersionRef = firebase.database().ref('platformData-v2').child('platformDataVersion');
			platformDataVersionRef.once('value', function(snap)
			{
				var platformDataVersion = snap.val();
				try
				{
					if(	!window.localStorage.platformDataVersionV2 ||
						!window.localStorage.cachedPlatformDataV2 ||
						(window.localStorage.platformDataVersionV2 && parseInt(window.localStorage.platformDataVersionV2) < parseInt(platformDataVersion)))
					{
						var platformDataRef = firebase.database().ref('platformData-v2');
						platformDataRef.once('value', function(snap)
						{
							allPlatformData = snap.val();

							if(allPlatformData.disclaimerTraders)
							{
								window.localStorage.cachedDisclaimerTraders = allPlatformData.disclaimerTraders;
							}
							else
							{
								window.localStorage.removeItem('cachedDisclaimerTraders');
							}

							if(allPlatformData.disclaimerBrokers)
							{
								window.localStorage.cachedDisclaimerBrokers = allPlatformData.disclaimerBrokers;
							}
							else
							{
								window.localStorage.removeItem('cachedDisclaimerBrokers');
							}

							window.localStorage.cachedPlatformDataV2 = JSON.stringify(allPlatformData);
							window.localStorage.platformDataVersionV2 = allPlatformData.platformDataVersion;
						});
					}
				} catch(e)
				{
					console.log(e);
					window.localStorage.removeItem('platformDataVersion');
					window.localStorage.removeItem('cachedPlatformData');
				}
			});
		};

		if (OnlineStatus.is() && (!loadingUser || forceLoad))
		{
			// if($ionicLoading._getLoader().$$state.status)
			// {
			// 	//$ionicLoading.show({'template': $scope.t('<img src="img/ani_loading2.gif" /><span class="loading-text">Loading...</span>')});
			// }
			loadingUser = true;
			Mongo.getCached(function(user)
			{
				$scope.user = user;

				prepUserData();

				// $timeout(function()
				// {
				// 	$ionicLoading.hide();
				// 	LoaderOverlay.restore();
				// }, 100);

			}, function()
			{
				if(loadingUserBackup || $scope.user)
				{
					return;
				}

				loadingUserBackup = true;

				window.loadUserBackupT = $timeout(function()
				{
					if(loadingUserBackup || $scope.user)
					{
						$timeout.cancel(window.loadUserBackupT);
					}

					Mongo.get(function(user)
					{
						$scope.user = user;

						if($scope.user && $scope.user.isUserPro)
						{
							$rootScope.isUserPro = true;
							window.localStorage.isUserPro = true;
						}

						// todo - this probably doesn't do anything atm
						$scope.loadUser();

						prepUserData();

						// set user country on trade tab, kinda required for brokers.
						// Could remove setting user country in Account tab
						if($scope.user)
						{
							var countryCallbackSuccess = false;

							var countryCallback = function(res)
							{
								countryCallbackSuccess = true;
								if (($scope.user && !$scope.user.country) || ($scope.user && $scope.user.country && $scope.user.country != res.data.countrycode) || !window.localStorage.userCountry)
								{
									Mongo.update({country: res.data.countrycode});
									window.localStorage.userCountry = res.data.countrycode;
								}

								// preload brokers in cache
								loadPlatformData();
							};

							$http.get('http://www.geoplugin.net/json.gp').then(countryCallback);

							$timeout(function()
							{
								if (countryCallbackSuccess)
								{
									return;
								}

								$http.get('http://www.geoplugin.net/json.gp').then(function(res)
								{
									res.data.countrycode = res.data.geoplugin_countryCode;
									countryCallback(res);
								});
							}, 2000);

							// preload self data
							var countries = {"United States":"US","Canada":"CA","United Kingdom":"GB","Argentina":"AR","Australia":"AU","Austria":"AT","Belgium":"BE","Brazil":"BR","Chile":"CL","China":"CN","Colombia":"CO","Croatia":"HR","Denmark":"DK","Dominican Republic":"DO","Egypt":"EG","Finland":"FI","France":"FR","Germany":"DE","Greece":"GR","Hong Kong":"HK","India":"IN","Indonesia":"ID","Ireland":"IE","Israel":"IL","Italy":"IT","Japan":"JP","Jordan":"JO","Kuwait":"KW","Lebanon":"LB","Malaysia":"MY","Mexico":"MX","Netherlands":"NL","New Zealand":"NZ","Nigeria":"NG","Norway":"NO","Pakistan":"PK","Panama":"PA","Peru":"PE","Philippines":"PH","Poland":"PL","Russia":"RU","Saudi Arabia":"SA","Serbia":"RS","Singapore":"SG","South Africa":"ZA","South Korea":"KR","Spain":"ES","Sweden":"SE","Switzerland":"CH","Taiwan":"TW","Thailand":"TH","Turkey":"TR","United Arab Emirates":"AE","Venezuela":"VE","Portugal":"PT","Luxembourg":"LU","Bulgaria":"BG","Czech Republic":"CZ","Slovenia":"SI","Iceland":"IS","Slovakia":"SK","Lithuania":"LT","Trinidad and Tobago":"TT","Bangladesh":"BD","Sri Lanka":"LK","Kenya":"KE","Hungary":"HU","Morocco":"MA","Cyprus":"CY","Jamaica":"JM","Ecuador":"EC","Romania":"RO","Bolivia":"BO","Guatemala":"GT","Costa Rica":"CR","Qatar":"QA","El Salvador":"SV","Honduras":"HN","Nicaragua":"NI","Paraguay":"PY","Uruguay":"UY","Puerto Rico":"PR","Bosnia and Herzegovina":"BA","Palestine":"PS","Tunisia":"TN","Bahrain":"BH","Vietnam":"VN","Ghana":"GH","Mauritius":"MU","Ukraine":"UA","Malta":"MT","The Bahamas":"BS","Maldives":"MV","Oman":"OM","Macedonia":"MK","Latvia":"LV","Estonia":"EE","Iraq":"IQ","Algeria":"DZ","Albania":"AL","Nepal":"NP","Macau":"MO","Montenegro":"ME","Senegal":"SN","Georgia":"GE","Brunei":"BN","Uganda":"UG","Guadeloupe":"GP","Barbados":"BB","Azerbaijan":"AZ","Tanzania":"TZ","Libya":"LY","Martinique":"MQ","Cameroon":"CM","Botswana":"BW","Ethiopia":"ET","Kazakhstan":"KZ","Namibia":"NA","Madagascar":"MG","New Caledonia":"NC","Moldova":"MD","Fiji":"FJ","Belarus":"BY","Jersey":"JE","Guam":"GU","Yemen":"YE","Zambia":"ZM","Isle Of Man":"IM","Haiti":"HT","Cambodia":"KH","Aruba":"AW","French Polynesia":"PF","Afghanistan":"AF","Bermuda":"BM","Guyana":"GY","Armenia":"AM","Malawi":"MW","Antigua":"AG","Rwanda":"RW","Guernsey":"GG","The Gambia":"GM","Faroe Islands":"FO","St. Lucia":"LC","Cayman Islands":"KY","Benin":"BJ","Andorra":"AD","Grenada":"GD","US Virgin Islands":"VI","Belize":"BZ","Saint Vincent and the Grenadines":"VC","Mongolia":"MN","Mozambique":"MZ","Mali":"ML","Angola":"AO","French Guiana":"GF","Uzbekistan":"UZ","Djibouti":"DJ","Burkina Faso":"BF","Monaco":"MC","Togo":"TG","Greenland":"GL","Gabon":"GA","Gibraltar":"GI","Democratic Republic of the Congo":"CD","Kyrgyzstan":"KG","Papua New Guinea":"PG","Bhutan":"BT","Saint Kitts and Nevis":"KN","Swaziland":"SZ","Lesotho":"LS","Laos":"LA","Liechtenstein":"LI","Northern Mariana Islands":"MP","Suriname":"SR","Seychelles":"SC","British Virgin Islands":"VG","Turks and Caicos Islands":"TC","Dominica":"DM","Mauritania":"MR","Aland Islands":"AX","San Marino":"SM","Sierra Leone":"SL","Niger":"NE","Republic of the Congo":"CG","Anguilla":"AI","Mayotte":"YT","Cape Verde":"CV","Guinea":"GN","Turkmenistan":"TM","Burundi":"BI","Tajikistan":"TJ","Vanuatu":"VU","Solomon Islands":"SB","Eritrea":"ER","Samoa":"WS","American Samoa":"AS","Falkland Islands":"FK","Equatorial Guinea":"GQ","Tonga":"TO","Comoros":"KM","Palau":"PW","Federated States of Micronesia":"FM","Central African Republic":"CF","Somalia":"SO","Marshall Islands":"MH","Vatican City":"VA","Chad":"TD","Kiribati":"KI","Sao Tome and Principe":"ST","Tuvalu":"TV","Nauru":"NR","Réunion":"RE"};

							function userSummary(user, id, batchData)
							{
								var countryNames = _.invert(countries);
								return {id: id, name: user.name || '', fiId: user.fiId || '', isUserPro: user.isUserPro || false, country: user.country || '', fb: user.oauthID || '', growth: batchData.growth, portfolio: batchData.portfolio || 0, fullCountry: countryNames[user.country], rankChange: batchData.rankChange, picture: user.picture || '', weeksGrowthArray: batchData.weeksGrowthArray || []};
							};

							Mongo.getInfo(function(info)
							{
								var userInfo = info;
								var self = userSummary($scope.user, $scope.user.firebaseKeyId, userInfo);

								if(!self.growth)
								{
									self.growth = {day: 0.00, week: 0.00};
								}

								window.localStorage.self = JSON.stringify(self);
							});
						}
					});

					loadingUserBackup = false;
				}, 500);
			});
		}

		if (!OnlineStatus.is())
		{
			loadingUser = false;
			loadingUserBackup = false;
		}
	};

	$scope.loadUser();
	$scope.posAmount = 3;
	$scope.posLeverage = 3;

	function checkForDisabledAssets(pairs)
	{
		var disabledAssets = [];
		if(window.localStorage.disabledAssets)
		{
			try {
				disabledAssets = JSON.parse(window.localStorage.disabledAssets).split(',');
			} catch(e) {
				disabledAssets = [];
			}
		}

		if(disabledAssets.length > 0)
		{
			// remove it from $scope.categories
			for(var i in $scope.categories)
			{
				for(var j in $scope.categories[i].instruments)
				{
					if(disabledAssets.indexOf($scope.categories[i].instruments[j]) > -1)
					{
						$scope.categories[i].instruments.splice(j, 1);
					}
				}
			}

			// remove & replace it in activePairs
			if(window.localStorage.activePairs)
			{
				activePairs = JSON.parse(window.localStorage.activePairs);
			}
			else
			{
				activePairs = window.appConfig.defaultPairs;
			}

			var newActivePairs = [];
			for(var i in activePairs)
			{
				if(disabledAssets.indexOf(activePairs[i]) == -1)
				{
					newActivePairs.push(activePairs[i]);
				}
				else
				{
					// add a random asset to replace the disabled one make it doesn't already exist in activePairs
					var randomAsset = $scope.categories[0].instruments[Math.floor(Math.random() * $scope.categories[0].instruments.length)];
					while(newActivePairs.indexOf(randomAsset) > -1)
					{
						randomAsset = $scope.categories[0].instruments[Math.floor(Math.random() * $scope.categories[0].instruments.length)];
					}
					newActivePairs.push(randomAsset);
				}
			}

			window.localStorage.activePairs = JSON.stringify(newActivePairs);

			return newActivePairs;
		}
		else
		{
			return pairs;
		}
	}

	// reset pairs to window.localStorage.activePairs
	$scope.resetPairs = function()
	{
		if(!window.localStorage.activePairs)
		{
			return;
		}

		$timeout(function()
		{
			checkForDisabledAssets();

			$scope.activePairs = JSON.parse(window.localStorage.activePairs);
			SymbolData.unsubscribeAll();
			SymbolData.initSymbolRates($scope.activePairs);
			$scope.pairs = $scope.activePairs;

			if($scope.pairs.indexOf($scope.currency) == -1)
			{
				$scope.setCurrency($scope.pairs[0]);
			}

			$rootScope.$broadcast('$$rebind::curr', 'reset pairs');
			if(window.updateMenu)
			{
				window.updateMenu(true);
			}

			if($scope.user && !$scope.user.activePairs)
			{
				Mongo.update({activePairs: $scope.activePairs});
			}
		});
	};

	$scope.$on('reset-pairs', function(event, args)
	{
		$scope.resetPairs();
	});

	Trading.historyLoaded(function(val)
	{
		$scope.history = val;
		if(document.getElementsByClassName('bar-instruments') && document.getElementsByClassName('bar-instruments')[0])
		{
			$scope.historyScrollHeight = _.filter(document.getElementsByTagName('ion-content'), function(node) { return node.clientHeight > 0; })[0].clientHeight - document.getElementsByClassName('bar-instruments')[0].clientHeight;
		}
	});

	// Setting Asset Selector State
	$scope.assetSelectorState = false;
	$scope.$on('asset-selector-toggled', function(event, args)
	{
		// clear search input after closing asset selector
		if($scope.assetSelectorState)
		{
			var inputEl = document.querySelectorAll('.asset-search input');
			if(inputEl && (inputEl[0].value != ''))
			{
				inputEl[0].value = '';

				// need to trigger input event for ng-model to change
				inputEl[0].dispatchEvent(new Event('input', {bubbles:true}));
			}
		}

		$scope.updateAllSortedAssets();

		$scope.assetSelectorState = !$scope.assetSelectorState;

		if($scope.currency == 'HISTORY')
		{
			var handle = $ionicSlideBoxDelegate.$getByHandle('tradeSlider');
			var current = handle.currentIndex();
			var newSlide = $scope.assetSelectorState ? 0 : 1;
			if (current != newSlide)
			{
				handle.slide(newSlide);
			}
		}

		if($scope.assetSelectorState == false)
		{
			if($scope.activePairs.indexOf($scope.currency) == -1)
			{
				var j = 0;
				while($scope.activePairs[j] == 'BATTLE' || $scope.activePairs[j] == 'HISTORY')
				{
					j++
				}
				$scope.setCurrency($scope.activePairs[j]);
			}
		}

		menuInstruments = {};

		$scope.swiper.update();

		if($scope.assetSelectorState == false)
		{
			updateMenu(true);
		}
	});

	// initiating this on PlayCtrl, because this happens only at the first time since opening the app
	$ionicSideMenuDelegate.canDragContent(false);
	var savedUpdateMenuInterval = window.updateMenuInterval;

	// this one doesn't get triggered on ctrl init but works after
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url == '/play')
		{
			$ionicSideMenuDelegate.canDragContent(false);

			if($rootScope.shouldTriggerResetInPlay)
			{
				$timeout(function()
				{
					console.log('triggering resumeListener');
					window.resumeListener();
					$rootScope.shouldTriggerResetInPlay = false;
				}, 500);
			}

			// Checking if updateMenu is running, if not, runs it
			if(window.updateMenuInterval <= savedUpdateMenuInterval)
			{
				updateMenu(true);
			}
			savedUpdateMenuInterval = window.updateMenuInterval;

			if($scope.user && $scope.user.bonus)
			{
				$scope.bonus = $scope.user.bonus;
				$scope.tradeState = '';
				if($scope.bonus && $scope.bonus.active && $scope.bonus.active[$scope.currency] && window.localStorage.settings && JSON.parse(window.localStorage.settings).tradingQuizes && $scope.user && $scope.user.positions && $scope.currency && !Mongo.getPosition($scope.currency))
				{
					$scope.tradeState = 'BONUS';
				}
				window.updateMenu(true);
			}

			// enabling disabling bonus questions on trade opening, needs to be done if setting is changed after trade ctrl has been opened once
			if(window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).tradingQuizes)
			{
				Trading.enableBonusQuestions();
				$scope.noBonusQuestions = false;
			}
			else if(window.localStorage["settings"] && JSON.parse(window.localStorage["settings"]).tradingQuizes == false)
			{
				Trading.disableBonusQuestions();
				$scope.noBonusQuestions = true;
				delete $scope.bonus;
			}
		}
		else
		{
			$ionicSideMenuDelegate.canDragContent(true);
			$rootScope.hideAssetSelector();
			$scope.assetSelectorState = false;
			clearInterval(window.afterUserLoaded);

			// bez šī,kad atnāk atpakaļ uz trade sadaļu no citurienes, var rādīties krustiņi uz kādu brīdi, utt.
			$rootScope.$broadcast('$$rebind::curr', 'state change');
		}
	});

	$scope.maxAmountUnblocked = (window.localStorage.maxAmountUnblocked == 'true' ? true : false);
	$scope.maxLeverageUnblocked = (window.localStorage.maxLeverageUnblocked == 'true' ? true : false);

	$scope.setAmount = function(amount)
	{
		var setAmount = function()
		{
			$scope.trackEvent("Trade", "Amount " + $scope.currency, amount);
			$scope.posAmount = amount;
			if(typeof TapticEngine != "undefined")
			{
				TapticEngine.selection();
			}

			if (!window.pctCashElement || !window.pctCashElement.isConnected) {
				window.pctCashElement = document.getElementById('pct-of-cash');
			}

			window.pctCashElement.className = 'show';

			window.clearTimeout(window.pctCashHide);

			window.pctCashHide = window.setTimeout(function() {
				window.pctCashElement.className = '';
			}, 2000);
		}

		if (amount == 0 && !$scope.maxAmountUnblocked && !$rootScope.isUserPro) {
			$rootScope.trackEvent('Ads', 'Show_MaxPosAmount');
			Ads.show('regular', function() {
				$scope.maxAmountUnblocked = true;
				window.localStorage.maxAmountUnblocked = $scope.maxAmountUnblocked;
				setAmount();
			})
		} else {
			setAmount();
		}
	};

	$scope.setLeverage = function(leverage)
	{
		var setLevarage = function()
		{
			$scope.trackEvent("Trade", "Leverage " + $scope.currency, $scope.leverages[leverage]);
			$scope.posLeverage = leverage;
		}

		if(typeof TapticEngine != "undefined")
		{
			TapticEngine.selection();
		}

		if ($scope.leverages[leverage] == $scope.getLeverages()[0] && !$scope.maxLeverageUnblocked && !$rootScope.isUserPro) {
			$rootScope.trackEvent('Ads', 'Show_MaxPosLeverage');
			Ads.show('regular', function() {
				$scope.maxLeverageUnblocked = true;
				window.localStorage.maxLeverageUnblocked = $scope.maxLeverageUnblocked;
				setLevarage();
			})
		} else {
			setLevarage();
		}
	};

	$scope.getLeverages = function(symbol)
	{
		var defaultLeverages = [50, 30, 10, 5, 1];
		var leverages = defaultLeverages;

		if(window.appConfig)
		{
			if(window.appConfig.userLeverages)
			{
				leverages = window.appConfig.userLeverages;
			}

			if(window.appConfig.proUserLeverages && (window.localStorage.isUserPro == 'true' || $rootScope.isUserPro))
			{
				leverages = window.appConfig.proUserLeverages;
			}
		}

		return leverages;
	};

	$scope.updateFormattedStoploss = function()
	{
		$scope.formattedStopLossProfit = Math.ceil(Math.max(1, Math.abs($scope.stopLoss($scope.currency, $scope.tempStopLoss.profit))));
		$scope.formattedStopLossLoss = Math.ceil(Math.max(1, Math.abs($scope.stopLoss($scope.currency, $scope.tempStopLoss.loss))));
		if(typeof TapticEngine != "undefined")
		{
			TapticEngine.selection();
		}
	};

	$scope.selectAssetCategory = function(idx) {
		$scope.activeAssetSelectorCategory = idx;
		$scope.currSelSwiper.slideTo(idx);
	};

	// if position closed result is triggered when internet connection has been lost it can trigger again when connected
	// making a temp array that will list closed position result screens seen
	var closedPositionResultsSeen = [];

	$scope.closePositionCallback = function(currency)
	{
		if(!$scope.positionAlert)
		{
			// $scope.positionAlert = Mongo.getPosition(currency);
			console.log('no position alert data');
			return;
		}

		if (Trading.hasState('transStarted'))
		{
			Trading.setState('transStarted', false);
		}

		if ($scope.positionAlert.pair)
		{
			if(!$scope.positionAlert.totalAmount)
			{
				if ('USD' == currency.substr(0, 3))
				{
					$scope.positionAlert.totalAmount = $scope.positionAlert.quant / $scope.positionAlert.price;
				}
				else
				{
					$scope.positionAlert.totalAmount = $scope.positionAlert.quant * $scope.positionAlert.price;
				}
			}

			if(window.location.hash != '#/tab/play')
			{
				return;
			}

			let hasSeen = false;

			if($scope.positionAlert.pair && $scope.positionAlert.date)
			{
				var hasSeenIdx = closedPositionResultsSeen.findIndex(item => {
					if(item.pair === $scope.positionAlert.pair && parseInt(item.date) === parseInt($scope.positionAlert.date)){
						return true;
					}
				});

				if(hasSeenIdx >= 0)
				{
					hasSeen = true;
				}

				if(!hasSeen)
				{
					let closedResultData = {pair: $scope.positionAlert.pair, date: $scope.positionAlert.date};
					closedPositionResultsSeen.push(closedResultData);
				}
			}

			if(hasSeen)
			{
				console.log('skipping positionClosedResult, because already seen!!');
				return;
			}

			$rootScope.positionClosedResult();

			// if review feedback is open, force close it
			$rootScope.closeReviewFeedbackForce();

			$scope.positionAlert.tradeValue = $filter('number')(Math.abs($scope.tradeValue), 2);
			$scope.positionAlert.openPrice = CanvasJS.formatNumber(Math.abs($scope.positionAlert.openPrice), "0.00#####");
			$scope.positionAlert.closePrice = CanvasJS.formatNumber(Math.abs($scope.positionAlert.closePrice), "0.00#####");
			$scope.positionAlert.totalAmount = $filter('number')($scope.positionAlert.totalAmount);

			var positionTime = $scope.positionAlert.positionTime;
			if(positionTime < 60)
			{
				$scope.positionAlert.time = Math.floor(positionTime) + ' ' + $rootScope.t('seconds');
			}
			else if(positionTime < 3600)
			{
				$scope.positionAlert.time = Math.floor(positionTime / 60) + ' ' + $rootScope.t('minutes');
			}
			else if(positionTime < 86400)
			{
				$scope.positionAlert.time = Math.floor(positionTime / 3600) + ' ' + $rootScope.t('hours');
			}
			else
			{
				$scope.positionAlert.time = Math.floor(positionTime / 86400) + ' ' + $rootScope.t('days');
			}

			// increasing lastuserWins here, as getting the lastUserWins in TopCtrl is a bit delayed
			if($scope.positionAlert.tradeValue >= 0)
			{
				if(!window.localStorage.lastUserWins)
				{
					window.localStorage.lastUserWins = 0;
				}
				else
				{
					window.localStorage.lastUserWins = parseInt(window.localStorage.lastUserWins) + 1;
				}
			}

			// It is possible to have Trade Close Popup opened in other controllers with correct timings, this should close the popup
			$timeout(function()
			{
				if(window.location.hash != "#/tab/play" && window.document.querySelectorAll('.popup-container.tradeAlert').length > 0)
				{
					window.alertPopup.close();
				}
			}, 500);

			//in-app review
			var currTime = new Date().getTime();

			//init
			if(!window.localStorage.firstWinDate)
			{
				window.localStorage.winStreakToday = 0;
				// the time of the first win of the day
				window.localStorage.firstWinDate = currTime;
				window.localStorage.lastReviewDate = 0;
				window.localStorage.reviewCounter = 0;
			}

			if($scope.tradeValue >= 0)
			{
				// more than day since previous win
				if((currTime - window.localStorage.firstWinDate) > (1000 * 60 * 60 * 24))
				{
					window.localStorage.winStreakToday = 0;
					window.localStorage.firstWinDate = currTime;
				}

				window.localStorage.winStreakToday = parseInt(window.localStorage.winStreakToday) + 1;

				if(!$scope.user.wins)
				{
					$scope.user.wins = 1;
					$scope.user.losses = 0;
				}
				else
				{
					$scope.user.wins++;
				}

			}
			else
			{
				window.localStorage.winStreakToday = 0;

				if(!$scope.user.losses)
				{
					$scope.user.wins = 0;
					$scope.user.losses = 1;
				}
				else
				{
					$scope.user.losses++;
				}

			}
		}

		$timeout.cancel(updateMenuT1);
		var updateMenuT1 = $timeout(function()
		{
			$scope.lastValues = {};
			$scope.updatePositionValue(currency);
			updateMenu(true);
		}, 0, false);
	};

	$scope.openStrategiesLesson = function()
	{
		$rootScope.closePositionResult();
		LessonOpener.open(11, 'learnanchor');
	};

	$scope.shareResult = function()
	{
		var imageLink;
		navigator.screenshot.save(function(error, res)
		{
			if(error)
			{
				console.error(error);
			}
			else
			{
				imageLink = res.filePath;
				var msg = "Learn to trade with ZERO risk - ";
	            var subject = "Alo";
	            var url = "https://goforex.app";

				if($rootScope.isIOS)
				{
					window.plugins.socialsharing.share(msg, null, imageLink, url);
				}
				else
				{
					window.plugins.socialsharing.share(msg, null, 'file://' + imageLink, url);
				}
			}
		},'jpg', 50, 'myScreenShot');
	};
})

.controller('UserTopCtrl', function($scope, $rootScope, Mongo, $interval, $timeout, PortfolioTitle, $http, $ionicScrollDelegate, OnlineStatus, $ionicPopup) {

	$scope.placeholderRankArray = Array.from(Array(50).keys());

	function viewReadyCheck()
	{
		$timeout(function()
		{
			if(
				$scope.loadedTopItems[($scope.topIndex || 0)] && ($scope.selfRank[0]/* && $scope.selfRank[0] != 'N/A'*/) && $scope.prevPeriod[($scope.topIndex || 0)]
				|| $scope.topIndex == 2 // friends
			)
			{
				$scope.viewReady = true;
			}
			else
			{
				$scope.viewReady = false;

				window.clearTimeout(window.viewReadyTimeout);
				window.viewReadyTimeout = window.setTimeout(function()
				{
					viewReadyCheck();
				}, 500);
			}
		});
	}

	Mongo.updateBreakdown();
	viewReadyCheck();

	// $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	// {
	// 	if(toState && toState.url == '/usertop')
	// 	{
	// 		Mongo.updateBreakdown();
	// 		$scope.loadedTopItems[0] = [];
	// 		$scope.loadedTopItems[1] = [];
	// 		$scope.prevPeriod = {};
	// 		$scope.setTopIndex($scope.topIndex);
	// 		viewReadyCheck();

	// 		PortfolioTitle.stop();
	// 		PortfolioTitle.start();

	// 		if($scope.user && !$scope.user.oauthMethod && !$scope.loginShowedOnce)
	// 		{
	// 			$timeout(function()
	// 			{
	// 				if(window.location.hash == '#/tab/usertop')
	// 				{
	// 					$scope.expandLogin();
	// 				}
	// 			}, 1000);
	// 		}

	// 		$scope.copyLinkSuccess = false;
	// 	}
	// 	else
	// 	{
	// 		window.clearTimeout(window.topResetTimer);
	// 		$scope.searchText = {name: ''};
	// 		$scope.searchUsersBatchesByName($scope.searchText.name);

	// 		window.clearTimeout(window.viewReadyTimeout);
	// 	}
	// });

	function refreshTop()
	{
		if(window.location.hash == '#/tab/usertop')
		{
			Mongo.updateBreakdown();
			$scope.loadedTopItems[0] = [];
			$scope.loadedTopItems[1] = [];
			$scope.prevPeriod = {};
			$scope.setTopIndex($scope.topIndex);
			viewReadyCheck();

			PortfolioTitle.stop();
			PortfolioTitle.start();
		}
	}

	document.addEventListener("resume", function() {
		refreshTop();
	}, false);

	$rootScope.$on('user-invited-success', function(event)
	{
		refreshTop();
	});

	var offlineCheck = window.setInterval(function() {
		if ($scope.loadedTopItems && $scope.loadedTopItems[0] && $scope.loadedTopItems[0].length) {
			window.clearInterval(offlineCheck);
			console.log('clear user top offline interval');
			return;
		}

		refreshTop();
	}, 5000);

	$scope.topTypes = [[$scope.t('Today'), 1], [$scope.t('Week'), 7], [$scope.t('Friends'), 7]];
	$scope.topTypesMongo = [[$scope.t('Today'), 'day'], [$scope.t('Week'), 'week'], [$scope.t('Friends'), 'friends']];
	$scope.topIndex = 0;
	$scope.week = '';
	$scope.year = '';

	$scope.isOnline = true;

	var getSelf = function()
	{
		return userSummary($scope.user, $scope.user.firebaseKeyId, $scope.userInfo);
	};

	function userSummary(user, id, batchData)
	{
		var countryNames = _.invert(countries);

		var itemIdx = $scope.loadedTopItems[$scope.topIndex].findIndex(item => item.firebaseKeyId === id);
		var item = $scope.loadedTopItems[$scope.topIndex][itemIdx];

		if(itemIdx >= 0)
		{
			$scope.selfRank[$scope.topIndex] = itemIdx + 1;

			return {id: id, name: user.name || '', fiId: user.fiId || '', isUserPro: user.isUserPro || false, country: item.country || '', fb: user.oauthID || '', growth: item.growth, portfolio: item.portfolio || 0, fullCountry: countryNames[user.country], picture: item.picture || ''};
		}
		else
		{
			return {id: id, name: user.name || '', fiId: user.fiId || '', isUserPro: user.isUserPro || false, country: user.country || '', fb: user.oauthID || '', growth: batchData.growth, portfolio: batchData.portfolio || 0, fullCountry: countryNames[user.country], picture: user.picture || ''};
		}
	};

	var countries = {"United States":"US","Canada":"CA","United Kingdom":"GB","Argentina":"AR","Australia":"AU","Austria":"AT","Belgium":"BE","Brazil":"BR","Chile":"CL","China":"CN","Colombia":"CO","Croatia":"HR","Denmark":"DK","Dominican Republic":"DO","Egypt":"EG","Finland":"FI","France":"FR","Germany":"DE","Greece":"GR","Hong Kong":"HK","India":"IN","Indonesia":"ID","Ireland":"IE","Israel":"IL","Italy":"IT","Japan":"JP","Jordan":"JO","Kuwait":"KW","Lebanon":"LB","Malaysia":"MY","Mexico":"MX","Netherlands":"NL","New Zealand":"NZ","Nigeria":"NG","Norway":"NO","Pakistan":"PK","Panama":"PA","Peru":"PE","Philippines":"PH","Poland":"PL","Russia":"RU","Saudi Arabia":"SA","Serbia":"RS","Singapore":"SG","South Africa":"ZA","South Korea":"KR","Spain":"ES","Sweden":"SE","Switzerland":"CH","Taiwan":"TW","Thailand":"TH","Turkey":"TR","United Arab Emirates":"AE","Venezuela":"VE","Portugal":"PT","Luxembourg":"LU","Bulgaria":"BG","Czech Republic":"CZ","Slovenia":"SI","Iceland":"IS","Slovakia":"SK","Lithuania":"LT","Trinidad and Tobago":"TT","Bangladesh":"BD","Sri Lanka":"LK","Kenya":"KE","Hungary":"HU","Morocco":"MA","Cyprus":"CY","Jamaica":"JM","Ecuador":"EC","Romania":"RO","Bolivia":"BO","Guatemala":"GT","Costa Rica":"CR","Qatar":"QA","El Salvador":"SV","Honduras":"HN","Nicaragua":"NI","Paraguay":"PY","Uruguay":"UY","Puerto Rico":"PR","Bosnia and Herzegovina":"BA","Palestine":"PS","Tunisia":"TN","Bahrain":"BH","Vietnam":"VN","Ghana":"GH","Mauritius":"MU","Ukraine":"UA","Malta":"MT","The Bahamas":"BS","Maldives":"MV","Oman":"OM","Macedonia":"MK","Latvia":"LV","Estonia":"EE","Iraq":"IQ","Algeria":"DZ","Albania":"AL","Nepal":"NP","Macau":"MO","Montenegro":"ME","Senegal":"SN","Georgia":"GE","Brunei":"BN","Uganda":"UG","Guadeloupe":"GP","Barbados":"BB","Azerbaijan":"AZ","Tanzania":"TZ","Libya":"LY","Martinique":"MQ","Cameroon":"CM","Botswana":"BW","Ethiopia":"ET","Kazakhstan":"KZ","Namibia":"NA","Madagascar":"MG","New Caledonia":"NC","Moldova":"MD","Fiji":"FJ","Belarus":"BY","Jersey":"JE","Guam":"GU","Yemen":"YE","Zambia":"ZM","Isle Of Man":"IM","Haiti":"HT","Cambodia":"KH","Aruba":"AW","French Polynesia":"PF","Afghanistan":"AF","Bermuda":"BM","Guyana":"GY","Armenia":"AM","Malawi":"MW","Antigua":"AG","Rwanda":"RW","Guernsey":"GG","The Gambia":"GM","Faroe Islands":"FO","St. Lucia":"LC","Cayman Islands":"KY","Benin":"BJ","Andorra":"AD","Grenada":"GD","US Virgin Islands":"VI","Belize":"BZ","Saint Vincent and the Grenadines":"VC","Mongolia":"MN","Mozambique":"MZ","Mali":"ML","Angola":"AO","French Guiana":"GF","Uzbekistan":"UZ","Djibouti":"DJ","Burkina Faso":"BF","Monaco":"MC","Togo":"TG","Greenland":"GL","Gabon":"GA","Gibraltar":"GI","Democratic Republic of the Congo":"CD","Kyrgyzstan":"KG","Papua New Guinea":"PG","Bhutan":"BT","Saint Kitts and Nevis":"KN","Swaziland":"SZ","Lesotho":"LS","Laos":"LA","Liechtenstein":"LI","Northern Mariana Islands":"MP","Suriname":"SR","Seychelles":"SC","British Virgin Islands":"VG","Turks and Caicos Islands":"TC","Dominica":"DM","Mauritania":"MR","Aland Islands":"AX","San Marino":"SM","Sierra Leone":"SL","Niger":"NE","Republic of the Congo":"CG","Anguilla":"AI","Mayotte":"YT","Cape Verde":"CV","Guinea":"GN","Turkmenistan":"TM","Burundi":"BI","Tajikistan":"TJ","Vanuatu":"VU","Solomon Islands":"SB","Eritrea":"ER","Samoa":"WS","American Samoa":"AS","Falkland Islands":"FK","Equatorial Guinea":"GQ","Tonga":"TO","Comoros":"KM","Palau":"PW","Federated States of Micronesia":"FM","Central African Republic":"CF","Somalia":"SO","Marshall Islands":"MH","Vatican City":"VA","Chad":"TD","Kiribati":"KI","Sao Tome and Principe":"ST","Tuvalu":"TV","Nauru":"NR","Réunion":"RE"};

	$scope.selfRank = ['N/A', 'N/A', 'N/A'];

	if(window.localStorage.currentAvatar)
	{
		$scope.selfAvatar = window.localStorage.currentAvatar;
	}

	var isLoading = false;

	function loadUser()
	{
		$timeout(function()
		{
			if(!$scope.user)
			{
				loadUser();
			}
		}, 1000);

		if (isLoading) {
			console.log('User loading already in progress');
			return;
		}

		isLoading = true;

		Mongo.getCached(function(user)
		{
			if(!user)
			{
				$timeout(function()
				{
					isLoading = false;
					loadUser();
				}, 1000);

				return;
			}

			// should test if this messes something up
			if($scope.user) return;

			$scope.setTopIndex(0);

			$scope.user = user;

			generateInviteLink();

			if(!$scope.user.oauthMethod && !$scope.loginShowedOnce)
			{
				$timeout(function()
				{
					if(window.location.hash == '#/tab/usertop')
					{
						$scope.expandLogin();
					}
				}, 1000);
			}

			PortfolioTitle.stop();
			PortfolioTitle.start();

			if(user.avatar && !window.localStorage.currentAvatar)
			{
				window.localStorage.currentAvatar = user.avatar;
			}

			if(!window.localStorage.currentAvatar)
			{
				var avatarList = ['avatar-100.png', 'avatar-101.png', 'avatar-102.png', 'avatar-103.png', 'avatar-104.png', 'avatar-105.png', 'avatar-106.png', 'avatar-107.png', 'avatar-108.png', 'avatar-109.png', 'avatar-110.png', 'avatar-111.png', 'avatar-112.png', 'avatar-113.png', 'avatar-114.png', 'avatar-115.png', 'avatar-116.png', 'avatar-117.png', 'avatar-118.png', 'avatar-119.png', 'avatar-120.png', 'avatar-121.png', 'avatar-122.png', 'avatar-123.png', 'avatar-124.png', 'avatar-125.png', 'avatar-126.png', 'avatar-127.png', 'avatar-128.png', 'avatar-129.png', 'avatar-130.png', 'avatar-131.png', 'avatar-132.png', 'avatar-133.png', 'avatar-134.png', 'avatar-135.png', 'avatar-136.png', 'avatar-137.png', 'avatar-138.png', 'avatar-139.png', 'avatar-140.png', 'avatar-141.png', 'avatar-142.png', 'avatar-143.png', 'avatar-144.png', 'avatar-145.png', 'avatar-146.png', 'avatar-147.png', 'avatar-148.png', 'avatar-149.png', 'avatar-150.png', 'avatar-151.png', 'avatar-152.png', 'avatar-153.png', 'avatar-154.png', 'avatar-155.png', 'avatar-156.png', 'avatar-157.png', 'avatar-158.png', 'avatar-159.png', 'avatar-160.png', 'avatar-161.png', 'avatar-162.png'];

				var rand = Math.floor(Math.random() * avatarList.length);
				window.localStorage.currentAvatar = avatarList[rand];

				Mongo.update({avatar: window.localStorage.currentAvatar});
			}

			$scope.selfAvatar = window.localStorage.currentAvatar;

			var countryCallbackSuccess = false;

			var countryCallback = function(res)
			{
				countryCallbackSuccess = true;
				if ($scope.user && (!$scope.user.country || ($scope.user.country != res.data.countrycode)) || !window.localStorage.userCountry)
				{
					Mongo.update({country: res.data.countrycode});
					window.localStorage.userCountry = res.data.countrycode;
				}

				// preload top lists
				_.each([0, 1], function(k) {$scope.setTopIndex(k, true); });
			};

			$http.get('http://www.geoplugin.net/json.gp').then(countryCallback);

			$timeout(function()
			{
				if (countryCallbackSuccess)
				{
					return;
				}

				$http.get('http://www.geoplugin.net/json.gp').then(function(res)
				{
					res.data.countrycode = res.data.geoplugin_countryCode;
					countryCallback(res);
				});
			}, 2000);

		}, function() {
			Mongo.get(function(user)
			{
				$scope.user = user;

				isLoading = false;
				loadUser();
			});
		});

		$timeout.cancel(isLoadingT);
		var isLoadingT = $timeout(function()
		{
			isLoading = false;
		}, 10000);
	};

	$interval.cancel(window.watchLoadIntv);
	window.watchLoadIntv = $interval(function()
	{
		if ($scope.isOnline)
		{
			loadUser();
			$interval.cancel(window.watchLoadIntv);
		}
	}, 200, 0, false);

	// set scope.self if it is preloaded
	if(window.localStorage.self)
	{
		$scope.self = JSON.parse(window.localStorage.self);
	}

	$scope.userDataArray = [];

	if(window.localStorage.getItem('userDataArray')) {
		try {
			$scope.userDataArray = JSON.parse(window.localStorage.getItem('userDataArray'));
		} catch (e) {
			$scope.userDataArray = [];
		}
	}

	if(window.localStorage.self)
	{
		var slf = {_id: $scope.self._id, dps: $scope.self.weeksGrowthArray, color: 'blue', picture: $scope.self.picture || $scope.self.avatar};
		if ($scope.userDataArray.length) {
			$scope.userDataArray[0] = slf;
		} else {
			$scope.userDataArray.push(slf);
		}

		watchGrowthChart();
	}

	function watchGrowthChart()
	{
		if(window.growthchart)
		{
			$scope.updateGrowthChart($scope.userDataArray, 0);
		}
		else
		{
			$timeout.cancel(window.growthChartTimeout);
			window.growthChartTimeout = $timeout(function()
			{
				watchGrowthChart();
			}, 100);
		}
	}

	var isPurpleTaken = false;
	var checkColor;

	$scope.compareAgainst = function(user, event)
	{
		// checking if self
		if($scope.self._id == user._id)
		{
			return;
		}

		if (event) {
			event.stopPropagation();
		}

		isPurpleTaken = $scope.userDataArray.filter(u => u.color == 'purple').length > 0;

		// check if disabling compare for the user or enabling
		let userIndex = $scope.userDataArray.findIndex(item => item._id === user._id);
		if(userIndex >= 0) // disabling
		{
			if($scope.userDataArray[userIndex].color == 'purple')
			{
				isPurpleTaken = false;
			}

			$scope.userDataArray.splice(userIndex, 1);
			$scope.removeGrowthData(user._id);
			return;
		}
		else // enabling
		{
			if($scope.userDataArray.length > 2)
			{
				console.log('too many users to compare!');
				return;
			}

			if(!isPurpleTaken)
			{
				checkColor = 'purple';
				isPurpleTaken = true;
			}
			else
			{
				checkColor = 'orange';
			}

			var updateIndex = $scope.userDataArray.length;
			var item = {_id: user._id, dps: user.weeksGrowthArray, color: checkColor, picture: user.picture || 'img/avatars/' + user.avatar};
			$scope.userDataArray.push(item);
		}

		$scope.updateGrowthChart($scope.userDataArray, updateIndex);
	}

	$scope.removeGrowthData = function(id)
	{
		var removeIndex = window.growthchart.data.datasets.findIndex(item => item.id === id);
		if(removeIndex == -1)
		{
			console.log('no dataset found with id', id);
			return;
		}

		window.growthchart.data.datasets.splice(removeIndex, 1);
		window.growthchart.options.scales.y.min = 0;
		window.growthchart.options.scales.y.max = 0;
		window.growthchart.update();

		if($scope.userDataArray.findIndex(item => item._id === id) >= 0)
		{
			$scope.userDataArray.splice(removeIndex, 1);
		}

		$scope.updateGrowthChart($scope.userDataArray);
	};

	$scope.updateCallback = function()
	{
		watchGrowthChart();
	}

	$scope.updateGrowthChart = function(data, specificIndex)
	{
		console.log('updateGrowth called', data, specificIndex);
		if(!window.growthchart)
		{
			console.log('no growthchart!');
			return;
		}

		var minDp = 0;
		var maxDp = 0;
		var winnerId;
		var highestGrowth;
		var lowestGrowth;

		window.growthchart.options.scales.y.min = 0;
		window.growthchart.options.scales.y.max = 0;

		data.forEach(function(item, index)
		{
			if(!item || !item.dps)
			{
				console.warn('returning cuz no item.dps');
				return;
			}

			var datasetObject = {
				backgroundColor: "rgba(255,255,255,1)",
				borderWidth: 1,
			};

			var totalGrowth = 0;
			var dps = item.dps.map(function(d){
				d.growth = Math.min(500, d.growth);
				totalGrowth += d.growth;

				if(!lowestGrowth || totalGrowth < lowestGrowth)
				{
					lowestGrowth = totalGrowth;
				}

				return d.growth
			});

			if(!highestGrowth || totalGrowth > highestGrowth)
			{
				highestGrowth = totalGrowth;
				winnerId = item._id;
			}

			if(dps.length < 7)
			{
				let fillAmount = 7 - dps.length;
				for(let i = 0; i < fillAmount; i++)
				{
					dps.unshift(0);
				}
			}

			if(Math.min(Math.floor(Math.min.apply(Math, dps)), -4) < minDp)
			{
				minDp = Math.min(Math.floor(Math.min.apply(Math, dps)), -4);
			}

			if(Math.max(Math.ceil(Math.max.apply(Math, dps)), 4) > maxDp)
			{
				maxDp = Math.max(Math.ceil(Math.max.apply(Math, dps)), 4);
			}

			if(minDp < window.growthchart.options.scales.y.min)
			{
				window.growthchart.options.scales.y.min = minDp;
			}

			if(maxDp > window.growthchart.options.scales.y.max)
			{
				window.growthchart.options.scales.y.max = maxDp;
			}

			function calculateYAxisLabels(minValue, maxValue, numLabels) {
				let halfNumLabels = Math.floor(numLabels / 2);
				let range = Math.max(Math.abs(minValue), Math.abs(maxValue));
				// maxDp = range;
				// minDp = -range;
				let step = range / halfNumLabels;
				let yAxisLabels = [];

				for (let i = -halfNumLabels; i <= halfNumLabels; i++) {
					let label = i * step;
					let roundedLabel;

					if (label % 1 === 0 || label % 1 === 0.5) {
						// If the label is already a whole number or .5 decimal, keep it as is
						roundedLabel = label;
					} else {
						// Otherwise, round it to the nearest .5 decimal or whole number
						roundedLabel = Math.round(label * 2) / 2;
					}

					yAxisLabels.push(roundedLabel);
				}

				return yAxisLabels;
			}

			function calculateFillerYValues(yAxisLabels, numFillers) {
				let fillerYValues = [];

				for (let i = 0; i < yAxisLabels.length - 1; i++) {
					let start = yAxisLabels[i];
					let end = yAxisLabels[i + 1];
					let step = (end - start) / (numFillers + 1);

					for (let j = 1; j <= numFillers; j++) {
						let filler = start + j * step;

						// Round to the nearest whole number or value with a decimal of 0.5
						filler = Math.round(filler * 2) / 2;

						fillerYValues.push(filler);
					}
				}

				return fillerYValues;
			}

			var numYAxisLabels = 5;
			var numFillers = 3;

			var yLabelArray = calculateYAxisLabels(minDp, maxDp, numYAxisLabels);

			// readjusting min and max to fit the labels
			// if(minDp < window.growthchart.options.scales.y.min)
			// {
				// window.growthchart.options.scales.y.min = minDp;
			// }

			// if(maxDp > window.growthchart.options.scales.y.max)
			// {
				// window.growthchart.options.scales.y.max = maxDp;
			// }

			var fillerYValues = calculateFillerYValues(yLabelArray, numFillers);

			// console.log(yLabelArray, fillerYValues);
			window.growthchart.options.scales.y.grid.color = function(context)
			{
				// console.log(context);
				if(yLabelArray.indexOf(context.tick.value) > -1)
				{
					// context.tick.label = labelArray[labelIndexArray.indexOf(context.index)] + '%';
					return 'rgba(000,000,000,0.13)';
				}
				else if(fillerYValues.indexOf(context.tick.value) > -1)
				{
					context.tick.label = '';
					return 'rgba(000,000,000,0.026)';
				}
				else
				{
					context.tick.label = '';
				}
			}

			datasetObject.data = dps;

			var actualColor = '#3333FF';
			if(item.color == 'purple')
			{
				actualColor = '#FB33FF';
			}
			else if(item.color == 'orange')
			{
				actualColor = '#FF5C00';
			}

			if(actualColor != '#3333FF')
			{
				datasetObject.borderDash = [3,3];
			}
			datasetObject.borderColor = actualColor;

			datasetObject.id = item._id;

			window.growthchart.data.datasets[index] = JSON.parse(JSON.stringify(datasetObject));
		});

		console.log('data', window.growthchart.data);

		$scope.growthWinnerId = winnerId;
		window.growthchart.update();

		window.localStorage.setItem('userDataArray', JSON.stringify($scope.userDataArray));
	}

	$scope.isBeingCompared = function(user)
	{
		let userIndex = $scope.userDataArray.findIndex(item => item._id === user._id);
		if(userIndex >= 0)
		{
			return $scope.userDataArray[userIndex].color;
		}
		else
		{
			return false;
		}
	}

	$scope.loadedTopItems = {};
	$scope.prevPeriod = {};
	var resetsInCache = {};

	var lastReloaded = null;

	var postProcessTop = function(topItems, isReturn, loadOnly, index)
	{
		var countryNames = _.invert(countries);

		if(!isReturn)
		{
			// console.log($scope.topIndex, topItems);
		}

		var i = 0;
		_.each(topItems, function(item)
		{
			item.fullCountry = countryNames[item.country];

			if (item.name) {
				var nameArray = item.name.split(' ');

				if(nameArray.length == 1 || nameArray[0] == "Trader")
				{
					return;
				}

				nameArray[0] = nameArray[0][0] + '.';
				var fullName = nameArray.join(' ');
				item.name = fullName;
			} else {
				item.name = 'Trader #' + item.fiId;
			}
		});

		if (isReturn) {
			return topItems;
		}

		if (!loadOnly)
		{
			$scope.topItems = topItems;
		}

		$scope.loadedTopItems[index] = topItems;

		function setSelfRank()
		{
			if(!$scope.userInfo || !$scope.userInfo.rank || !$scope.userInfo.rank.day || !$scope.userInfo.name || $scope.userInfo.name == 'YOU')
			{
				// $scope.selfRank[0] = 'NA';
				// $scope.selfRank[1] = 'NA';
				$scope.selfRank[0] = $scope.user.fiId;
				$scope.selfRank[1] = $scope.user.fiId;
			}
			else
			{
				var rank = $scope.userInfo.rank.day + 1;
				if($scope.topIndex == 1)
				{
					var rank = $scope.userInfo.rank.week + 1;
				}

				if (!rank && (rank !== 0))
				{
					rank = 'NA';
				}

				$scope.selfRank[$scope.topIndex] = rank;

				if (0 == $scope.topIndex) {
					$scope.selfRank[1] = $scope.userInfo.rank.week || $scope.userInfo.rank.day;
				}
			}
		}

		// if user is in top 50, get rank from there
		if($scope.user)
		{
			var itemIdx = $scope.loadedTopItems[index].findIndex(item => item.firebaseKeyId === $scope.user.firebaseKeyId);
			if(itemIdx >= 0)
			{
				var item = $scope.loadedTopItems[index][itemIdx];
				$scope.selfRank[index] = itemIdx + 1;
				$scope.userInfo = item;
			}
			else
			{
				Mongo.getInfo(function(info)
				{
					$scope.userInfo = info;
					$scope.self = $scope.userInfo;

					if($rootScope.isUserPro)
					{
						$scope.self.isUserPro = true;
					}

					if(!$scope.self.growth)
					{
						$scope.self.growth = {day: 0.00, week: 0.00};

						var portfolioVal = Mongo.portfolioValue();

						if(info.portfolioDay)
						{
							$scope.self.growth.day = portfolioVal - info.portfolioDay;
						}

						if(info.portfolioWeek)
						{
							$scope.self.growth.week = portfolioVal - info.portfolioWeek;
						}
					}

					if($scope.user.picture)
					{
						$scope.self.picture = $scope.user.picture;
					}

					if($scope.user.country)
					{
						$scope.self.country = $scope.user.country;
					}

					window.localStorage.self = JSON.stringify($scope.self);

					setSelfRank();
				});
			}
		}

		$timeout.cancel(window.digestT);
		window.digestT = $timeout(function() { $scope.$digest(); });

		$timeout.cancel(window.resizeT);
		window.resizeT = $timeout(function() {
			$ionicScrollDelegate.resize();
		}, 500);
	};

	var topTypeNames = ["Day", "Week", "Friends"];
	// tracking initial top type so analytics is more accurate?
	$scope.trackEvent("Account", "Top_" + topTypeNames[$scope.topIndex]);

	function startResetTimer(index)
	{
		// if(!resetsInCache || !resetsInCache[index])
		// {
		// 	return;
		// }

		index = $scope.topIndex;

		if(!$scope.resetsIn)
		{
			$scope.resetsIn = {};
		}

		window.clearTimeout(window.topResetTimer);
		let resetsIn = Math.max(0, Math.floor((resetsInCache[index] - Date.now()) / 1000));

		if (0 == resetsIn && (Date.now() - lastReloaded > 3600 * 1000)) {
			lastReloaded = Date.now();
			window.clearTimeout(window.topResetTimer);
			delete $scope.loadedTopItems[index];
			$scope.setTopIndex(index);
		}

		let days = Math.floor(resetsIn / (24*60*60));

		if (0 === index) {
			days = 0;
		}

		let hours = Math.floor(resetsIn % 86400/ (60*60));
		let minutes = Math.floor((resetsIn % 3600) / 60);
		let secs = resetsIn % 60;
		let time = [[Math.floor(days), 'd'], [Math.floor(hours), 'h'], [Math.floor(minutes), 'm'], [Math.floor(secs), 's']];
		$scope.resetsIn[index] = time.filter(p => p[0] > 0).map(p => p[0].toString() + p[1]).join(' ');
		$rootScope.$broadcast('$$rebind::topresets');

		var el = document.getElementById('top-reset-time-' + index.toString());
		if (el) {
			el.innerHTML = $scope.resetsIn[index];
		}

		window.topResetTimer = window.setTimeout(function() {
			startResetTimer(index);
		}, 500);
	}

	$scope.setTopIndex = function(index, loadOnly, track)
	{
		viewReadyCheck();
		if (track)
		{
			$scope.trackEvent("Account", "Top_" + topTypeNames[index]);
		}

		if (!loadOnly)
		{
			$scope.topItems = [];
			$scope.topIndex = index;

			if ($scope.loadedTopItems[index] && $scope.loadedTopItems[index].length > 0 && index != 2)
			{
				$scope.topItems = $scope.loadedTopItems[index];

				return;
			}
		}

		if($scope.topTypesMongo && $scope.topTypesMongo[index] && $scope.topTypesMongo[index][1])
		{
			var t = $scope.topTypesMongo[index][1];

			if(t == 'friends')
			{
				updateFriendsList();
				watchGrowthChart();
			}
			else
			{
				var tier1Countries = [
					"AR", "AU", "AT", "BH", "BD", "BE", "BO", "BR", "BG", "KY",
					"CL", "CO", "CR", "HR", "CY", "CZ", "DK", "DO", "EC", "EE",
					"FI", "FR", "GF", "PF", "DE", "GI", "GR", "GP", "GG", "HK",
					"HU", "IS", "IE", "IM", "IL", "IT", "JE", "KW", "LV", "LI",
					"LT", "LU", "MO", "MY", "MT", "MQ", "YT", "MX", "MC", "NL",
					"NZ", "NO", "OM", "PE", "PH", "PL", "PT", "QA", "RE", "RO",
					"SC", "SG", "SK", "SI", "ZA", "KR", "ES", "SE", "CH", "TW",
					"TH", "AE", "GB", "US", "UY", "VN"
				];

				if($rootScope.appConfig && $rootScope.appConfig.tier1Countries)
				{
					tier1Countries = $rootScope.appConfig.tier1Countries;
				}

				if(window.localStorage.userCountry)
				{
					var isUserTier1 = tier1Countries.indexOf(window.localStorage.userCountry) >= 0;
					var topType = t.concat(isUserTier1 ? '-tier1' : '-tier2');
				}
				else
				{
					var topType = t;
				}

				Mongo.getTopBy(topType, function(topData) {
					postProcessTop(topData[topType], false, loadOnly, index);
					if (topData.weekIdx) {
						$scope.week = topData.weekIdx;
						$scope.year = topData.year;
					}

					$scope.prevPeriod[index] = postProcessTop(topData.prevPeriod, true, loadOnly, index);
					resetsInCache[index] = Date.now() + (topData.resetsIn * 1000);

					startResetTimer(index);
				});
			}
		}
	};

	$scope.profitable = function(wins, losses)
	{
		if ($scope.user)
		{
			return Math.round(wins / (wins + losses) * 100) || 0;
		}
	};

	var topUserPopup;

	function updateFriendsList(res)
	{
		if(!res || typeof res == 'undefined')
		{
			if(!$scope.user || !$scope.user._id)
			{
				$timeout(function()
				{
					updateFriendsList();
				}, 500);

				return;
			}

			Mongo.getFriends($scope.user._id).then(function(res)
			{
				// console.log('friends response', res);
				updateFriendsList(res);
			}).catch(function(err)
			{
				console.log('error getting friends', err);
				$timeout(function()
				{
					updateFriendsList();
				}, 500);
			});

			return;
		}

		var friendsList = res;

		$scope.friendsList = [];

		_.each(friendsList.data, function(friend)
		{
			$scope.friendsList.push({userId: friend._id});
		});

		// friends top
		function loadSelfFriends()
		{
			Mongo.getCached(function(user)
			{
				Mongo.getInfo(function(info)
				{
					$scope.userInfo = info;
					$scope.self = $scope.userInfo;

					if($rootScope.isUserPro)
					{
						$scope.self.isUserPro = true;
					}

					$scope.self.portfolio = Mongo.portfolioValue();

					if(user.picture)
					{
						$scope.self.picture = user.picture;
					}

					if(!user.picture)
					{
						$scope.self.avatar = user.avatar;
					}

					if(user.country)
					{
						$scope.self.country = user.country;
					}

					$scope.self.name = 'YOU';

					$scope.self.isOnline = true;

					window.localStorage.self = JSON.stringify($scope.self);

					var friendsTop = [];
					friendsTop.push($scope.self);

					if(friendsList.data)
					{
						_.each(friendsList.data, function(friend)
						{
							friend.portfolio = friend.cash;

							if(!friend.picture && !friend.avatar)
							{
								friend.avatar = $scope.user.avatar;
							}

							if(!friend.name)
							{
								friend.name = 'Trader #' + friend.fiId;
							}

							friend.userId = friend._id;

							if(friend.lastActive)
							{
								let now = new Date().getTime();
								if(now - friend.lastActive < 10 * 60 * 1000) // 10 minutes
								friend.isOnline = true;
							}
							else
							{
								friend.isOnline = false;
							}

							friendsTop.push(friend);
						});
					}

					friendsTop =_.sortBy(friendsTop, function(fr) {
						return -fr.portfolio;
					});

					postProcessTop(friendsTop, false, false, 2);
				});
			}, function()
			{
				$timeout(function()
				{
					Mongo.get(function(user)
					{
						$scope.user = user;
						loadSelfFriends();
					});
				}, 1000);
			});
		}

		loadSelfFriends();
	}

	$scope.friendsTipSeen = window.localStorage.friendsTipSeen || false;

	$scope.closeFriendsTip = function()
	{
		$scope.friendsTipSeen = true;
		window.localStorage.friendsTipSeen = true;
	}

	$scope.clearUserSearch = function()
	{
		$scope.searchText = {name: ''};
		$scope.searchUsersBatchesByName($scope.searchText.name);
	}

	$scope.isFriend = function(userId)
	{
		if(!userId)
		{
			return;
		}

		if(!$scope.friendsList)
		{
			return false;
		}

		var isFriend = $scope.friendsList.findIndex(item => item.userId === userId);
		if(isFriend >= 0)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	$scope.followUser = function(userId)
	{
		if(!userId)
		{
			console.log('no userId', userId);
			return;
		}

		$rootScope.trackEvent("UserTop", "FollowUser");

		var obj = {userId: userId};

		Mongo.addFriend($scope.user.firebaseKeyId, obj).then(function()
		{
			console.log('added friend');
			updateFriendsList();
		}).catch(function(error)
		{
			console.log('error adding friend', error);
		});
	}

	$scope.unfollowUser = function(userId)
	{
		if(!userId)
		{
			console.log('no userId', userId);
			return;
		}

		$rootScope.trackEvent("UserTop", "UnfollowUser");

		var obj = {userId: userId};

		Mongo.deleteFriend($scope.user.firebaseKeyId, obj).then(function()
		{
			updateFriendsList();
			$scope.removeGrowthData(obj.userId);
		}).catch(function(error)
		{
			console.log('error deleting friend', error);
		});
	}

	$scope.isSelf = function(userId)
	{
		if(!userId)
		{
			return false;
		}

		Mongo.getCached(function(user)
		{
			if(user._id == userId)
			{
				return true;
			}

			return false;
		});
	}

	$scope.openUserStats = function(user, event)
	{
		// check if clicked on checkbox
		if(event.target && event.target.className == 'checkmark')
		{
			return;
		}

		$rootScope.trackEvent("UserTop", "OpenUserStats");
		if(!user.country || user.country == '')
		{
			var country = '_European_Union';
		}
		else
		{
			var country = user.country.toLowerCase();
		}

		if(user && user.portfolio)
		{
			user.portfolio = parseFloat(user.portfolio).toFixed(2);
		}

		var element = angular.element(event.currentTarget);

		if (element.hasClass('loading-user-stats')) {
			return;
		}

		element.addClass('loading-user-stats');

		Mongo.getUserStats(user.firebaseKeyId, function(stats) {
			element.removeClass('loading-user-stats');

			if (!stats.favoriteAssets || !stats.favoriteAssets.length) {
				stats.favoriteAssets = window.appConfig.defaultPairs;
			}

			if(stats && stats.favoriteAssets)
			{
				if(stats.favoriteAssets.length > 5)
				{
					stats.favoriteAssets = stats.favoriteAssets.slice(0, 5);
				}
			}

			topUserPopup = $ionicPopup.alert({
				title: '',
				scope: $scope,
				cssClass: 'top-user-popup',
				buttons: [{
					text: '',
					onTap: function(e)
					{
						return;
					},
					type: 'close-popup'
				}],
				template: '\
				<div class="user-details">\
					<div class="picture" ng-class="{\'pro\': true}">\
						<img ng-src="img/avatars/' + user.avatar + '" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src=\'img/avatars/avatar-100.png\';" ng-if="' + (!user.picture ? true : false) + '">\
						<img src="' + user.picture + '" onerror="this.onerror=null;this.src=\'img/avatars/avatar-100.png\';" ng-if="' + (user.picture ? true : false) + '">\
						<div class="user-flag f32"><div class="rounded"><span class="flag ' + country + '"></span></div></div>\
						<div class="pro" ng-if="' + (user.isUserPro ? true : false) + '"></div>\
					</div>\
						<div class="info">\
						<span class="name">' + user.name + '</span>\
						<span class="trading-since"><t>Trading since</t> ' + moment.unix(stats.tradingSince / 1000).format('DD.MM.YYYY') + '</span>\
						<span class="awards" ng-if="' + (user.awards ? true : false) + '">Awards: <span class="award" ng-repeat="award in [1, 2]"></span></span>\
					</div>\
				</div>\
				<div class="user-stats">\
					<div class="stat">\
						<span class="icon icon-wallet"></span>\
						<span class="type"><t>Portfolio value</t></span>\
						<span class="value">$' + user.portfolio + '</span>\
					</div>\
					<div class="stat">\
						<span class="icon icon-lightning"></span>\
						<span class="type"><t>Trades won</t></span>\
						<span class="value">' + $scope.profitable(user.wins || stats.wins || 0, user.losses || stats.losses || 0) + '%</span>\
					</div>\
				</div>\
				<div class="fav-assets">\
					<span><t>Favourite assets</t></span>\
					<div class="asset-block">' + stats.favoriteAssets.map(a =>
						'<div class="asset-' + a + '">\
							<span class="asset"></span>\
						</div>').join('') +
					'</div>\
				</div>\
				<div class="follow-user" ng-if="!isSelf(\'' + user.userId + '\')">\
					<div class="follow-button" ng-if="!isFriend(\'' + user.userId + '\') && !isSelf(\'' + user.userId + '\')" ng-click="followUser(\'' + user.userId + '\')"><t>Follow</t></div>\
					<div class="follow-button unfollow" ng-if="isFriend(\'' + user.userId + '\') && !isSelf(\'' + user.userId + '\')" ng-click="unfollowUser(\'' + user.userId + '\')"><t>Unfollow</t></div>\
				</div>\
				'
			});
		}, function() {
			element.removeClass('loading-user-stats');
		});
	};

	$scope.isSelf = function(userId)
	{
		if(!$scope.user)
		{
			return false;
		}

		if($scope.user._id == userId)
		{
			return true;
		}

		return false;
	}

	$scope.loginActive = false;
	var appElm = angular.element(document.getElementById('app'));

	$scope.loginShowedOnce = false;

	$scope.expandLogin = function(track) {
		if(track)
		{
			$rootScope.trackEvent("UserTop", "Login_Open");
		}
		$scope.loginActive = true;
		$scope.loginShowedOnce = true;
		appElm.addClass('state-trans-started');
		if(!window.appElement)
		{
			window.appElement = angular.element(document.getElementById('app'));
		}

		$timeout(function()
		{
			window.appElement.addClass('opacity-transition');
		}, 1);
	};

	$scope.closeLogin = function() {
		$scope.loginActive = false;
		appElm.removeClass('state-trans-started');
		appElm.removeClass('opacity-transition');

		var el = window.document.querySelectorAll('.account-login')[0];
		el.classList.remove('open');
		el.style.removeProperty('transform');
	};

	$scope.inviteLink = ((window.localStorage.inviteLink && window.localStorage.inviteLink != 'null' && typeof window.localStorage.inviteLink != "undefined") ? window.localStorage.inviteLink : 'goforex.app/download');

	function generateInviteLink()
	{
		if(!$scope.user || ($scope.user && !$scope.user._id))
		{
			return;
		}

		if(window.plugins && window.plugins.appsFlyer)
		{
			window.plugins.appsFlyer.setAppInviteOneLinkID('28FB');

			var inviteOptions = {
				campaign: 'User_invite',
				customerID: $scope.user._id,
				userParams:
				{
					inviteeUuid: $scope.user._id,
					inviteVerification: md5($scope.user.firebaseKeyId)
				}
			};

			window.plugins.appsFlyer.generateInviteLink(inviteOptions, function(success)
			{
				console.log('success link', success);
				if(success.indexOf('goforex.onelink.me') > -1)
				{
					success = success.replace('goforex.onelink.me', 'pro.goforex.app');
				}
				$scope.inviteLink = success;
				window.localStorage.inviteLink = $scope.inviteLink;
				console.log('final invite link', $scope.inviteLink);
			}, function(error)
			{
				console.log('error generating invite link', error);
				$scope.inviteLink = 'goforex.app/download';
			});
		}
		else
		{
			console.log('no appsflyer plugin for invite link');
		}
	}

	$scope.copyLink = function()
	{
		$rootScope.trackEvent("UserTop", "Invite_Copy");
		if(typeof cordova != "undefined" && cordova.plugins && cordova.plugins.clipboard)
		{
			cordova.plugins.clipboard.copy($scope.inviteLink);
		}
		else
		{
			console.log('no cordova.plugins.clipboard');
			var text = $scope.inviteLink;
			var copyContent = async () =>
			{
				try {
					await navigator.clipboard.writeText(text);
					console.log('Content copied to clipboard');
				} catch (err) {
					console.error('Failed to copy: ', err);
				}
			}

			copyContent();
		}

		$scope.copyLinkSuccess = true;

		window.setTimeout(function()
		{
			$scope.copyLinkSuccess = false;
		}, 2000);
	}

	$scope.inviteShare = function()
	{
		$rootScope.trackEvent("UserTop", "Invite_Share");
		var msg = "Invited to GO Forex " + $scope.inviteLink;

		if(window.plugins.socialsharing)
		{
			window.plugins.socialsharing.share(msg, null, null, null);
		}
		else
		{
			console.log('no socialSharing plugin, other methods button wont work!!');
		}
	}

	$scope.searchedBatches = [];
	$scope.displaySearchResults = false;
	$scope.searchingUsers = false;
	$scope.displaySearchCriteria = false;

	$scope.searchUsersBatchesByName = function(name)
	{
		$rootScope.trackEvent("UserTop", "SearchForUsers");
		if(!name || name.length == 0)
		{
			$scope.displaySearchResults = false;
		}
		else
		{
			$scope.displaySearchResults = true;
		}

		if(!name || name.length < 3)
		{
			$scope.searchedBatches = [];
			$scope.searchingUsers = false;
			$scope.displaySearchCriteria = true;
			return;
		}

		$scope.searchingUsers = true;
		$scope.displaySearchCriteria = false;

		console.log('searching for... ', name);
		Mongo.searchBatchesByName(name).then(function(batches)
		{
			$scope.searchingUsers = false;
			var tempBatches = batches.data;

			_.each(tempBatches, function(item)
			{
				if (item.name) {
					var nameArray = item.name.split(' ');

					if(nameArray.length == 1 || nameArray[0] == "Trader")
					{
						return;
					}

					nameArray[0] = nameArray[0][0] + '.';
					var fullName = nameArray.join(' ');
					item.name = fullName;
				} else {
					item.name = 'Trader #' + item.fiId;
				}
			});

			$timeout(function()
			{
				$scope.searchedBatches = tempBatches;
				// console.log('$scope.searchedBatches', $scope.searchedBatches);
			});
		}).catch(function(err)
		{
			$scope.searchingUsers = false;
			console.log('searchBatchesByName error', err);
		});
	}

	$scope.defaultSearchText = $rootScope.t('Search friends to follow');

	$scope.searchText = {name: ''};
	$scope.searchTextChange = function()
	{
		if($scope.searchTimeout)
		{
			$timeout.cancel($scope.searchTimeout);
		}

		// delay user search for 1 second after input
		$scope.searchTimeout = $timeout(function()
		{
			console.log('$scope.searchText', $scope.searchText.name);
			$scope.searchUsersBatchesByName($scope.searchText.name);
		}, 1000);
	};

	$scope.closeKeyboard = function(event)
	{
		if(Keyboard && Keyboard.hide)
		{
			if(window.device && window.device.platform == "iOS")
			{
				if(event && event.keyCode == '13')
				{
					document.querySelectorAll('.search-input input')[0].blur();
					// Keyboard.hide();
				}
				else
				{
					return;
				}
			}
			else
			{
				Keyboard.hide();
			}
		}
	};
})

.controller('ProCtrl', function($scope, $rootScope, $timeout, $interval, $ionicViewSwitcher, $state, PortfolioTitle, Mongo, OnlineStatus, LoaderOverlay) {

	PortfolioTitle.stop();
	PortfolioTitle.start();

	$scope.currentLang = window.currentLang;

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url == '/pro')
		{
			PortfolioTitle.stop();
			PortfolioTitle.start();

			$scope.currentLang = window.currentLang;

			applyOfferings();
		}
		else
		{
			$interval.cancel(window.loadProUserInterval);
		}
	});

	$scope.friendsInvited = window.localStorage.friendsInvited || 0;

	var isLoading = false;
	var loadUserWhenOnline = function()
	{
		if ('pro' == $rootScope.screen)
		{
			$scope.isOnline = OnlineStatus.is();
			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });

			if (!$scope.isOnline)
			{
				//
			}
			else if (!isLoading && !$scope.user)
			{
				loadUser();
			}
		}
	};

	$interval.cancel(window.loadProUserInterval);
	window.loadProUserInterval = $interval(loadUserWhenOnline, 500, 0, false);

	$scope.isOnline = true;

	function loadUser()
	{
		isLoading = true;

		Mongo.getCached(function(user)
		{
			$scope.user = user;

			if(!$scope.user || !user)
			{
				return;
			}

			PortfolioTitle.stop();
			PortfolioTitle.start();

			$scope.friendsInvited = $scope.user.friendsInvited || 0;
			window.localStorage.friendsInvited = $scope.friendsInvited;

			if($scope.friendsInvited >= 3 && !$rootScope.isUserPro)
			{
				$rootScope.setProStatus(true);

				$timeout(function()
				{
					$ionicViewSwitcher.nextDirection("enter");
					$state.go('tab.play');
				}, 500);
			}
		}, function() {
			console.log('Error loading user data');

			Mongo.get(function(user)
			{
				if($scope.user)
				{
					return;
				}

				$scope.user = user;
				loadUser();
			}, function(error)
			{
				isLoading = false;
			});
		});

		$timeout.cancel(isLoadingT);
		var isLoadingT = $timeout(function()
		{
			isLoading = false;
		}, 5000);
	};

	loadUser();

	$scope.buyPro = function(type)
	{
		$rootScope.trackEvent("Pro", "Purchase_" + type);
		if(typeof Purchases == "undefined" || !Purchases)
		{
			console.log('no purchases plugin 2');
			LoaderOverlay.hide();

			// localhost testing
			// $rootScope.setProStatus(true, true);
			return;
		}

		if(type == 'monthly')
		{
			console.log('$scope.buyPro monthly');
			$rootScope.buyPro('monthly');
		}
		else if(type == 'lifetime')
		{
			console.log('$scope.buyPro lifetime');
			$rootScope.buyPro('lifetime');
		}
	}

	$scope.restorePurchases = function()
	{
		$rootScope.trackEvent("Pro", "Restore_Purchases");
		if(typeof Purchases == "undefined" || !Purchases)
		{
			console.log('no purchases plugin 2');
			LoaderOverlay.hide();
			return;
		}

		$rootScope.restorePurchases();
	}

	function generateInviteLink()
	{
		console.log('try generate invite link from pro ctrl');
		if(!window.plugins || !window.plugins.appsFlyer)
		{
			return;
		}

		if(window.plugins && window.plugins.appsFlyer)
		{
			window.plugins.appsFlyer.setAppInviteOneLinkID('28FB');

			var inviteOptions = {
				campaign: 'User_invite',
				customerID: $scope.user._id,
				userParams:
				{
					inviteeUuid: $scope.user._id,
					inviteVerification: md5($scope.user.firebaseKeyId)
				}
			};

			window.plugins.appsFlyer.generateInviteLink(inviteOptions, function(success)
			{
				console.log('success link', success);
				if(success.indexOf('goforex.onelink.me') > -1)
				{
					success = success.replace('goforex.onelink.me', 'pro.goforex.app');
				}
				$scope.inviteLink = success;
				window.localStorage.inviteLink = $scope.inviteLink;
				console.log('final invite link', $scope.inviteLink);
			}, function(error)
			{
				console.log('error generating invite link', error);
				$scope.inviteLink = 'goforex.app/download';
			});
		}
		else
		{
			console.log('no appsflyer plugin for invite link');
		}
	}

	$scope.inviteLink = ((window.localStorage.inviteLink && window.localStorage.inviteLink != 'null' && typeof window.localStorage.inviteLink != "undefined") ? window.localStorage.inviteLink : 'goforex.app/download');

	if(!window.localStorage.inviteLink)
	{
		Mongo.getCached(function(user)
		{
			$scope.user = user;
			generateInviteLink();
		});
	}

	$scope.copyLinkSuccess = false;

	$scope.inviteShare = function()
	{
		$rootScope.trackEvent("Pro", "Invite_Share");
		if(typeof cordova != "undefined" && cordova.plugins && cordova.plugins.clipboard)
		{
			cordova.plugins.clipboard.copy($scope.inviteLink);
		}
		else
		{
			console.log('no cordova.plugins.clipboard');
			var text = $scope.inviteLink;
			var copyContent = async () =>
			{
				try {
					await navigator.clipboard.writeText(text);
					console.log('Content copied to clipboard');
				} catch (err) {
					console.error('Failed to copy: ', err);
				}
			}

			copyContent();
		}

		var msg = "Invited to GO Forex " + $scope.inviteLink;

		if(window.plugins && window.plugins.socialsharing)
		{
			window.plugins.socialsharing.share(msg, null, null, null);
		}

		$scope.copyLinkSuccess = true;

		$timeout(function()
		{
			$scope.copyLinkSuccess = false;
		}, 2000);
	}

	$scope.defaultOffers = {
		"lifetime": {priceString: "$61.99", period: "Lifetime"},
		"monthly": {priceString: "$12.99", period: "monthly"}
	};

	function applyOfferings()
	{
		if($rootScope.offerings)
		{
			if($rootScope.offerings.availablePackages)
			{
				var availablePackages = $rootScope.offerings.availablePackages;
				_.each($rootScope.offerings.availablePackages, function(package)
				{
					if(package.packageType == 'MONTHLY' && package.product.priceString)
					{
						$scope.defaultOffers['monthly'].priceString = package.product.priceString;
					}

					if(package.packageType == 'LIFETIME' && package.product.priceString)
					{
						$scope.defaultOffers['lifetime'].priceString = package.product.priceString;
					}
				});
			}
		}
	}

	applyOfferings();
})

.controller('MissionCtrl', function($scope, $rootScope, PortfolioTitle, $timeout, $ionicViewSwitcher, $state) {
	if(window.localStorage.alertList)
	{
		$scope.alertList = JSON.parse(window.localStorage.alertList);
	}
	else
	{
		$scope.alertList = {};
	}

	var tempObj = {};

	$scope.toggleAllAlerts = function()
	{
		PortfolioTitle.stop();
		PortfolioTitle.restore($rootScope.t('ARCHIVE'));

		if(!window.localStorage.savedAlerts)
		{
			window.localStorage.savedAlerts = "{\"first\": true}";
			var savedAlerts = JSON.parse(window.localStorage.savedAlerts);
		}

		var savedAlerts = Object.keys(JSON.parse(window.localStorage.savedAlerts)).reverse();

		_.each(savedAlerts, function(key, idx)
		{
			if(key == 'first')
			{
				alert = {
					id: "first",
					text: $rootScope.t("Our analysts send daily trading signals and market insights that disappear after viewing. To save a signal for later viewing, answer the analysts question and click on save icon, it will be saved here."),
					title: $rootScope.t("Welcome to your signals archive.")
				};

				tempObj[key] = alert;

				if(savedAlerts.length == 1)
				{
					sortAlerts();
				}
			}
			else
			{
				// might want to update totalVotes somehow without fetching the full alert for less data consumption
				// if(!$rootScope.votedAlerts[key])
				// {
					// console.log('loading ' + key);
					$rootScope.getAlertSingle(key, function(alert)
					{
						if(alert.alertDate)
						{
							alert.alertDateFormatted = (new Date(alert.alertDate).getMonth() + 1) + '.' + new Date(alert.alertDate).getDate() + '.' + new Date(alert.alertDate).getFullYear();;
						}
						else
						{
							alert.alertDateFormatted = '12.11.2021';
						}

						if(alert.voteData)
						{
							var totalVotes = alert.voteData[0] + alert.voteData[1];
							alert.voteDataPercent[0] = Math.round(alert.voteData[0] / totalVotes * 100);
							alert.voteDataPercent[1] = Math.round(alert.voteData[1] / totalVotes * 100);
							alert.totalVotes = totalVotes;
						}

						tempObj[key] = alert;

						if(window.localStorage.alertsYourVote)
						{
							var alertsYourVote = JSON.parse(window.localStorage.alertsYourVote);
							tempObj[key].yourVote = alertsYourVote[key] || 0;
						}

						var alertListLocalStorage = JSON.parse(window.localStorage.alertList);
						alertListLocalStorage[key] = alert;
						window.localStorage.alertList = JSON.stringify(alertListLocalStorage);

						if(idx >= (savedAlerts.length -(savedAlerts.indexOf('first') ? 2 : 1)))
						{
							sortAlerts();
						}
					}, true);
				// }
			}
		});

		$scope.alertList = _.sortBy($scope.alertList, function(o) { return -o.alertDate; });

		window.localStorage.alertList = JSON.stringify($scope.alertList);
	};

	function sortAlerts()
	{
		$timeout(function()
		{
			$scope.alertList = _.sortBy(tempObj, function(o) { return -o.alertDate; });
			window.localStorage.alertList = JSON.stringify($scope.alertList);
		});
	}

	$scope.toggleAllAlerts();

	$scope.removeSavedAlert = function(key)
	{
		var savedAlerts = JSON.parse(window.localStorage.savedAlerts);
		delete savedAlerts[key];
		window.localStorage.savedAlerts = JSON.stringify(savedAlerts);

		tempObj = JSON.parse(window.localStorage.alertList);
		var deleteIdx = _.findIndex(tempObj, function(o){ return key == o.id});
		tempObj.splice(deleteIdx, 1);
		sortAlerts()
	};

	$scope.goToPro = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.pro');
	}
})

.controller('AnalyzeCtrl', function($scope, $rootScope, PortfolioTitle, $timeout, $interval, LessonOpener, Mongo, OnlineStatus, $state, $ionicViewSwitcher) {

	PortfolioTitle.stop();
	PortfolioTitle.start();

	var isLoading = false;
	var loadUserWhenOnline = function()
	{
		if ('analyze' == $rootScope.screen)
		{
			$scope.isOnline = OnlineStatus.is();
			$timeout.cancel(applyT);
			var applyT = $timeout(function() { $scope.$apply(); });

			if (!$scope.isOnline)
			{
				//
			}
			else if (!isLoading && !$scope.user)
			{
				loadUser();
			}
		}
	};

	$interval.cancel(window.loadCaseUserInterval);
	window.loadCaseUserInterval = $interval(loadUserWhenOnline, 500, 0, false);

	$scope.isOnline = true;
	$scope.currentAvatar = window.localStorage.currentAvatar;

	function loadUser()
	{
		isLoading = true;

		Mongo.getCached(function(user)
		{
			$scope.user = user;
			$scope.currentAvatar = $scope.user.avatar || window.localStorage.currentAvatar;
			if(!$scope.currentAvatar)
			{
				var avatarList = ['avatar-100.png', 'avatar-101.png', 'avatar-102.png', 'avatar-103.png', 'avatar-104.png', 'avatar-105.png', 'avatar-106.png', 'avatar-107.png', 'avatar-108.png', 'avatar-109.png', 'avatar-110.png', 'avatar-111.png', 'avatar-112.png', 'avatar-113.png', 'avatar-114.png', 'avatar-115.png', 'avatar-116.png', 'avatar-117.png', 'avatar-118.png', 'avatar-119.png', 'avatar-120.png', 'avatar-121.png', 'avatar-122.png', 'avatar-123.png', 'avatar-124.png', 'avatar-125.png', 'avatar-126.png', 'avatar-127.png', 'avatar-128.png', 'avatar-129.png', 'avatar-130.png', 'avatar-131.png', 'avatar-132.png', 'avatar-133.png', 'avatar-134.png', 'avatar-135.png', 'avatar-136.png', 'avatar-137.png', 'avatar-138.png', 'avatar-139.png', 'avatar-140.png', 'avatar-141.png', 'avatar-142.png', 'avatar-143.png', 'avatar-144.png', 'avatar-145.png', 'avatar-146.png', 'avatar-147.png', 'avatar-148.png', 'avatar-149.png', 'avatar-150.png', 'avatar-151.png', 'avatar-152.png', 'avatar-153.png', 'avatar-154.png', 'avatar-155.png', 'avatar-156.png', 'avatar-157.png', 'avatar-158.png', 'avatar-159.png', 'avatar-160.png', 'avatar-161.png', 'avatar-162.png'];

				if(!window.localStorage.currentAvatar)
				{
					var rand = Math.floor(Math.random() * avatarList.length);
					window.localStorage.currentAvatar = avatarList[rand];
				}

				Mongo.update({avatar: window.localStorage.currentAvatar});

				$scope.currentAvatar = window.localStorage.currentAvatar;
			}

			if(!$scope.user || !user)
			{
				return;
			}

			PortfolioTitle.start();
		}, function() {
			console.log('Error loading user data');

			Mongo.get(function(user)
			{
				if($scope.user)
				{
					return;
				}

				$scope.user = user;
				loadUser();
			}, function(error)
			{
				isLoading = false;
			});
		});

		$timeout.cancel(isLoadingT);
		var isLoadingT = $timeout(function()
		{
			isLoading = false;
		}, 5000);
	};

	var caseStudiesVersion = window.localStorage.caseStudiesVersion || '0000';
	var lastCasesUpdateTime = window.localStorage.lastCasesUpdate || new Date().getTime();

	function formatLastCasesUpdate(t)
	{
		var date = new Date(t);
		var today = new Date();

		if(date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear())
		{
			return 'Today';
		}
		else
		{
			return (date.getMonth() + 1) + '.' + date.getDate() + '.' + date.getFullYear();
		}
	}

	$scope.lastCasesUpdate = formatLastCasesUpdate(lastCasesUpdateTime);

	// $scope.caseStudiesImages = {};
	// $scope.caseStudies = [];
	$scope.caseStudies = window.defaultCaseStudies[window.currentLang || 'en'];
	$scope.caseStudiesImages = window.defaultCaseStudiesImages;

	$scope.showContent = false;
	function hideScreen()
	{
		$scope.showContent = false;
	}

	function showScreen()
	{
		$scope.showContent = true;
	}

	$scope.maxCases = 10;
	$scope.correctAnswers = window.localStorage.casesCorrectAnswers || 0;

	$scope.casesState = window.localStorage.casesState || 'intro';

	var sectionProfit = 0;
	$scope.randomCaseStudiesOrder = [];
	if(window.localStorage.randomCaseStudiesOrder)
	{
		try	{
			$scope.randomCaseStudiesOrder = JSON.parse(window.localStorage.randomCaseStudiesOrder);
		} catch(e) {
			console.log(e);
		}
	}

	if(window.localStorage.caseStudiesProgress)
	{
		if(window.localStorage.caseStudiesProgress)
		{
			$scope.caseIdx = parseInt(window.localStorage.caseStudiesProgress);
			$scope.introScreenCycle = Math.floor($scope.caseIdx / $scope.maxCases);
		}

		if(window.localStorage.casesState)
		{
			$scope.casesState = window.localStorage.casesState;
		}
	}

	function initCaseStudies()
	{
		$scope.caseLength = Math.floor($scope.caseStudies.length / 10) * 10;
		$scope.currentCaseState = 0;
		$scope.caseIdx = parseInt(window.localStorage.caseStudiesProgress) || 0;

		$scope.caseStudiesOrder = (($scope.randomCaseStudiesOrder && $scope.randomCaseStudiesOrder.length) ? $scope.randomCaseStudiesOrder : window.defaultCaseStudiesOrder);

		// just in case
		if($scope.caseIdx >= $scope.caseLength)
		{
			$scope.caseIdx = 0;
			window.localStorage.caseStudiesProgress = 0;
		}

		$scope.currentCasesPage = Math.floor(($scope.caseIdx + 1) / $scope.maxCases);
		$scope.currentCasesProgress = ($scope.caseIdx) % $scope.maxCases;

		sectionProfit = window.localStorage.casesSectionProfit || 0;

		$scope.casesState = window.localStorage.casesState || 'intro';

		$scope.caseLeverage = 1;
		if($scope.casesState == 'intro')
		{
			$timeout(function()
			{
				$scope.introScreenCycle = Math.floor($scope.caseIdx / $scope.maxCases);

				// just in case
				if($scope.introScreenCycle > 2)
				{
					$scope.introScreenCycle = 0;
				}
			});
		}

		$scope.correctAnswers = (window.localStorage.caseCorrectAnswers ? parseInt(window.localStorage.caseCorrectAnswers) : 0);

		$timeout(function()
		{
			if($scope.casesState == 'finished-part')
			{
				$scope.caseProfits = CanvasJS.formatNumber(getCaseProfit(1), '###,##0.00');
				setResultTitle();
			}
		});

		$timeout(function()
		{
			showScreen();
		}, 10);
	}

	function updateCaseStudies()
	{
		window.localStorage.showCasesUpdated = false;
		$rootScope.showCasesUpdated = false;

		if(caseStudiesVersion == '0000' || !cordova || !cordova.file || !navigator || !window.resolveLocalFileSystemURL || !zip)
		{
			// load default case studies if no internet connection or something is up with zip
			$scope.caseStudies = window.defaultCaseStudies[window.currentLang || 'en'];
			$scope.caseStudiesImages = window.defaultCaseStudiesImages;
			initCaseStudies();
		}
		else
		{
			// write downloaded case studies to scope variables
			function fetchLocal(url) {
				return new Promise(function(resolve, reject) {
					if(device.platform == 'iOS')
					{
						url = window.WkWebView.convertFilePath(url);
						console.log('url ' + url);
					}

					var xhr = new XMLHttpRequest
					xhr.onload = function() {
						resolve(new Response(xhr.responseText, {status: xhr.status}))
					}
					xhr.onerror = function(e) {
						reject(new TypeError('Local request failed' + e))
					}
					xhr.open('GET', url)
					xhr.send(null)
				})
			}

			// Access the extracted files
			var fileDirectory = cordova.file.dataDirectory;

			window.resolveLocalFileSystemURL(fileDirectory, function(directoryEntry) {
				directoryEntry.getDirectory('/case-studies', { create: false }, function(directoryEntry) {
					var reader = directoryEntry.createReader();
					reader.readEntries(function(entries) {
						var waitForCasesJson = new Promise(function(resolve, reject) {
							_.each(entries, function(entry, idx)
							{
								if(entry.name.indexOf('studies.json') >= 0)
								{
									fetchLocal(fileDirectory + entry.fullPath)
									.then(response => response.json())
									.then(data => {
										var caseData = data;

										if(caseData)
										{
											if(caseData.data)
											{
												$scope.caseStudies = caseData.data;
											}

											if(caseData.order)
											{
												window.defaultCaseStudiesOrder = caseData.order;
											}

											if(caseData.updateTime)
											{
												lastCasesUpdateTime = $scope.caseStudies.updateTime;
												window.localStorage.lastCasesUpdate = lastCasesUpdateTime;
												$scope.lastCasesUpdate = formatLastCasesUpdate(lastCasesUpdateTime);
											}
										}

										resolve();
									});
								}

								console.log('entry!!', entry.name, entry);

								if(entry.name.indexOf('.webp') >= 0)
								{
									if(entry.name.indexOf('.webp') >= 0)
									{
										entry.name = entry.name.replace('.webp', '');
									}

									$scope.caseStudiesImages[entry.name] = fileDirectory + entry.fullPath;

									if(device.platform == 'iOS')
									{
										$scope.caseStudiesImages[entry.name] = window.Ionic.WebView.convertFileSrc(entry.nativeURL);
										console.log('entry 2!!!', entry.name, entry, window.Ionic.WebView.convertFileSrc(entry.nativeURL));
									}
								}
							});
						});

						waitForCasesJson.then(function()
						{
							console.log('INitializing case studies');
							initCaseStudies();
						});
					}, function(error) {
						console.log('Error reading directory entries: ', error.code);
					});
				}, function(error) {
					console.log('Error getting directory: ', error.code);
				});
			}, function(error) {
				console.log('Error resolving directory: ', error.code);
			});
		}
	}

	updateCaseStudies();

	window.anScope = $scope;

	$scope.startCases = function()
	{
		$rootScope.trackEvent("Analayze", "Start");
		$scope.casesState = 'case';
		window.localStorage.casesState = 'case';
		$scope.currentCaseState = 0;
		$scope.correctAnswers = 0;
		window.localStorage.caseCorrectAnswers = $scope.correctAnswers;

		sectionProfit = 0;
		window.localStorage.casesSectionProfit = sectionProfit;
	};

	if(window.localStorage.caseStudiesProgress)
	{
		$scope.caseIdx = parseInt(window.localStorage.caseStudiesProgress);
		if($scope.maxCases)
		{
			$scope.introScreenCycle = Math.floor($scope.caseIdx / $scope.maxCases);
		}
		else
		{
			$scope.introScreenCycle = Math.floor($scope.caseIdx / 10);
		}
	}
	else
	{
		$scope.introScreenCycle = 0;
	}

	$scope.goToIntroScreen = function()
	{
		$rootScope.trackEvent("Analayze", "GoToIntroScreen");
		$scope.casesState = 'intro';
		window.localStorage.casesState = 'intro';

		$scope.introScreenCycle = $scope.introScreenCycle + 1;
		if($scope.introScreenCycle > 2)
		{
			$scope.introScreenCycle = 0;
		}
	};

	$scope.toggleHint = function()
	{
		if($scope.currentCaseState == 0)
		{
			$rootScope.trackEvent("Analayze", "EnableHint");
		}
		$scope.currentCaseState = ($scope.currentCaseState == 0 ? 1 : 0);
	};

	$scope.answerCase = function(idx)
	{
		$rootScope.trackEvent("Analayze", "Answered");
		$scope.answerCorrect = false;
		$scope.userAnswer = idx;
		if(idx == $scope.caseStudies[$scope.caseStudiesOrder[$scope.caseIdx]].c)
		{
			$scope.answerCorrect = true;
			$scope.correctAnswers = $scope.correctAnswers + 1;
			window.localStorage.caseCorrectAnswers = $scope.correctAnswers;
			sectionProfit = Math.round((parseFloat(sectionProfit) + parseFloat($scope.caseStudies[$scope.caseStudiesOrder[$scope.caseIdx]].profit)) * 100, 2) / 100;
			window.localStorage.casesSectionProfit = sectionProfit;
		}

		window.localStorage.caseStudiesProgress = $scope.caseIdx + 1;

		$scope.currentCaseState = 2;
	};

	$scope.nextCase = function()
	{
		$scope.caseIdx = $scope.caseIdx + 1;
		$scope.currentCasesProgress = $scope.currentCasesProgress + 1;
		$scope.currentCaseState = 0;
	};

	var casesResultTitles = [$rootScope.t("SUPERB!<br>WE ARE PROUD OF YOU"), $rootScope.t("WELL DONE<br>TRADER!"), $rootScope.t("NOT GREAT NOT TERRIBLE"), $rootScope.t("CAN’T WIN WITHOUT TRYING")];

	function getCaseProfit(leverage)
	{
		return 1000 + (sectionProfit * leverage);
	}

	function setResultTitle()
	{
		if($scope.correctAnswers > 9)
		{
			$scope.casesResultTitle = casesResultTitles[0];
		}
		else if($scope.correctAnswers >= 6)
		{
			$scope.casesResultTitle = casesResultTitles[1];
		}
		else if($scope.correctAnswers > 3)
		{
			$scope.casesResultTitle = casesResultTitles[2];
		}
		else
		{
			$scope.casesResultTitle = casesResultTitles[3];
		}
	}

	$scope.caseLeverage = 1;
	// inital leverage reporting
	$rootScope.trackEvent("Analayze", "ChangeLeverage_" + $scope.caseLeverage);

	$scope.changeCaseLeverage = function(leverage)
	{
		$rootScope.trackEvent("Analayze", "ChangeLeverage_" + leverage);
		$scope.caseLeverage = leverage;
		$scope.caseProfits = CanvasJS.formatNumber(getCaseProfit(leverage), '###,##0.00');
	};

	$scope.finishCurrentCases = function()
	{
		$rootScope.trackEvent("Analayze", "Finish");
		$scope.caseIdx = $scope.caseIdx + 1;
		$scope.currentCasesProgress = 0;

		$scope.currentCaseState = 0;

		$scope.caseLeverage = 1;

		$scope.casesState = 'finished-part';
		window.localStorage.casesState = 'finished-part';

		$scope.caseProfits = CanvasJS.formatNumber(getCaseProfit(1), '###,##0.00');
		setResultTitle();
	};

	function getRandomCaseStudiesOrder()
	{
		if(!$scope.caseStudies || !$scope.caseStudies.length)
		{
			console.log('no caseStudies?');
			return [];
		}

		var caseAmount = $scope.caseStudies.length;
		var tensOfCases = Math.floor(caseAmount / 10);
		var technicals = [];
		var randomOrder = []

		_.each(_.filter($scope.caseStudies, function(o) { return o.type == 'technicals'; }), function(o, idx)
		{
			technicals.push(o.id);
		});

		technicals = technicals.slice(0, tensOfCases * 2);
		technicals = _.shuffle(technicals);

		var allCaseIds = _.map($scope.caseStudies, function(o) { return o.id; });
		allCaseIds = _.difference(allCaseIds, technicals);
		allCaseIds = _.shuffle(allCaseIds);

		for(var i = 0; i < tensOfCases; i++)
		{
			randomOrder.push(technicals[i * 2]);
			randomOrder.push(technicals[i * 2 + 1]);

			for(var j = 0; j < 8; j++)
			{
				randomOrder.push(allCaseIds[j + i * 8]);
			}
		}

		return randomOrder;
	}

	$scope.repeatAll = function()
	{
		$rootScope.trackEvent("Analayze", "RepeatAll");
		$scope.currentCaseState = 0;
		$scope.caseIdx = 0;
		$scope.currentCasesPage = Math.floor(($scope.caseIdx + 1) / $scope.maxCases);
		$scope.currentCasesProgress = ($scope.caseIdx) % $scope.maxCases;

		$scope.randomCaseStudiesOrder = getRandomCaseStudiesOrder();
		if($scope.randomCaseStudiesOrder && $scope.randomCaseStudiesOrder.length)
		{
			window.localStorage.randomCaseStudiesOrder = JSON.stringify($scope.randomCaseStudiesOrder);
			$scope.caseStudiesOrder = $scope.randomCaseStudiesOrder;
		}

		$scope.caseLeverage = 1;

		$scope.casesState = 'intro';
		window.localStorage.casesState = 'intro';
		$scope.introScreenCycle = 0;

		$scope.correctAnswers = 0;
	};

	$scope.finishAll = function()
	{
		$scope.casesState = 'finished-all';
		window.localStorage.casesState = 'finished-all';
	};

	$scope.buyPro = function(type)
	{
		$rootScope.trackEvent("Analyze", "Pro_Purchase_" + type);

		if(typeof Purchases == "undefined" || !Purchases)
		{
			console.log('no purchases plugin 2');
			LoaderOverlay.hide();

			// localhost testing
			// $rootScope.setProStatus(true, true);
			return;
		}

		if(type == 'monthly')
		{
			console.log('$scope.buyPro monthly');
			$rootScope.buyPro('monthly');
		}
		else if(type == 'lifetime')
		{
			console.log('$scope.buyPro lifetime');
			$rootScope.buyPro('lifetime');
		}
	}

	$scope.openBrokers = function()
	{
		$rootScope.trackEvent("Analayze", "Open_Brokers");
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.top');
	};

	$scope.openTrading = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.play');
	};

	$scope.openLesson = function(id)
	{
		$rootScope.trackEvent("Analayze", "Lesson_Open_Strategies");
		LessonOpener.open(id);
	};

	$scope.defaultOffers = {
		"lifetime": {priceString: "$61.99", period: "Lifetime"},
		"monthly": {priceString: "$12.99", period: "monthly"}
	};

	function applyOfferings()
	{
		if($rootScope.offerings)
		{
			if($rootScope.offerings.availablePackages)
			{
				var availablePackages = $rootScope.offerings.availablePackages;
				_.each($rootScope.offerings.availablePackages, function(package)
				{
					if(package.packageType == 'MONTHLY' && package.product.priceString)
					{
						$scope.defaultOffers['monthly'].priceString = package.product.priceString;
					}

					if(package.packageType == 'LIFETIME' && package.product.priceString)
					{
						$scope.defaultOffers['lifetime'].priceString = package.product.priceString;
					}
				});
			}
		}
	}

	applyOfferings();

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		if(toState && toState.url != '/analyze')
		{
			return;
		}

		PortfolioTitle.stop();
		PortfolioTitle.start();
		updateCaseStudies();
		applyOfferings()
	});
})

;
