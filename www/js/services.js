angular.module('starter.services', [])

.factory('GameCats', function() {
  return {
    all: function() {
      return window.game[window.currentLang][0];
    },
    getTitle: function(id)
    {
    	var cats = window.game[window.currentLang][0];
    	for (var k = 0; k < cats.length; k++)
    	{
			if (cats[k].id == id)
			{
				return cats[k].title;
			}
		}
    },
    getQuestionCount: function(name)
    {
    	return window.game[window.currentLang][1][name].length;
    }
  };
})

.factory('Game', function(GameCats) {
  return {
    getQuestions: function(id) {
      var questions = angular.copy(window.game[window.currentLang][1][GameCats.getTitle(id)]);

      var iterations = 0;
      do
      {
      	  var imgCnt = 1 == id ? 2 : 0;
		  questions = _.shuffle(questions);
		  var quiz = questions.slice(0, 10);
		  for (var k = 0; k <= 9; k++)
		  {
			  if (quiz[k].image)
			  {
				  imgCnt++;
			  }
		  }

		  iterations++;
	  }
	  while ((imgCnt < 2) && (iterations < 10));

      // random answer order
      for (var k = 0; k <= 9; k++)
      {
      	var right = quiz[k].a[quiz[k].r];
      	quiz[k].a.sort( function() { return 0.5 - Math.random() } );
      	quiz[k].r = quiz[k].a.indexOf(right);
	  }

			return quiz;
    },

    registerScore: function(id, score) {
    	window.localStorage['score_' + id] = Math.max(window.localStorage['score_' + id] || 0, score * 10);
		}
  };
})

.factory('Lessons', function() {
  return {
    all: function() {
      var ret = {};
      var self = this;
      _.each(window.articleCategories, function(ids, index)
      {
		  ret[index] = [];
		  _.each(ids, function(id)
		  {
			  var article = self.get(id);
			  if (article)
			  {
				  ret[index].push(article);
			  }
		  });
		});

	  return ret;
    },

    get: function(id) {
      var article = _.filter(window.training[window.currentLang], function(article) { return article.id == id}).shift();
      if (!article && this.isUniversity(id))
      {
				article = _.filter(window.training.en[id], function(article) { return article.id == id}).shift();
	  	}

      return article;
    },

    isUniversity: function(id)
    {
		if(window.articleCategories && window.articleCategories[1])
		{
			return window.articleCategories[1].indexOf(id) > -1;
		}
		else
		{
			return false;
		}
	},

	isLast: function(id) {
		var objLen = Object.keys(window.articleCategories).length;
		for(var kys = 0; kys < objLen; kys++){
			var arrayLen = window.articleCategories[kys].length;
			var lastLessonId = window.articleCategories[kys][arrayLen - 1];
			if(id == lastLessonId)
				return true;
		}
    },

	isSocialTrading: function(id) {
		if(id == 3)
			return true;
    }
  };
})


.factory('RenderedLessons', function(Lessons, $rootScope, $compile) {
  var lastRender = null;
  var lastRenderID = null;

  return {
    render: function(id, onstart, oncomplete)
    {
		var lessons = Lessons.all();
		var cacheid = window.currentLang + '-' + id;

		if (lastRender && (lastRenderID == id))
		{
			return oncomplete();
		}

		var render = function()
		{
			var root = document.getElementById('lesson-cache');
			if(!Lessons.get(id))
			{
				return;
			}

			var text = Lessons.get(id).text;

			var width = document.body.offsetWidth - 26;

			_.each(window.imageSizes, function(size, image)
			{
				var coef = size[0] / width;
				text = text.split('src="' + image + '"').join('src="' + image + '" style="width: ' + Math.min(Math.round(size[0] / coef), size[0]) + 'px; height: ' + Math.min(Math.round(size[1] / coef), size[1]) + 'px;" ');
			});

			text = text.replace(/<img[^>]+src="img\/svg\/([^\"]+).svg"([^>]+)>/g, '<delayed-svg src="img/svg/$1.svg"></delayed-svg>', 'g');

			text = text.replace(/href="#\/tab\/play"/g, 'href="" ng-click="openTrading()"', 'g');

			$rootScope.lessontext = text;

			var html = $rootScope.$eval('lessontext');

			var div = document.createElement('div');
			root.appendChild(div);

			var element = angular.element(div);
			element.html(html);
			$compile(element.contents())($rootScope);
			lastRender = element;
			lastRenderID = id;

			if (oncomplete)
			{
				oncomplete();
			}

			return element;
		}

		//~ return render();

		return onstart(render);

		//~ return element;
	},

	clearCache: function()
	{
		lastRender = null;
		lastRenderID = null;
	},

	isRendered: function(id)
	{
		return lastRenderID == id;
	},

    get: function(id)
    {
		if (lastRenderID == id)
		{
			return lastRender;
		}
    }
  };
})

.service('TopSymbols', function() {

  var symbols = ['EURUSD', 'BTCUSD', 'USDJPY', 'OILUSD', 'GBPUSD', 'XAUUSD', 'USDCAD', 'ETHUSD', 'USDZAR', 'GOOUSD', 'AAPUSD', 'TSLUSD', 'XOMUSD', 'NKEUSD', 'DISUSD', 'HISTORY', 'NZDUSD', 'AUDJPY', 'USDCNH', 'AUDUSD', 'USDTRY', 'EURCHF', 'MSFUSD', 'XMIHKD', 'NFLUSD', 'SNAUSD', 'FBXUSD', 'SPOUSD', 'AMZUSD', 'COPUSD', 'GASUSD', 'PLAUSD', 'XAGUSD', 'NDQUSD', 'SPXUSD', 'GEREUR', 'EOSUSD', 'XMRUSD', 'XRPUSD', 'LTCUSD', 'NEOUSD', 'NESCHF', 'VOWEUR', 'FXXUSD', 'RDSUSD', 'CGCUSD', 'TLRUSD', 'CROUSD', 'BABUSD', 'DJIUSD', 'HSBUSD', 'SBXUSD'/*, 'FITUSD'*/, 'ASOGBP', 'TCTHKD', 'INTUSD', 'NVDUSD', 'AMDUSD', 'BYNUSD', 'BOAUSD', 'MCDUSD', 'UBRUSD', 'USDINR', 'VODINR', 'YESINR'/*, 'DHFINR'*/, 'RMCSAR', 'ADAUSD', 'ADIEUR', 'AIRUSD', 'BCHUSD', /*'COCUSD',*/ 'COLUSD', 'COTUSD', /*'DAIEUR',*/ 'DSHUSD', 'EURGBP', 'EURJPY', 'FTSGBP', 'GBPJPY', 'GSAUSD', 'IOTUSD', 'JDXUSD', 'JNJUSD', 'MASUSD', 'PLDUSD', 'SAMKRW', 'STLUSD', 'SUGUSD', 'TEZUSD', 'TOYUSD', 'TROUSD', 'USDCHF', 'VISUSD', 'WHEUSD', 'ZOMUSD', 'COIUSD', 'DOGUSD', 'MANUSD', 'SHIUSD', 'BNBUSD', 'AVAUSD', 'DOTUSD', 'SOLUSD', 'LUNUSD', 'MATUSD', 'CPTUSD', 'HISTORY'];

  return {
	get: function()
	{
		return symbols;
	},

	getIndex: function(symbol)
	{
		return symbols.indexOf(symbol)
	}
  }
})

.service('QuizCountdown', function($interval) {

  var countdownStart = null;
  var countdownInterval = null;
  var $scope = null;
  var timeLimit = 15000;
  var countDownPct = 0;

  var startCountdown = function()
  {
	countdownStart = Date.now();
	stopCountdown();
	countdownInterval = $interval(function()
	{
		countDownPct = ((Date.now() - countdownStart) / timeLimit) * 100;
		if (countDownPct >= 100)
		{
			stopCountdown();
			if ($scope.countdownTimeout)
			{
				$scope.countdownTimeout();
			}
		}
	}, 50, 0, false);
  };

  var stopCountdown = function()
  {
	$interval.cancel(countdownInterval);
  };

  return {
	setScope: function(scope)
	{
		$scope = scope;
	},

	getPct: function()
	{
		return countDownPct;
	},

	setTimeLimit: function(limit)
	{
		timeLimit = limit;
	},

	start: function()
	{
		startCountdown();
	},

	stop: function(symbol)
	{
		stopCountdown();
	}
  }
})

.service('SectionLock', function($rootScope, $ionicPopup, Lessons, LessonOpener, $ionicViewSwitcher, $state, MarketStatus, Mongo)
{
    var isLegacyUser = window.localStorage.isLegacyUser;

    var user = null;

    var alertPopup = null;

	$rootScope.learn = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.lessons');
		alertPopup.close();
	};

	$rootScope.play = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.game');
		alertPopup.close();
	};

	Mongo.get(function(u)
	{
		user = u;
	});

    return {
		ready: function(callback)
		{
			Mongo.get(function(u)
			{
				user = u;
				isLegacyUser = u.wins || u.losses || u.positions;
				window.localStorage.isLegacyUser = isLegacyUser;
				callback();
			});
		},

		reset: function()
		{
			Mongo.get(function(u)
			{
				user = u;
			});
		},

		getAnsweredQuiz: function()
		{
			return parseInt(window.localStorage.answeredQuiz || 0);
		},

		isQuizLocked: function()
		{
			return false;
		},

		isUniversityLocked: function()
		{
			return false;

			var isLocked = false;
			_.each(window.articleCategories[0], function(id)
			{
				if (!this.isCompletedLesson(id))
				{
					isLocked = true;
				}
			});

			return isLocked;
		},

		isStocksLocked: function()
		{
			return !this.isCompletedLesson(12);
		},

		isOilLocked: function()
		{
			return !this.isCompletedLesson(14);
		},

		isGoldLocked: function()
		{
			return !this.isCompletedLesson(13);
		},

		isCandleLocked: function()
		{
			return !this.isCompletedLesson(11);
		},

		isBitcoinLocked: function()
		{
			return MarketStatus.isForexOpen() && !this.isCompletedLesson(15);
		},

		isLeverageLocked: function()
		{
			return !this.isCompletedLesson(16);
		},

		isCompletedLesson: function(id)
		{
			return $rootScope.getLocalStorage('completedLessons', id)/* || (user && user.completedLessons && user.completedLessons[id])*/;
		},

		showPopup: function(title, id)
		{
			var lesson = Lessons.get(id);
			alertPopup = $ionicPopup.alert({
				title: title,
				scope: $rootScope,
				cssClass: 'tradeAlert tradeLocked sectionLock',
				buttons: [{ text: $rootScope.t('Read'), type: 'button-stable', onTap: function() { LessonOpener.open(id); } }, { text: $rootScope.t('Close'), type: 'button-balanced' }],
				template: '<div class="popup-lock"><img src="img/lock.png" /></div>' + $rootScope.t('To unlock this feature please read and complete the lesson:') + '<br>' + lesson.title
			});

			return alertPopup;
		}
    };
})

.service('UserTop', function()
{
    var ref = firebase.database().ref('top');

    return {
		get: function(index, callback)
		{
		  ref.child(index).once('value', function(snap)
		  {
			callback(snap.val());
		  });
		}
    };
})

.service('LessonOpener', function(RenderedLessons, Lessons, $ionicLoading, $timeout, $state, $ionicViewSwitcher, $rootScope, $location, LoaderOverlay)
{
    var last = 0;

    return {
		open: function(id, hash)
		{
			last = id;
			RenderedLessons.render(id, function(render) {
				// if($ionicLoading._getLoader().$$state.status)
				// {
					// LoaderOverlay.forceShow();
				// }
				$timeout.cancel(renderT);
				var renderT = $timeout(function()
				{
					render();
				}, 20);
			  },
			  function() {

				$ionicViewSwitcher.nextDirection("enter");

				var stateOpts = {};
				var key = '#/tab/lessons/';
				if (key == window.location.hash.substr(0, key.length))
				{
					stateOpts.location = 'replace';
					if(hash)
					{
						stateOpts.hash = hash;
					}
				}

				$state.go('tab.lessons-read', {lessonId: id}, stateOpts).then(function()
				{
					if(hash)
					{
						$location.hash(hash);
					}
				});

			  });

			return true;
		},

		getLast: function()
		{
			return last;
		}
    };
})

.factory('$ImageCacheFactory', ['$q', function($q) {
    return {
        Cache: function(urls) {
            if (!(urls instanceof Array))
                return $q.reject('Input is not an array');

            var promises = [];

            for (var i = 0; i < urls.length; i++) {
                var deferred = $q.defer();
                var img = new Image();

                img.onload = (function(deferred) {
                    return function(){
                        deferred.resolve();
                    }
                })(deferred);

                img.onerror = (function(deferred,url) {
                    return function(){
                        deferred.reject(url);
                    }
                })(deferred,urls[i]);

                promises.push(deferred.promise);
                img.src = urls[i];
            }

            return $q.all(promises);
        }
    }
}])

.filter('toArray', function () {
  return function (obj, addKey) {
    if (!angular.isObject(obj)) return obj;
    if ( addKey === false ) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    } else {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      });
    }
  };
})

.service('CoinGame', function(Mongo, $ionicPopup, $rootScope, VMin)
{
	var currentCtrl = 'Lessons';

	return {
		initCoinGame: function(Ctrl)
		{
			var firstCoin = false;
			if(!window.localStorage["coinGameFirstCoinLesson"] && Ctrl == 'Lessons')
			{
				firstCoin = true;
			}

			if(!window.localStorage["coinGameFirstCoinQuiz"] && Ctrl == 'Quiz')
			{
				firstCoin = true;
			}

			if(!window.localStorage["coinGameFirstCoinDash"] && Ctrl == 'Dash')
			{
				firstCoin = true;
			}

			currentCtrl = Ctrl;
			collectableCoinLimit = 20;
			collectedCoins = 0;
			if(window.localStorage["collectedCoinsCount"])
			{
				collectedCoins = window.localStorage["collectedCoinsCount"];
			}
			if(collectedCoins >= collectableCoinLimit)
			{
				return;
			}

			if(document.querySelector('#lessonContainer') && document.querySelector('.lesson-header'))
			{
				var lessonHeight = document.querySelector('#lessonContainer').offsetHeight;
				var lessonWidth = document.querySelector('#lessonContainer').offsetWidth;
				var headerHeight = document.querySelector('.lesson-header').offsetHeight;
			}
			else if(document.querySelector('.question-outer-container'))
			{
				var lessonHeight = document.querySelector('.question-outer-container').offsetHeight;
				var lessonWidth = document.querySelector('.question-outer-container').offsetWidth;
				var headerHeight = 0;
			}
			else
			{
				var lessonHeight = document.querySelector('#home-view').offsetHeight - 60;
				var lessonWidth = document.querySelector('#home-view').offsetWidth;
				var headerHeight = 40;
			}

			var chanceForCoin = 250;
			if(Ctrl == 'Dash')
			{
				var chanceForCoin = 0;
			}

			if(!window.localStorage["coinGameFirstCoinLesson"] && currentCtrl == "Lessons")
			{
				var chanceForCoin = 1000;
			}

			if(!window.localStorage["coinGameFirstCoinQuiz"] && currentCtrl == "Quiz")
			{
				var chanceForCoin = 1000;
			}

			if(!window.localStorage["coinGameFirstCoinDash"] && Ctrl == 'Dash')
			{
				var chanceForCoin = 1000;
			}

			if(!$rootScope.settings || !$rootScope.settings.coinGame)
			{
				var chanceForCoin = 0;
			}

			roll = Math.floor(Math.random() * 1000);

			if(firstCoin || roll < chanceForCoin)
			{
				var randomPosY = Math.floor(Math.random() * (lessonHeight - VMin(10)));
				var randomPosX = Math.floor(Math.random() * (lessonWidth - VMin(20))) + VMin(1.2);
				this.drawCoin(randomPosY + headerHeight, randomPosX);
			}
		},

		drawCoin: function(posY, posX)
		{
			if(document.querySelector('.outer-free-money'))
			{
				return;
			}

			var outerEl = document.createElement("div");
			outerEl.classList.add('outer-free-money');
			outerEl.style.width = "20vmin";
			outerEl.style.height = "20vmin";
			outerEl.style.display = 'inline-block';
			outerEl.style.zIndex = "9999999";
			outerEl.style.pointerEvents = "auto";
			outerEl.style.position = 'absolute';
			outerEl.style.top = posY + 'px';
			outerEl.style.left = posX + 'px';

			var el1 = document.createElement("object");
			el1.setAttribute('type', 'image/svg+xml');
			el1.setAttribute('data', 'img/svg/cash-little-motion.svg');
			el1.classList.add('free-money-motion');
			el1.style.pointerEvents = "none";
			el1.style.visibility = "visible";
			el1.style.position = "absolute";

			var el2 = document.createElement("object");
			el2.setAttribute('type', 'image/svg+xml');
			el2.setAttribute('data', 'img/svg/puff-money.svg');
			el2.classList.add('free-money-puff');
			el2.style.pointerEvents = "none";
			el2.style.visibility = "hidden";
			el2.style.position = "absolute";

			var self = this;

			outerEl.addEventListener('click', handler = function(e)
			{
				el1.style.visibility = "hidden";
				el2.style.visibility = "visible";
				var animateElements = document.querySelector('.free-money-puff').contentDocument.rootElement.querySelectorAll('animate');
				for(var i = 0; i < animateElements.length; i++)
				{
					document.querySelector('.free-money-puff').contentDocument.rootElement.querySelectorAll('animate')[i].beginElement();
				}
				self.collectCoin();

				window.removeEventListener('click', handler);
				outerEl.remove();
			}, false);

			outerEl.appendChild(el1);
			outerEl.appendChild(el2);
			if(currentCtrl == 'Lessons')
			{
				document.querySelector('#lessonContainer').appendChild(outerEl);
			}
			else if(currentCtrl == 'Quiz')
			{
				document.querySelector('.question-outer-container').appendChild(outerEl);
			}
			else if(currentCtrl == 'Dash')
			{
				document.querySelector('#home-view').appendChild(outerEl);
			}
		},

		collectCoin: function()
		{
			if(!window.localStorage["coinGameFirstCoinLesson"] && currentCtrl == 'Lessons')
			{
				window.localStorage["coinGameFirstCoinLesson"] = true;
			}
			if(!window.localStorage["coinGameFirstCoinQuiz"] && currentCtrl == 'Quiz')
			{
				window.localStorage["coinGameFirstCoinQuiz"] = true;
			}
			if(!window.localStorage["coinGameFirstCoinDash"] && currentCtrl == 'Dash')
			{
				window.localStorage["coinGameFirstCoinDash"] = true;
			}

			PlaySound('gettin-money-sound');
			Mongo.addBonus(50);
			window.clearTimeout(collectT);
			var collectT = window.setTimeout(function()
			{
				if(document.querySelector('.outer-free-money'))
				{
					if(window.localStorage["collectedCoinsCount"])
					{
						var collectedCoins = window.localStorage["collectedCoinsCount"];
					}
					else
					{
						var collectedCoins = 0;
					}

					collectedCoins++;
					window.localStorage["collectedCoinsCount"] = collectedCoins;

					document.querySelector('.outer-free-money').remove();
				}
			}, 100);
		},

		deleteCoin: function(className)
		{
			if(!className)
			{
				var className = 'outer-free-money';
			}

			if(document.querySelector('.' + className))
			{
				document.querySelector('.' + className).remove();
			}
		}
	}
})

.service('IonicClosePopupService', [
	function () {
		var currentPopup;
		var htmlEl = angular.element(document.querySelector('html'));
		htmlEl.on('click', function (event) {
			if (event.target.nodeName === 'HTML') {
				if (currentPopup) {
					currentPopup.close();
				}
			}
		});

		this.register = function (popup) {
			currentPopup = popup;
		}
	}
])

;
