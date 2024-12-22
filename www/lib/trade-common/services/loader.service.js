angular.module('starter.trade')

.service('LoaderOverlay', function($ionicLoading, $rootScope, OnlineStatus, $timeout, UserConfig, $http)
{
	var pendingRequests = [];

	var loaderCheckInterval = null;

	var hideTimeout;

	var lottieId = 0;

	var isLoaderVisible = false;

    // todo - add a LoaderOverlay.setTpl function to allow injecting directly from the app
    var getTpl = function() {
        return '<lottie lottieid="loader_' + (++lottieId).toString() + '" path="lottie/loader.json" autoplay="true" loop="true"></lottie>'
	};

	var showLoader = function() {
		if (isLoaderVisible) {
			return;
		}

		isLoaderVisible = true;

		window.clearTimeout(hideTimeout);
		var tpl = getTpl();

		console.log('show loader', lottieId);

		$ionicLoading.show({
			'template': $rootScope.t(tpl),
			'noBackdrop': true
		});
	};

	var loaderPublicVar = {
		show: function(symbol, dataSource, type, period)
		{
			if (!type) {
				type = 'chart';
			}

			if(window.isGoforex && !window.localStorage.helpSeen || $rootScope.howToOpen)
			{
				return;
			}

			pendingRequests.push([symbol, dataSource, type, period]);

			loaderPublicVar.restore();
		},

		forceShow: function() {
			showLoader();
		},

		clearCompletedRequests: function() {
			pendingRequests = _.filter(pendingRequests, function(req) {
				var isLoading = req[1].isDataLoading(req[0], parseInt(req[3]));
				return isLoading;
			});

			var loaderElement = document.querySelector('.loading-container.visible.active .loading');
			if (loaderElement && pendingRequests.length) {
				// loaderElement.innerHTML = $rootScope.t(getTpl());

				var noBackdrop = !document.querySelector('.backdrop.visible.backdrop-loading.active');
				angular.element(loaderElement.parentElement)[noBackdrop ? 'addClass' : 'removeClass']('noBackdrop');
			}
		},

		isLoaderNeeded: function(forceType) {
			if(window.location.hash != '#/tab/play')
			{
				// loader not needed because not on play view
				return false;
			}

			var c = window.tradeController;
			if (!c) {
				return false;
			}

			var currentInstrument = c.currency;
			var charts = c.chartList;
			var chartInstance = charts[currentInstrument] ? charts[currentInstrument] : charts['inactive-' + currentInstrument];
			var currentType = forceType || 'candlestick';
			var period = chartInstance ? chartInstance.period : null;

			if (!currentType) {
				currentType = 'candlestick';
			}

			this.clearCompletedRequests();

			if (pendingRequests.length && _.find(pendingRequests, function(r) {
				var reqType = 'candlestick';
				return (r[2] == 'user') || ((reqType == currentType) && (r[0] == currentInstrument) && ((r[3] === undefined) || (parseInt(period) === parseInt(r[3]))));
			})) {
				return true;
			} else {
				return false;
			}
		},

		restore: function() {
			var self = this;

			// calling via timeout, otherwise the http request may not be started yet
			window.setTimeout(function () {
				self.clearCompletedRequests();

				if ((pendingRequests.length > 0) && OnlineStatus.is()) {
					if($ionicLoading._getLoader().$$state.status && window.location.hash == "#/tab/play")
					{
						if (self.isLoaderNeeded()) {
							showLoader();
						}

						// sometimes it doesn't show up right away, for example when re-entering the trade section, so doing this as a workaround for now
						$timeout(function() {
							self.clearCompletedRequests();

							if (self.isLoaderNeeded()) {
								showLoader();
							}
						}, 100);
					}

					window.clearInterval(loaderCheckInterval);
					loaderCheckInterval = window.setInterval(function() {
						self.clearCompletedRequests();

						if (!self.isLoaderNeeded()) {
							self.hide();
						}
					}, 250);
				}
			});
		},

		hide: function() {
			// return;
			window.clearInterval(loaderCheckInterval);
			loaderCheckInterval = null;
			window.clearTimeout(hideTimeout);
			hideTimeout = window.setTimeout(function () {
				console.log('HIDE loader');
				isLoaderVisible = false;
				$ionicLoading.hide();
			}, 250);
		}
	};

    OnlineStatus.addWatch(function(status)
    {
		if (status)
		{
			loaderPublicVar.restore();
		} else {
			loaderPublicVar.hide();
		}
	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		console.log(toState);
		if(toState && toState.url != '/play')
		{
			loaderPublicVar.hide();
		}
		else
		{
			loaderPublicVar.restore();
		}
	});

	return loaderPublicVar;
})