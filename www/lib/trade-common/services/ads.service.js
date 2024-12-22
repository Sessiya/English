angular.module('starter.trade')

.service('Ads', function($ionicPopup, $rootScope, OnlineStatus) {

	var adReady;
	var adCallback;
	var AppLovinMAX;

	document.addEventListener("deviceready", function() {
		if (!window.cordova) {
			return;
		}

		try {
			AppLovinMAX = cordova.require('cordova-plugin-applovin-max.AppLovinMAX');

			AppLovinMAX.initialize("IdituEpD1JTZBWyNOWEx4I1DDKO6qJteo7bbKbFvL9GU3wCK4eqJMbD56SNAb62OcaHspTxcTh9GqyVJWlXD3x", function (configuration) {
				window.setTimeout(function()
				{
					initializeInterstitialAds();
				}, 2000);
			});	
		} catch(e)
		{
			console.log('maybe applovin plugin not installed', e);
		}
	}, true);

	var INTER_AD_UNIT_ID;
	if (window.cordova && window.cordova.platformId.toUpperCase() === 'IOS') {
		INTER_AD_UNIT_ID = 'c3feeed053da0c06';
	} else {
		// Assume Android
		INTER_AD_UNIT_ID = '9978a0eaecc4a503';
	}

	var retryAttempt = 0;

	function initializeInterstitialAds()
	{
		window.addEventListener('OnInterstitialLoadedEvent', function (adInfo) {
			// Interstitial ad is ready to be shown. AppLovinMAX.isInterstitialReady(INTER_AD_UNIT_ID) will now return 'true'

			// Reset retry attempt
			retryAttempt = 0;
		});

		window.addEventListener('OnInterstitialLoadFailedEvent', function (adInfo) {
			// Interstitial ad failed to load
			// We recommend retrying with exponentially higher delays up to a maximum delay (in this case 64 seconds)

			retryAttempt++;
			var retryDelay = Math.pow(2, Math.min(6, retryAttempt));

			console.log('Interstitial ad failed to load - retrying in ' + retryDelay + 's');

			setTimeout(function() {
				loadInterstitial();
			}, retryDelay * 1000);
		});

		window.addEventListener('OnInterstitialClickedEvent', function (adInfo)
		{
		});

		window.addEventListener('OnInterstitialDisplayedEvent', function (adInfo)
		{
		});

		window.addEventListener('OnInterstitialAdFailedToDisplayEvent', function (adInfo) {
			// Interstitial ad failed to display. We recommend loading the next ad
			loadInterstitial();
		});

		window.addEventListener('OnInterstitialHiddenEvent', function (adInfo) {
			OnlineStatus.setAdState(false);

			if(adCallback)
			{
				adCallback();
			}

			loadInterstitial();
		});

		// Load the first interstitial
		loadInterstitial();
	}

	function loadInterstitial()
	{
		AppLovinMAX.loadInterstitial(INTER_AD_UNIT_ID);

		window.setTimeout(function()
		{
			if (!AppLovinMAX.isInterstitialReady(INTER_AD_UNIT_ID))
			{
				console.log('try loading ad again');
				loadInterstitial()
			}
		}, 2000);
	}

	function displayAd()
	{
		if(!AppLovinMAX)
		{
			console.log('no AppLovinMax, skip ad');
			if(adCallback)
			{
				adCallback();
			}

			return;
		}

		if (AppLovinMAX.isInterstitialReady(INTER_AD_UNIT_ID))
		{
			AppLovinMAX.showInterstitial(INTER_AD_UNIT_ID);
		}
		else
		{
			loadInterstitial();

			// seems to not load ad sometimes and not triggering OnInterstitialAdFailedToDisplayEvent
			window.setTimeout(function()
			{
				displayAd()
			}, 5000);
		}
	}

	// probably using AppLovin as it can integrate AdMob aswell
	// let interstitial;

	// function loadAd(show)
	// {
	// 	adReady = false;

	// 	document.addEventListener('deviceready', async () => {
	// 		interstitial = new admob.InterstitialAd({
	// 			adUnitId: 'ca-app-pub-3360690725865389/1652434038',
	// 		})

	// 		window.ad = interstitial;

	// 		interstitial.on('load', (evt) => {
	// 			// evt.ad
	// 			adReady = true;

	// 			if(show)
	// 			{
	// 				displayAd();
	// 			}
	// 		})

	// 		await interstitial.load();
	// 	}, false);

	// 	document.addEventListener('admob.ad.dismiss', async () => {
	// 		OnlineStatus.setAdState(false);
	// 		// Once a interstitial ad is shown, it cannot be shown again.
	// 		// Starts loading the next interstitial ad as soon as it is dismissed.
	// 		await interstitial.load();

	// 		if(adCallback)
	// 		{
	// 			adCallback();
	// 		}
	// 		else
	// 		{
	// 			console.log('no ad callback', adCallback);
	// 		}
	// 	});
	// };

	// function displayAd()
	// {
	// 	if(adReady)
	// 	{
	// 		interstitial.show();
	// 	}
	// 	else
	// 	{
	// 		loadAd(true);
	// 	}
	// };

	// loadAd();

	return {
		show: function(type, callback)
		{
			if(callback)
			{
				adCallback = callback;
			}

			var showAds = function() {
				OnlineStatus.setAdState(true);
				displayAd();
			};

			if(type == 'undo')
			{
				if (!!window.localStorage.getItem('undoPopupSeen')) {
					showAds();
				} else {
					var iPopup = $ionicPopup.confirm({
						title: '',
						cssClass: 'popup-confirm ads-confirm',
						template: '<div class="row"><div class="col"><h2>' + $rootScope.t('Cancel Trade') + '</h2></div></div><p>' + $rootScope.t('Cancel trade is limited to 1x per 24h. After opening a trade you will have 1h to reverse it. Watch a quick 30-second AD to enable it.') + '</p>',
						buttons: [
							{
								text: $rootScope.t('I Understand'),
								onTap: function(e)
								{
									// todo - show ad here
									return 'confirm';
								},
								type: 'button-positive'
							},
							{
								text: '',
								onTap: function(e)
								{
									iPopup.close();
								},
								type: 'button-cancel'
							}
						]
					})

					iPopup.then(function(res) {
						if ('confirm' == res) {
							window.localStorage.setItem('undoPopupSeen', Date.now().toString());
							showAds();
						}
					});
				}
			}
			else if(type == 'regular')
			{
				if (!!window.localStorage.getItem('adsPopupSeen')) {
					showAds();
				} else {
					var iPopup = $ionicPopup.confirm({
						title: '',
						cssClass: 'popup-confirm ads-confirm',
						template: '<div class="row"><div class="col-30"><img src="img/video-ads-single.svg" /></div><div class="col-70"><h2>' + $rootScope.t('Video Ads!') + '</h2></div></div><p>' + $rootScope.t('This feature is limited to PRO members, but hey, if you watch a quick 30-second AD to support our app, we\'ll give you a pass.') + '</p>',
						buttons: [
							{
								text: $rootScope.t('I Understand'),
								onTap: function(e)
								{
									// todo - show ad here
									return 'confirm';
								},
								type: 'button-positive'
							},
							{
								text: '',
								onTap: function(e)
								{
									iPopup.close();
								},
								type: 'button-cancel'
							}
						]
					})

					iPopup.then(function(res) {
						if ('confirm' == res) {
							window.localStorage.setItem('adsPopupSeen', Date.now().toString());
							showAds();
						}
					});
				}
			}
			else
			{
				showAds();
			}
		}
	}
});
