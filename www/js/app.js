debugpoint('app.js');

window.defLang = 'en';
window.isDetailedChart = false;
window.isOtherApp = false;
window.currentAppVersion = '3.98';
window.isGoforex = true;
// window.isAppTest = true;

document.addEventListener('DOMContentLoaded', function(event) {
	if(!window.usingCordova)
	{
		window.device = {};
		window.setTimeout(function() {
			var e = document.createEvent('Events');
			e.initEvent("deviceready", true, false);
			document.dispatchEvent(e);
		}, 1000)
	}
})

if (window.isAppTest)
{
	window.localStorage.clear();
}

if (window.location.hash && window.location.hash.length == 3)
{
	window.defLang = window.location.hash.substr(1, 3);
	window.localStorage.language = window.defLang;
	window.skipLangupdate = true;
}

window.currentLang = window.localStorage.language || window.defLang;

document.addEventListener("deviceready", function(){
	window.device.isReady = true;

	if(navigator && navigator.userAgent)
	{
		if (navigator.userAgent.indexOf('Windows Phone') > -1) {
			window.device.platformManual = "Windows Phone";
		} else if (navigator.userAgent.indexOf('Android') > 0) {
			window.device.platformManual = "Android";
		} else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
			window.device.platformManual = "iOS";
		} else {
			window.device.platformManual = "Android";
			// window.device.platformManual = navigator.platform && navigator.platform.toLowerCase().split(' ')[0] || '';
		}
	}

	if (!window.localStorage.language)
	{
		// English as default for now
		window.localStorage.language = window.defLang; return;
	}
}, true);

angular.module('ngHtmlCompile', []).
directive('ngHtmlCompile', function($compile) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			scope.$watch(attrs.ngHtmlCompile, function(newValue, oldValue) {
				element.html(newValue);
				$compile(element.contents())(scope);
			});
		}
	}
});

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.trade', 'starter.controllers', 'starter.services', 'starter.directives', 'tiim', 'uiSlider', 'ngHtmlCompile', 'ngIOS9UIWebViewPatch', 'firebase', 'ngCordova', 'angular.bind.notifier'])

.constant('Endpoint', window.appConfig.cloudFunctionsUrl)

.config(['$compileProvider', function ($compileProvider) {

	$compileProvider.debugInfoEnabled(false);

	// fix "Failed to load webpage with error: unsupported URL"
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sms|tel|geo|ftp|mailto|file|ghttps?|ms-appx-web|ms-appx|x-wmapp0|ionic):|https|http|app/);
	// sanitize the images to open ionic://localhost/ on iOS
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|content|blob|ms-appx|ms-appx-web|x-wmapp0|ionic):|https|http|app|data:image\//);

	var config = window.appConfig.firebaseConfig;

	firebase.initializeApp(config);

	//~ var dataConfig = {
		//~ apiKey: "AIzaSyA8Uxz2-3Qf_6i-ZLkC-U4d2Xj_c9NXiic",
		//~ authDomain: "fxdata-7a73e.firebaseapp.com",
		//~ databaseURL: "https://fxdata-7a73e.firebaseio.com",
		//~ projectId: "fxdata-7a73e",
		//~ storageBucket: "fxdata-7a73e.appspot.com",
		//~ messagingSenderId: "723376699650"
	//~ };

	var dataConfig = {
		apiKey: "AIzaSyDIesK78ECwORWZqbP-fM7RFozR4i2ZH3s",
		authDomain: "datatest-146a3.firebaseapp.com",
		databaseURL: "https://datatest-146a3.firebaseio.com",
		projectId: "datatest-146a3",
		storageBucket: "",
		messagingSenderId: "260842185080"
	};

	// dedicated server tests
	// var dataConfig = {
	// 	apiKey: "AIzaSyCbw_kGeDJ1PsPkaG07fy2iMdv7VPVKMyY",
	// 	authDomain: "dedidata-af9e4.firebaseapp.com",
	// 	databaseURL: "https://dedidata-af9e4.firebaseio.com",
	// 	projectId: "dedidata-af9e4",
	// 	storageBucket: "dedidata-af9e4.appspot.com",
	// 	messagingSenderId: "741335402884"
	//   };

	firebase.initializeApp(dataConfig, 'charts');
	firebase.setLogLevel("debug");

}])

.decorator("$xhrFactory", [
	"$delegate", "$injector",
	function($delegate, $injector) {
		window.setTimeout(function() {
			var $http = $injector.get("$http");
			$http.isLoading = function(url) {
				var pending = $http.pendingRequests;
				for (var k = 0; k < pending.length; k++) {
					if (pending[k].url.indexOf(url) > -1) {
						return true;
					}
				}
			};

			$http.progress = {};
		});

		return function(method, url) {
			var $http = $injector.get("$http");
			var xhr = $delegate(method, url);
			var callConfig = $http.pendingRequests[$http.pendingRequests.length - 1];
			callConfig.xhr = xhr;

			xhr.addEventListener("progress", function(event) {
				var p = (event.loaded/event.total) * 100;

				if (!$http || !$http.progress) {
					return;
				}

				$http.progress[url] = p;

				var keys = Object.keys($http.progress);
				for (var k = 0; k < keys.length; k++) {
					if ($http.progress[keys[k]] == 100) {
						delete $http.progress[keys[k]];
					}
				}

				if (callConfig.onProgress) {
					callConfig.onProgress(event);
				}
			});

			var finish = function(event) {
				if ($http && $http.progress) {
					delete $http.progress[url];
				}
			};

			xhr.addEventListener('loadend', finish);
			xhr.addEventListener('error', finish);
			xhr.addEventListener('abort', finish);

			return xhr;
		};
	}
])

.run(function($ionicPlatform, $http, $templateCache, $timeout, $state, $ionicHistory, $rootScope, SymbolData, ChartCache, ChartData, LessonOpener, $ionicViewSwitcher, LoaderOverlay) {

	window.rootScope = $rootScope;

	document.addEventListener('deviceready', function() {

		window.setTimeout(function() {
			var splash = document.getElementById('splash');
			if (splash) {
				splash.className = 'splash-remove';

				window.setTimeout(function() {
					splash.parentNode.removeChild(splash);
				}, window.localStorage.getItem('d2') || 1000);
			}

			if (navigator.splashscreen)
			{
				navigator.splashscreen.hide();
			}
		}, window.localStorage.getItem('d1') || 1500);

		// V1 with vector drawable splash
		// window.setTimeout(function() {
		// 	var splash = document.getElementById('splash');
		// 	if (splash) {
		// 		splash.className = 'splash-remove';
		// 		window.setTimeout(function() {
		// 			splash.parentNode.removeChild(splash);
		// 		}, window.localStorage.getItem('d2') || 1500);
		// 	}

		// 	if (navigator.splashscreen)
		// 	{
		// 		angular.element(document).ready(function(){
		// 			navigator.splashscreen.hide();
		// 		});
		// 	}
		// }, window.localStorage.getItem('d1') || 2500);

		var connectedRef = firebase.database().ref(".info/connected");
		connectedRef.on("value", function(snap) {
			if (snap.val() === true) {
				let response = snap.val();
				console.log("fb connected", response);
				window.localStorage.firebaseConnected = true;
			} else {
				console.log("fb not connected");
				window.localStorage.firebaseConnected = false;
			}
		});

		if(typeof FirebasePlugin != "undefined")
		{
			FirebasePlugin.onMessageReceived(function(message) {
				if(message && message.redirect)
				{
					if(message.tap){
						$state.go('tab.' + message.redirect);
						if(message.tap == "background")
						{
							$timeout(function()
							{
								if(message.redirect == 'dash')
								{
									document.getElementsByTagName('ion-nav-bar')[0].className = 'home';
								}
								else if(message.redirect == 'play')
								{
									document.getElementsByTagName('ion-nav-bar')[0].className = 'play';
								}
							}, 500);
						}

						if(message.key)
						{
							$rootScope.$broadcast('force-show-alert', message.key);
							window.localStorage.forceShowAlert = message.key;
						}

						if(message.notification_title == 'ANSWER')
						{
							$timeout(function()
							{
								$rootScope.$broadcast('show-alert');
							}, 1000);
						}
					}
					else
					{
						$timeout(function()
						{
							$rootScope.$broadcast('show-alert');
						}, 200);
					}
				}
				else if(message)
				{
					$rootScope.$broadcast('show-alert');
				}
			}, function(error) {

			    console.error(error);
			});
		}

		if (window.AndroidNotch) {
	        const style = document.documentElement.style;

			window.AndroidNotch.getInsetTop(function(result) {
		      var notchSize = result;
		      style.setProperty("--notch-inset-top", notchSize + "px")
		    });
		}

		// testing ios
		// if(!(window.navigator.platform == 'iPhone' || window.navigator.platform == 'Android'))
		// {
		// 	const style = document.documentElement.style;
		// 	style.setProperty("--notch-inset-top", 30 + "px")
		// 	window.device.platformManual = 'iOS';
		// }

		if(!window.localStorage.timesAppOpened)
		{
			window.localStorage.timesAppOpened = 1;
		}

		if(window.localStorage.timesAppOpened)
		{
			window.localStorage.timesAppOpened++;
		}

		/*

		window.plugins.webintent.getUri(function (uri, asd) {
		    if (uri !== '') {
		    	console.log(uri);
		    	console.log(asd);
		        // `uri` is the uri the intent was launched with.
		        //
		        // If this is the first run after the app was installed via a link with an install referrer
		        // (e.g. https://play.google.com/store/apps/details?id=com.example.app&referrer=referrer.com)
		        // then the Play Store will have fired an INSTALL_REFERRER intent that this plugin handles,
		        // and `uri` will contain the referrer value ("referrer.com" in the example above).
		        // ref: https://help.tune.com/marketing-console/how-google-play-install-referrer-works/
		    }
		});

		window.plugins.webintent.getExtra(WebIntent.EXTRA_TEXT,
		    function(url) {
		    	console.log(url);
		        // url is the value of EXTRA_TEXT
		    }, function() {
		    	console.log('no extra');
		        // There was no extra supplied.
		    }
		);

		*/

		SymbolData.setDelay(15);

		$rootScope.isIOS = window.device.platform == 'iOS' ? true : false;

		// GA
		// this should be done via firebase integrations linking..
		if (window.analytics && 0)
		{
			window.analytics.startTrackerWithId('UA-90817823-1');
			window.analytics.addCustomDimension(1, window.currentLang);

			if (window.device)
			{
				window.analytics.setUserId(window.device.uuid);
			}
		}

		// Appsflyer
		if (window.plugins && window.plugins.appsFlyer)
		{
			var args = {
				devKey: 'hJRjMduczkTKjRDTYZnsKR',
				isDebug: true,
				appId: '915926888',
				onInstallConversionDataListener: true,
				onDeepLinkListener: true
			};

			var userAgent = window.navigator.userAgent.toLowerCase();
			if (/iphone|ipad|ipod/.test( userAgent )) {
				args.appId = "915926888";            // your ios app id in app stores
				args.waitForATTUserAuthorization = 10;
			}

			// whenever branded domain gets added
			// returns Success, but not changing generateInviteLink to pro.goforex.app yet. not sure appsflyer fault or not
			var appsflyerDomains = ["pro.goforex.app"];
			window.plugins.appsFlyer.setOneLinkCustomDomains(appsflyerDomains, function(success)
			{
				console.log('success setting branded domain', success);
			}, function(error)
			{
				console.log('error setting branded domain', error);
			});

			window.plugins.appsFlyer.registerDeepLink(function(res) {
				// alert(res);
				if(typeof res === 'string' || res instanceof String)
				{
					res = JSON.parse(res);
				}

				if(res && res.status == 'success')
				{
					// candle stick pattern lekcija lesson-26
					// chart pattern lekcija lesson-25
					// zinju arhivs mission
					// top brokeri top
					// trading simulators play

					if(res.data && res.data.deep_link_value)
					{
						if(['lessons', 'play', 'top', 'usertop', 'pro', 'mission', 'account'].indexOf(res.data.deep_link_value) > -1)
						{
							var targetRoute = 'tab.' + res.data.deep_link_value;
							// alert('go to this ' + targetRoute);
							$state.go(targetRoute);
						}

						if(res.data.deep_link_value.startsWith('lesson-'))
						{
							var lessonId = res.data.deep_link_value.substring('lesson-'.length);
							// alert('try to open lesson with id ' + lessonId);
							LessonOpener.open(lessonId);
						}
					}
				}

				if(res && res.data)
				{
					if(res.data.deep_link_value == "link_retargeting_AKSL" || res.data.deep_link_value == "link_retargeting_LRA")
					// alert(JSON.stringify(res.data));
					// console.log('res.data', res.data);
					if(res.data.deep_link_value)
					{
						window.localStorage.linkRetargetingSource = res.data.deep_link_value;
					}
				}

				if(res && res.status == 'success' && res.data && res.data.campaign && res.data.campaign == 'User_invite')
				{
					if(res.data.inviteeUuid && res.data.inviteVerification)
					{
						$rootScope.$broadcast('user-invited', res.data.inviteeUuid, res.data.inviteVerification);
					}
				}

				return;
			});

			window.plugins.appsFlyer.initSdk(args, function(res) {
				// console.log('initSdk res', res);

				if(typeof res === 'string' || res instanceof String)
				{
					res = JSON.parse(res);
				}

				// appsflyer documentation bad, deeplink on install with full data gets returned here..
				// ..atleast if the link is generated in app for user invites
				// leaving the same above anyway, just in case
				if(res && res.status == 'success' && res.data && res.data.campaign && res.data.campaign == 'User_invite')
				{
					if(res.data.inviteeUuid && res.data.inviteVerification)
					{
						$rootScope.$broadcast('user-invited', res.data.inviteeUuid, res.data.inviteVerification);
					}
				}
			}, function(err) {
				console.log('error initSdk', err);
			});

			if (window.device)
			{
				window.plugins.appsFlyer.setAppUserId(window.device.uuid);
			}

			window.plugins.appsFlyer.getAppsFlyerUID(function(id) {
				firebase.database().ref('appsflyer').child(id).set(window.device.uuid);
			});
		}
		else
		{
			console.log('no window.plugins.appsFlyer. Means deeplinks/invite wont work!!!');
		}

		if(window.localStorage.isUserPro && window.localStorage.isUserPro == 'true')
		{
			// console.log('localStorage setting pro status');
			if(window.localStorage.isUserProSubscription)
			{
				$rootScope.isUserPro = true;
				$rootScope.setProStatus(true, true);
			}
			else
			{
				$rootScope.setProStatus(true);
			}
		}

		function isProActive(info)
		{
			if(parseInt(window.localStorage.friendsInvited) >= 3)
			{
				return 'true-friends';
			}

			var e = info.entitlements;
			console.log('Entitlements', e);
			if (e && e.active && e.active['Pro Access']) {
				console.log('is pro active?', e.active['Pro Access'].isActive);
				return e.active['Pro Access'].isActive;
			}

			return false;
		}

		// function isProActive(info)
		// {
		// 	var purchaseDates = info.allPurchaseDatesMillis;
		// 	var purchaseExpirationDates = info.allExpirationDatesMillis;

		// 	if(purchaseDates['prolifetime'])
		// 	{
		// 		purchaseDates['lifetime'] = purchaseDates['prolifetime'];
		// 		purchaseExpirationDates['lifetime'] = purchaseExpirationDates['prolifetime'];
		// 	}

		// 	if(window.cordova.platformId === 'ios' && purchaseDates['monthlysub'])
		// 	{
		// 		purchaseDates['monthly'] = purchaseDates['monthlysub'];
		// 		purchaseExpirationDates['monthly'] = purchaseExpirationDates['monthlysub'];
		// 	}
		// 	else if(purchaseDates['prosub'])
		// 	{
		// 		purchaseDates['monthly'] = purchaseDates['prosub'];
		// 		purchaseExpirationDates['monthly'] = purchaseExpirationDates['prosub'];
		// 	}

		// 	var shouldProBeActive = false;
		// 	var isMonthly = false;
		// 	var isLifetime = false;

		// 	if(purchaseDates['lifetime'] && (purchaseExpirationDates['lifetime'] == null || purchaseExpirationDates['lifetime'] > new Date().getTime()))
		// 	{
		// 		shouldProBeActive = true;
		// 		isLifetime = true;
		// 		console.log('lifetime is active');
		// 	}

		// 	if(purchaseDates['monthly'] && purchaseExpirationDates['monthly'] > new Date().getTime())
		// 	{
		// 		shouldProBeActive = true;
		// 		isMonthly = true;
		// 		console.log('monthly is active');
		// 	}

		// 	if(shouldProBeActive)
		// 	{
		// 		if(isLifetime)
		// 		{
		// 			return 'true-lifetime';
		// 		}
		// 		else
		// 		{
		// 			return 'true-monthly';
		// 		}
		// 	}

		// 	if(parseInt(window.localStorage.friendsInvited) >= 3)
		// 	{
		// 		return 'true-friends';
		// 	}

		// 	return false;
		// }

		// check if the subscription has expired
		function checkProStatus() {
			if(typeof Purchases == "undefined" || !Purchases)
			{
				console.log('no Purchases');
				LoaderOverlay.hide();
				return;
			}

			console.log('checkpro');
			Purchases.getCustomerInfo(info => {
				console.log('checkPro getting info', info);

				var shouldProBeActive = isProActive(info);

				if(shouldProBeActive)
				{
					if(shouldProBeActive == 'true-lifetime')
					{
						$rootScope.setProStatus(true);
					}
					else
					{
						$rootScope.setProStatus(true, true);
					}
				}
				else
				{
					$rootScope.setProStatus(false);
				}

				LoaderOverlay.hide();
			}, error => {
				// Error fetching customer info
				console.log('error fetching customerinfo', error);
				LoaderOverlay.hide();
			});
		}

		$rootScope.restorePurchases = function()
		{
			if(typeof Purchases == "undefined" || !Purchases)
			{
				console.log('no Purchases');
				LoaderOverlay.hide();
				return;
			}

			LoaderOverlay.forceShow();

			console.log('rootScope.restorePurchases');
			Purchases.restorePurchases(info => {
				console.log(info);
				checkProStatus();
			},
			error => {
				console.log('error restoring purchases', error);
				// Error restoring purchases
				LoaderOverlay.hide();
			});
		}

		function syncOldPurchases()
		{
			if(typeof Purchases == "undefined" || !Purchases)
			{
				console.log('no Purchases');
				LoaderOverlay.hide();
				return;
			}

			console.log('sync 3');
			// sync old version sub data
			const isSubscribedInOldSystem = true;
			Purchases.getCustomerInfo(info => {
				console.log('sync 4 checking old sub customerinfo', info);

				const isSubscribedInRevenueCat = (isProActive(info) ? true : false);

				// If the old system says we have a subscription, but RevenueCat does not
				if (isSubscribedInOldSystem && !isSubscribedInRevenueCat)
				{
					// Tell Purchases to syncPurchases.
					// This will sync the user's receipt with RevenueCat.
					console.log('sync 5 calling syncPurchases');
					Purchases.syncPurchases();
				}
			});

			window.localStorage.checkedOldSub = true;
		}

		function initCatPurchases()
		{
			if(typeof Purchases == "undefined" || !Purchases)
			{
				console.log('no Purchases');
				return;
			}

			Purchases.setLogLevel('DEBUG');
			if (window.cordova.platformId === 'ios') {
				Purchases.configure('appl_OproECecnebLpLEzDHBfUOEhdmJ', window.device.uuid);
			} else if (window.cordova.platformId === 'android') {
				Purchases.configure('goog_FdyYRftgfRTfbOrmMhLngcuXhse', window.device.uuid);
			}

			function displayUpsellScreen() {
				Purchases.getOfferings(offerings => {
					console.log('offerings !!!', offerings);
					if (offerings.current !== null) {
						$rootScope.offerings = offerings.current;
						// Display current offering with offerings.current
					}
				},
				error => {
					console.log(error);
				});
			}

			displayUpsellScreen();

			window.setTimeout(function()
			{
				checkProStatus();
			}, 2000);

			// subscribe to the window event onCustomerInfoUpdated to get any changes that happen in the customerInfo
			window.addEventListener("onCustomerInfoUpdated", onCustomerInfoUpdated, false);

			function onCustomerInfoUpdated(info) {
			    // handle any changes to customerInfo
			    checkProStatus();
			}

			// checking old purchases from previous version so they get synced to revenueCat analytics
			if(window.localStorage.isUserPro && window.localStorage.isUserPro == 'true')
			{
				console.log('sync 1');
				if(!window.localStorage.checkedOldSub && (!window.localStorage.firstUseDate || (window.localStorage.firstUseDate && parseInt(window.localStorage.firstUseDate) < (new Date().getTime() - 1000 * 60))))
				{
					console.log('sync 2');
					syncOldPurchases();
				}
			}
		}

		initCatPurchases();

		$rootScope.buyPro = function(productType)
		{
			console.log('rootScope.buyPro', productType);
			LoaderOverlay.forceShow();

			// if(window.cordova.platformId === 'ios')
			// {
			Purchases.purchasePackage($rootScope.offerings[productType], ({ productIdentifier, customerInfo }) => {
				// if (typeof customerInfo.entitlements.active['my_entitlement_identifier'] !== "undefined" || (isProActive(customerInfo) ? true : false)) {
					console.log('purchase in progress', productType, productIdentifier, customerInfo);
					if(productType == 'monthly')
					{
						$rootScope.setProStatus(true, true);
					}
					else
					{
						$rootScope.setProStatus(true);
					}

					if(window.location.hash == '#/tab/pro')
					{
						$ionicViewSwitcher.nextDirection("enter");
						$state.go('tab.play');
					}

					$rootScope.trackEvent("Complete_Purchase", productType, window.cordova.platformId);
				// }
				// else
				// {
				// 	console.log()
				// }

				LoaderOverlay.hide();
			}, ({error, userCancelled}) => {
				console.log('error making purchase', error, userCancelled);
				LoaderOverlay.hide();

				$rootScope.trackEvent("Failed_Purchase", productType, window.cordova.platformId);
			});
			// }
			// else
			// {

			// 	// Note: if you are using purchaseProduct to purchase Android In-app products, an optional third parameter needs to be provided when calling purchaseProduct. You can use the package system to avoid this.
			// 	Purchases.purchaseProduct(productName, ({ productIdentifier, customerInfo }) => {

			// 	}, ({error, userCancelled}) => {
			// 		// Error making purchase
			// 	}, null, Purchases.PURCHASE_TYPE.INAPP);
			// }
		}

		if(window.facebookConnectPlugin)
		{
			window.facebookConnectPlugin.activateApp(function(res){
				console.log('fb - activated app');
			}, function(res){
				console.log('fb - NOT activated app');
			});
		}

		var templates = [
		"tabs.html",
		'tab-lessons.html',
		'lessons-read.html',
		'lessons-read-old.html',
		'lessons-finish.html',
		'tab-game.html',
		'game-play.html',
		'tab-top.html',
		'tab-play.html',
		'tab-account.html',
		'tab-usertop.html',
		'tab-pro.html',
		'tab-missions.html',
		'tab-analyze.html'
		];

		for(i=0;i<templates.length;i++)
		{
			var template = 'templates/' + templates[i];
			if ($templateCache.get(template)){
				continue; //prevent the prefetching if the template is already in the cache
			}

			(function(template)
			{
				$http.get(template).success(function (t) {
					$templateCache.put(template, t);
				});
			})(template);
		}

		document.addEventListener("pause", function() {
			if(window.device.platform == 'iOS')
			{
				window.lastActive = new Date().getTime();
				window.appPaused = true;
			}
		}, false);

		document.addEventListener("resume", function() {
			if(window.device.platform == 'iOS')
			{
				window.setTimeout(function()
				{
					window.appPaused = false;
				}, 1000);

				var currentTime = new Date().getTime();

				// so far ios only issue
				// It seems that connection to firebase chartRef gets stuck, does not return anything if app is in background for a longer time
				// testing 6 hours.
				var appReloadTime = 1000 * 60 * 60 * 1; // previously 6 hrs
				if(window.lastActive + appReloadTime < currentTime)
				{
					// alert('APP SHOULD RELOAD');
					// testing if this is still required after all these changes for ios.
					window.location.reload();
				}
			}
		}, false);

		// debug
		window.pause = function() {
			document.dispatchEvent(new Event("pause"));
		}

		window.resume = function() {
			document.dispatchEvent(new Event("resume"));
		}

		$ionicPlatform.registerBackButtonAction(function (event)
		{
			if ('tab.play' == $state.current.name)
			{
				navigator.app.exitApp();
			}

			var br = $rootScope.backRoute();
			if (angular.isFunction(br))
			{
				br();
			}
			else
			{
				window.location.hash = br;
			}
		}, 100);

	});
})

.run(function($rootScope, OnlineStatus, RenderedLessons, PortfolioTitle, $ionicSideMenuDelegate, $ionicHistory, $window, $cordovaDevice, $filter, $timeout, $state, $stateParams, $ionicScrollDelegate, $ionicViewSwitcher, $sce, FireStorage, LessonOpener, $ionicPlatform, API, $ionicPopup, IonicClosePopupService, Mongo, $compile, $ionicBackdrop, DateNow, Alert, LoaderOverlay, Ads, $http) {

	// $$rebind debugging
	// $rootScope.$on('$$rebind::curr', function(e, v) {
	// 	console.log(v);
	// });

	var assetSelectorOpen = false;

	window.resetUserCash = 5000;
	window.initialUserCash = 10000;

	$rootScope.isOnline = !!OnlineStatus.is();

	var settingsRef = firebase.database().ref('settings');
	settingsRef.once('value', function(snap)
	{
		$rootScope.globalSettings = snap.val();

		if($rootScope.globalSettings.followerData)
		{
			window.localStorage.followerData = JSON.stringify($rootScope.globalSettings.followerData);
			$rootScope.followerData = $rootScope.globalSettings.followerData;
		}
	});

	if(window.localStorage.followerData)
	{
		try {
			$rootScope.followerData = JSON.parse(window.localStorage.followerData);
		} catch (e) {
			$rootScope.followerData = {fb: '', yt: ''};
		}
	}
	else
	{
		$rootScope.followerData = {fb: '', yt: ''};
	}

	$rootScope.systemNotificationsEnabled = true;

	$rootScope.openSettingsNow = function()
	{
		$rootScope.trackEvent("SideMenu", "Notifications_" + (!$rootScope.systemNotificationsEnabled ? 'on' : 'off'));
		if(window.cordova && window.cordova.plugins && window.cordova.plugins.NativeSettings)
		{
	    	window.cordova.plugins.NativeSettings.open('application_details', function()
	    	{
	    		// console.log('success opening NativeSettings');
	    	},function()
	    	{
	    		// console.log('failed opening NativeSettings')
	    	});
		}
	}

	$rootScope.togglingSettings = function(setting)
	{
		$rootScope.trackEvent("SideMenu", setting, ($rootScope.settings[setting] == true ? 'on' : 'off'));

		if($rootScope && $rootScope.settings)
		{
			Mongo.get(function(user)
			{
				if(setting == 'coinGame')
				{
					if($rootScope.settings[setting] == false)
					{
						if(document.querySelector('.outer-free-money'))
						{
							document.querySelector('.outer-free-money').remove();
						}
					}

					Mongo.update({settings: $rootScope.settings});
				}
				else if(setting == 'alertNotifications' && FirebasePlugin)
				{
					window.setTimeout(function() {
						FirebasePlugin.hasPermission(function(hasPermission)
						{
							if(hasPermission || hasPermission == 'granted')
							{
								if($rootScope.settings.alertNotifications == true)
								{
									FirebasePlugin.subscribe("alertNotifications", function(){
									    Mongo.update({settings: $rootScope.settings});
									}, function(error){
									     console.error("Error subscribing to topic: " + error);
									});
								}
								else if($rootScope.settings.alertNotifications == false)
								{
									FirebasePlugin.unsubscribe("alertNotifications", function(){
									    Mongo.update({settings: $rootScope.settings});
									}, function(error){
									     console.error("Error unsubscribing from topic: " + error);
									});
								}
							}
							else
							{
								FirebasePlugin.grantPermission(function(hasPermission)
								{
									if(hasPermission || hasPermission == 'granted')
									{
										$rootScope.togglingSettings('alertNotifications');
									}
									else
									{
										$rootScope.settings.alertNotifications = false;
										Mongo.update({settings: $rootScope.settings});
									}
								});
							}
						});
						window.localStorage["settings"] = JSON.stringify($rootScope.settings);
					}, 100);
				}
				else if(setting == 'positionNotifications' && FirebasePlugin)
				{
					window.setTimeout(function() {
						FirebasePlugin.hasPermission(function(hasPermission)
						{
							if(hasPermission || hasPermission == 'granted')
							{
								if($rootScope.settings.positionNotifications == true)
								{
									FirebasePlugin.onTokenRefresh(function(token) {
									    $rootScope.settings.positionNotificationsToken = token;
									    Mongo.update({settings: $rootScope.settings});
									}, function(error) {
									    console.log('onTokenRefresh fail ' + error);
									});
								}
								else if($rootScope.settings.positionNotifications == false)
								{
									delete $rootScope.settings.positionNotificationsToken;
								    Mongo.update({settings: $rootScope.settings});
								}
							}
							else
							{
								FirebasePlugin.grantPermission(function(hasPermission)
								{
									if(hasPermission || hasPermission == 'granted')
									{
										$rootScope.togglingSettings('positionNotifications');
									}
									else
									{
										$rootScope.settings.positionNotifications = false;
										delete $rootScope.settings.positionNotificationsToken;
									    Mongo.update({settings: $rootScope.settings});
									}
								});
							}
						});
						window.localStorage["settings"] = JSON.stringify($rootScope.settings);
					}, 100);
				}
				else
				{
					Mongo.update({settings: $rootScope.settings});
				}
			});

			window.localStorage["settings"] = JSON.stringify($rootScope.settings);
		}
	}

	$rootScope.showHelper = function()
	{
		$ionicSideMenuDelegate.toggleLeft();
	}

	$rootScope.closePopup = function()
	{
		iPopup.close();
	}

	var iPopup;

	$rootScope.resetAccountConfirmation = function()
	{
		if($rootScope.isUserPro)
		{
			var resetButtons = [{
				text: '$200',
				onTap: function(e)
				{
					resetAccount(200);
				},
				type: 'button-blue'
			},
			{
				text: '$10000',
				onTap: function(e)
				{
					resetAccount(10000);
				},
				type: 'button-blue'
			},
			{
				text: '$25000',
				onTap: function(e)
				{
					resetAccount(25000);
				},
				type: 'button-blue'
			},
			{
				text: '',
				onTap: function(e)
				{
					iPopup.close();
				},
				type: 'button-cancel'
			}];
		}
		else
		{
			var resetButtons = [{
				text: '$200',
				onTap: function(e)
				{
					resetAccount(200);
				},
				type: 'button-blue'
			},
			{
				text: '$5000',
				onTap: function(e)
				{
					$rootScope.trackEvent('Ads', 'ResetAccount_5000');
					Ads.show('', function() {
						resetAccount(5000);
					});
				},
				type: 'button-blue ads ad-single'
			},
			{
				text: '$10000',
				onTap: function(e)
				{
					$rootScope.trackEvent('Ads', 'ResetAccount_10000');
					Ads.show('', function() {
						resetAccount(10000);
					});
				},
				type: 'button-blue ads ad-single'
			},
			{
				text: '',
				onTap: function(e)
				{
					iPopup.close();
				},
				type: 'button-cancel'
			}];
		}

		iPopup = $ionicPopup.confirm({
			title: '',
			cssClass: 'popup-confirm popup-reset-account',
			template: '<h2>' + $rootScope.t('Reset Game Money') + '</h2><p>' + $rootScope.t('You can reset the game to the following starting capital:') + '</p>',
			buttons: resetButtons
		});

		IonicClosePopupService.register(iPopup);

		// $timeout(function () {
		// 	const elem = document.querySelectorAll('.popup-confirm.popup-reset-account .popup')[0];
		// 	elem.setAttribute('click-outside', 'closePopup()');
		// 	$compile(elem)(angular.element(elem).scope());
		// });
	}

	$rootScope.deleteAccountConfirmation = function()
	{
		iPopup = $ionicPopup.confirm({
			title: '',
			cssClass: 'popup-confirm popup-reset-account',
			template: '<h2>' + $rootScope.t('Warning!') + '</h2><p>' + $rootScope.t('You will delete all your game data and friends invites. Are You sure?') + '</p><p class="bold">' + $rootScope.t('!!There is no way to recover your data!!') + '</p>',
			buttons: [{
				text: $rootScope.t('Yes'),
				onTap: function(e)
				{
					$rootScope.trackEvent("SideMenu", "DeleteAccount");
					deleteAccount();
				},
				type: 'button-negative'
			},
			{
				text: $rootScope.t('No'),
				onTap: function(e)
				{
					return;
				},
				type: 'button-positive'
			}]
		});

		IonicClosePopupService.register(iPopup);
	}

	function resetAccount(val)
	{
		$rootScope.trackEvent("Account", "Reset_" + val);
		Mongo.get(function(user)
		{
			Mongo.deleteTradeHistory();
			window.localStorage.removeItem('lastUserWins');
			window.localStorage.removeItem('lastUserWins');
			window.localStorage.removeItem('caseStudiesProgress');
			window.localStorage.removeItem('casesState');
			window.localStorage.removeItem('caseCorrectAnswers');

			Mongo.resetAccount(val).then(function()
			{
				window.location.hash = "#/tab/trade";
				window.location.reload();
			});
		});
	}

	function deleteAccount()
	{
		$rootScope.trackEvent("Account", "Delete", "UUID", window.device.uuid);

		Mongo.get(function(user)
		{
			// to revoke 'Apps Using Apple ID'
			if(user && user.oauthMethod && user.oauthMethod == 'apple')
			{
				API.get('revokeToken', {refresh_token: user.token});
			}

			Mongo.deleteTradeHistory();

			if(user && user.oauthID)
			{
				var cred = Mongo.getAuthCredentials(user.firebaseKeyId);
				firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).then(function(userData)
				{
					API.get('deleteAccount', {oauthid: user.oauthID || '', oauth: userData.user.uid || ''}, function()
					{
						FireStorage.clearOauth();
						Mongo.realDelete().then(function()
						{
							$timeout(function()
							{
								window.location.reload();
							}, 500);
						});
					});
				});
			}
			else
			{
				Mongo.realDelete().then(function()
				{
					$timeout(function()
					{
						window.location.reload();
					}, 500);
				});
			}

			FireStorage.set('completedLessons', null);
			window.localStorage.clear();
			window.location.hash = "#/tab/trade";
		});
	}

	$rootScope.setProStatus = function(isPro, subscription)
	{
		Mongo.getCached(function(user)
		{
			if(!isPro)
			{
				isPro = false;
			}

			$rootScope.isUserPro = isPro;
			window.localStorage.isUserPro = isPro;
			if(subscription && isPro == true)
			{
				$rootScope.isUserProSubscription = subscription;
				window.localStorage.isUserProSubscription = subscription;
				if(!window.localStorage.subscriptionDate)
				{
					window.localStorage.subscriptionDate = new Date().getTime();
				}
			}

			if(!user)
			{
				return;
			}

			if(user.isUserPro != isPro)
			{
				Mongo.update({isUserPro: isPro});
			}
		}, function()
		{
			$timeout(function()
			{
				// console.log('setProStatus user not connected to db yet, retrying setProStatus');
				$rootScope.setProStatus(isPro);
			}, 2000);
		});
	}

	$rootScope.cancelPro = function()
	{
		if(typeof Purchases == "undefined" || !Purchases)
		{
			console.log('no purchases plugin 1');
			LoaderOverlay.hide();

			if(window.device && !window.device.platform)
			{
				$rootScope.setProStatus(false);
			}

			return;
		}

		Purchases.getCustomerInfo(info =>
		{
			if(info && info.managementURL)
			{
				$rootScope.openLink(info.managementURL, 'cancel_sub_button');
			}
			else
			{
				if(window.cordova.platformId == 'ios')
				{
					$rootScope.openLink('https://apps.apple.com/account/subscriptions', 'cancel_sub_button');
				}
				else
				{
					$rootScope.openLink('http://play.google.com/store/account/subscriptions', 'cancel_sub_button');
				}
			}
		});
		$ionicSideMenuDelegate.toggleLeft();
	}

	$rootScope.getAppVersion = function()
	{
		return window.currentAppVersion;
	}

	function getUserFiId()
	{
		Mongo.getCached(function(user)
		{
			$rootScope.fiId = user.fiId;
		}, function()
		{
			$timeout(function()
			{
				getUserFiId();
			}, 2000);

			return;
		});
	}

	getUserFiId();

	$rootScope.hidePortfDisclaimer = false;

	function hidePortfDisclaimer()
	{
		$timeout(function()
		{
			$rootScope.hidePortfDisclaimer = true;
		}, 5000);
	}

	if(window.localStorage.langselected)
	{
		hidePortfDisclaimer();
	}

	$rootScope.getAssetSelectorState = function()
	{
		return assetSelectorOpen;
	}

	$rootScope.toggleAssetSelector = function(isCompare)
	{
		window.labelCache['y'] = {};

		var el = window.document.querySelectorAll('#asset-select')[0];
		if (assetSelectorOpen == false)
		{
			$rootScope.isCompare = !!isCompare;
			if (el) {
				el.classList.add('open');
			}

			assetSelectorOpen = true;

			if(Keyboard && Keyboard.disableScroll)
			{
				Keyboard.disableScroll(true);
			}
		}
		else
		{
			if (el) {
				el.style.transition = 'transform 0.5s ease-in-out';
				el.classList.remove('open');
				el.style.removeProperty('transform');
				$timeout(function()
				{
					el.style.removeProperty('transition');
					el.scrollTop = 0;
				}, 300);
			}

			assetSelectorOpen = false;

			if(Keyboard && Keyboard.hide)
			{
				Keyboard.hide();
			}
		}

		$rootScope.$broadcast('asset-selector-toggled');
		$rootScope.$broadcast('$$rebind::curr');
	}

	$rootScope.hideAssetSelector = function()
	{
		if(!assetSelectorOpen)
		{
			return;
		}

		if(document.getElementById('asset-select'))
		{
			document.getElementById('asset-select').classList.remove("slideDown");
			document.getElementById('asset-select').classList.remove("slideUp");
		}

		if(document.querySelectorAll('.fx-icon.ion-assets'))
		{
			_.each(document.querySelectorAll('.fx-icon.ion-assets'), function(value)
			{
				value.classList.remove("up");
			});
		}

		$rootScope.$broadcast('asset-selector-toggled');
		assetSelectorOpen = false;
	}

	$rootScope.sideMenuOpen = false;

	$rootScope.alertOpen = false;

	$rootScope.openAlert = function()
	{
		if(!$rootScope.alertOpen)
		{
			$rootScope.alertOpen = true;
			$rootScope.trackEvent("Message", "Expand");
		}
	}

	$rootScope.updateVote = function(x)
	{
		if(!$rootScope.alert)
		{
			return;
		}

		$rootScope.trackEvent("Message", "Voted");

		if($rootScope.alert.voteData)
		{
			API.get('updateScore', {alertId: $rootScope.alert.id, x: x});
		}

		if(!window.localStorage.alertsVotedOn)
		{
			window.localStorage.alertsVotedOn = "{}";
			var alertsVotedOn = {};
		}

		var alertsVotedOn = JSON.parse(window.localStorage.alertsVotedOn);
		alertsVotedOn[$rootScope.alert.id] = true;
		window.localStorage.alertsVotedOn = JSON.stringify(alertsVotedOn);

		if(!window.localStorage.alertsYourVote)
		{
			var alertsYourVote = {};
			alertsYourVote[$rootScope.alert.id] = x;
			window.localStorage.alertsYourVote = JSON.stringify(alertsYourVote);
		}
		else
		{
			var alertsYourVote = JSON.parse(window.localStorage.alertsYourVote);
			alertsYourVote[$rootScope.alert.id] = x;
			window.localStorage.alertsYourVote = JSON.stringify(alertsYourVote);
		}

		if($rootScope.alert.voteData && window.localStorage.alertsVotedOn && JSON.parse(window.localStorage.alertsVotedOn)[$rootScope.alert.id])
		{
			$rootScope.alert.totalVotes = $rootScope.alert.voteData[0] + $rootScope.alert.voteData[1];
			if(!$rootScope.alert.voteDataPercent)
			{
				$rootScope.alert.voteDataPercent = [];
			}
			$rootScope.alert.voteDataPercent[0] = Math.round($rootScope.alert.voteData[0] / $rootScope.alert.totalVotes * 100);
			$rootScope.alert.voteDataPercent[1] = Math.round($rootScope.alert.voteData[1] / $rootScope.alert.totalVotes * 100);
		}

		$rootScope.alert.voted = true;

		$timeout.cancel(digestT);
		var digestT = $timeout(function()
		{
			$rootScope.$digest();
		});
	}

	$rootScope.$on('show-alert', function(event)
	{
		function showAlertOnUser()
		{
			Mongo.getCached(function(user)
			{
				$timeout(function()
				{
					$rootScope.getAlert();
				}, 250);
			}, function()
			{
				$timeout(function()
				{
					showAlertOnUser();
				}, 500);
			});
		}

		showAlertOnUser();
	});

	$rootScope.getAlertSingle = function(key, callback, missionbox)
	{
		Alert.getSingle(key, function(a)
		{
			var al = a;
			al = a;

			if(window.localStorage.alertsVotedOn && JSON.parse(window.localStorage.alertsVotedOn)[al.id])
			{
				al.voted = true;
			}

			if(al.voteData && window.localStorage.alertsVotedOn && JSON.parse(window.localStorage.alertsVotedOn)[al.id])
			{
				al.totalVotes = al.voteData[0] + al.voteData[1];
				if(!al.voteDataPercent)
				{
					al.voteDataPercent = [];
				}
				al.voteDataPercent[0] = Math.round(al.voteData[0] / al.totalVotes * 100);
				al.voteDataPercent[1] = Math.round(al.voteData[1] / al.totalVotes * 100);
			}

			if(!missionbox)
			{
				$rootScope.trackEvent("Message", "Show");
				$rootScope.alertOpenTime = DateNow();
			}

			al.title = angular.element($sce.getTrustedHtml(al.title))[0].innerHTML;
			al.text = angular.element($sce.getTrustedHtml(al.text))[0].innerHTML;

			var container = document.createElement("p");
			container.innerHTML = al.text;
			var anchors = container.getElementsByTagName("a");
			if(anchors && anchors.length)
			{
				var tempText = al.text;
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

					al.smallText = tempText;
				}
			}
			else
			{
				if(al.text.length > 46)
				{
					var wordEnd = al.text.substring(0, 46).indexOf(' ');
					al.smallText = al.text.substring(0, 46 + wordEnd) + '.. ';
				}
			}

			if(!missionbox)
			{
				$rootScope.alert = al;
			}

			if(callback)
			{
				return callback(al);
			}

			$timeout(function()
			{
				$rootScope.$digest();
			});
		});
	};

	$rootScope.getAlert = function()
	{
		console.log('getting alert...');
		Alert.get(function(a)
		{
			console.log('got smth from alerts', a);
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

			$rootScope.trackEvent("Message", "Show");
			$rootScope.alertOpenTime = DateNow();

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

			$timeout(function()
			{
				$rootScope.$digest();
			});

			console.log('got alert!!!', $rootScope.alert);
		});
	};

	$rootScope.toTrusted = function(html)
	{
		return $sce.trustAsHtml(html);
	}

	function customClose()
	{
		var el = window.document.querySelectorAll('.alert-wrapper .alert');
		if(el[0])
		{
			var alertHeight = el[0].getBoundingClientRect().height;
			var screenHeight = window.document.querySelectorAll('ion-view')[0].getBoundingClientRect().height;
			var angularEl = angular.element(el[0]);

			if($rootScope.alertOpen)
			{
				var startY = screenHeight / 100 * 50;
			}
			else
			{
				var startY = screenHeight / 100 * 67;
			}

			var resultBottom = startY - screenHeight - alertHeight;

			angularEl.css({bottom: resultBottom + 'px'});

			$timeout(function()
			{
				angularEl.css({bottom: '0px'});
			}, 500);
		}
		else
		{
			console.error('no alert to customClose');
		}
	}

	$rootScope.closeAlert = function(track, alertOpen)
	{
		$timeout(function()
		{
			$rootScope.alertOpen = false;
		}, 250);

		customClose();

		var timeOpened = Math.round((DateNow() - $rootScope.alertOpenTime) / 1000);
		if($rootScope.alert && $rootScope.alert.userKey)
		{
			Alert.markViewed($rootScope.alert.id);
		}
		else
		{
			Alert.markViewed($rootScope.alert.id, true);
		}

		if(track)
		{
			$rootScope.trackEvent("Message", "Close_" + (alertOpen ? "Expanded": "Collapsed"));
		}

		$rootScope.alert = null;

		$timeout(function()
		{
			// if fresh account, don't show more than the one alert already shown and remove freshAccount tag
			if(window.localStorage.freshAccount == 'true')
			{
				window.localStorage.freshAccount = false;
				return;
			}

			// try to show more alerts after closing one, if there are more.
			Alert.get(function(a)
			{
				$rootScope.alert = a;
				$rootScope.trackEvent("Message", "Show");
				$rootScope.alertOpenTime = DateNow();

				$rootScope.alert.title = angular.element($sce.getTrustedHtml($rootScope.alert.title))[0].innerHTML;
				$rootScope.alert.text = angular.element($sce.getTrustedHtml($rootScope.alert.text))[0].innerHTML;

				if($rootScope.alert.text.length > 46)
				{
					var wordEnd = $rootScope.alert.text.substring(0, 46).indexOf(' ');
					$rootScope.alert.smallText = $rootScope.alert.text.substring(0, 46 + wordEnd) + '.. ';
				}

				$timeout.cancel(digestT);
				var digestT = $timeout(function()
				{
					$rootScope.$digest();
				});
			});
		}, 500);
	};

	$rootScope.saveAlert = function(id)
	{
		$rootScope.trackEvent("Message", "Save");
		if(!window.localStorage.savedAlerts)
		{
			window.localStorage.savedAlerts = "{\"first\": true}";
			var savedAlerts = JSON.parse(window.localStorage.savedAlerts);
		}

		var savedAlerts = JSON.parse(window.localStorage.savedAlerts);
		savedAlerts[id] = true;
		window.localStorage.savedAlerts = JSON.stringify(savedAlerts);

		$rootScope.closeAlert();
	}

	$rootScope.handleSwipe = function(event, type)
	{
		if ('up' == event.gesture.direction)
		{
			event.currentTarget.style.left = 0;
			return;
		}

		event.currentTarget.style.left = 'release' == type ? 0 : event.gesture.distance + 'px';
	};

	$rootScope.toggleMenu = function()
	{
		if ($rootScope.isRoute('tab/play'))
		{
			$ionicSideMenuDelegate.toggleRight(true);
			$rootScope.trackEvent("SideMenu", "Show", 'Show');
		}
		else
		{
			var br = $rootScope.backRoute();
			if (angular.isFunction(br))
			{
				br();
			}
			else
			{
				$ionicViewSwitcher.nextDirection("enter");
				window.location.hash = br;

				//~ window.setTimeout(function()
				//~ {
					//~ PortfolioTitle.start();
				//~ }, 100);
			}

			$rootScope.trackEvent("Navigation", "Back", 'Back');
		}
	};

	if(!$rootScope.settings || ($rootScope.settings && Object.keys($rootScope.settings).length == 1))
	{
		if(window.localStorage.settings)
		{
			$rootScope.settings = JSON.parse(window.localStorage.settings);
		}
		else
		{
			$rootScope.settings =
			{
				chartBeta: false,
				positionNotifications: true,
				alertNotifications: true,
				tradingQuizes: true,
				coinGame: true,
			}
		}
	}

	function requestATT()
	{
		return new Promise(function(resolve, reject)
		{
			var idfaPlugin = cordova.plugins.idfa;

			idfaPlugin.getInfo()
		    .then(info => {
		        if (!info.trackingLimited) {
		            return info.idfa || info.aaid;
		        } else if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_NOT_DETERMINED) {
		            return idfaPlugin.requestPermission().then(result => {
		                if (result === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
		                    return idfaPlugin.getInfo().then(info => {
		                        return info.idfa || info.aaid;
		                    });
		                }
		            });
		        }
		    })
		    .then(idfaOrAaid => {
		        if (idfaOrAaid) {
		            // console.log(idfaOrAaid);
		        }
		        resolve();
		    });
		});
	}

	function requestPushNotif()
	{
		FirebasePlugin.hasPermission(function(hasPermission)
		{
			if(hasPermission || hasPermission == 'granted')
			{
				$rootScope.systemNotificationsEnabled = true;

				FirebasePlugin.subscribe("alertNotifications", function(){
					$rootScope.settings.alertNotifications = true;

					FirebasePlugin.onTokenRefresh(function(fcmToken) {
						$rootScope.settings.positionNotifications = true;
						$rootScope.settings.positionNotificationsToken = fcmToken;

						Mongo.update({settings: $rootScope.settings});
					}, function(error) {
					    console.error(error);
					});
				}, function(error){
				     console.error("Error subscribing to topic: " + error);
				});
			}
			else
			{
				$rootScope.systemNotificationsEnabled = false;

				FirebasePlugin.grantPermission(function(hasPermission)
				{
					if(hasPermission || hasPermission == 'granted')
					{
						$rootScope.systemNotificationsEnabled = true;

						FirebasePlugin.subscribe("alertNotifications", function(){
							$rootScope.settings.alertNotifications = true;

							FirebasePlugin.onTokenRefresh(function(fcmToken) {
								$rootScope.settings.positionNotifications = true;
								$rootScope.settings.positionNotificationsToken = fcmToken;

								Mongo.update({settings: $rootScope.settings});
							}, function(error) {
							    console.error(error);
							});
						}, function(error){
						     console.error("Error subscribing to topic: " + error);
						});
					}
					else
					{
						$rootScope.systemNotificationsEnabled = false;
						$rootScope.settings.alertNotifications = false;
						$rootScope.settings.positionNotifications = true;
						delete $rootScope.settings.positionNotificationsToken;
						Mongo.update({settings: $rootScope.settings});
					}
				}, function(error)
				{
					console.log('grantpermission error?', error);
				});
			}
		}, function(error)
		{
			console.log('hasPermission error', error);
		});
	}

	window.userDataInterval = window.setInterval(function()
	{
		Mongo.getCached(function(user)
		{
			if(user)
			{
				window.clearInterval(window.userDataInterval);
				checkSettings();

				var appVersion = parseInt(window.currentAppVersion.split('.').join('0'));
				var platform = ((window.device && window.device.platform) ? window.device.platform.toLowerCase() : 'custom');
				if(appVersion && platform)
				{
					if((user.appVersion && user.appVersion == appVersion) && (user.platform && user.platform == platform))
					{
						return;
					}

					Mongo.update({appVersion: appVersion, platform: platform});
				}

				// there may be cases when after opening app it does window.location.reload, therefore losing some scope variables or broadcasts like force-show-alert
				// to try to solve this, force-show-alert saves message.key value in window.localStorage.forceShowAlert which will be used to show the alert
				// after alert is shown should delete the key from localStorage
				if(window.localStorage.forceShowAlert)
				{
					if(window.location.hash != '#/tab/play')
					{
						$state.go('tab.play');
					}
					$rootScope.$broadcast('force-show-alert', window.localStorage.forceShowAlert);
				}
			}
		});
	}, 1000);

	function checkSettings()
	{
		if(typeof FirebasePlugin != "undefined")
		{
			FirebasePlugin.hasPermission(function(hasPermission)
			{
				if(hasPermission || hasPermission == 'granted')
				{
					$rootScope.systemNotificationsEnabled = true;

					if($rootScope.settings.positionNotifications)
					{
						FirebasePlugin.onTokenRefresh(function(fcmToken) {
							Mongo.getCached(function(user)
							{
								if((user.settings && user.settings.positionNotificationsToken && user.settings.positionNotificationsToken != $rootScope.settings.positionNotificationsToken) ||
								!user.settings || !user.settings.positionNotificationsToken || !$rootScope.settings.positionNotificationsToken || $rootScope.settings.positionNotificationsToken != fcmToken)
								{
									$rootScope.settings.positionNotificationsToken = fcmToken;
									Mongo.update({settings: $rootScope.settings});
								}
							});
						}, function(error) {
							console.error(error);
						});
					}
				}
				else
				{
					$rootScope.systemNotificationsEnabled = false;

					if($rootScope.settings.positionNotifications)
					{
						$rootScope.settings.positionNotifications = false;
						delete $rootScope.settings.positionNotificationsToken;
						FirebasePlugin.unregister();
					}

					if($rootScope.settings.alertNotifications)
					{
						$rootScope.settings.alertNotifications = false;
						$rootScope.togglingSettings('alertNotifications');
					}

					Mongo.update({settings: $rootScope.settings});
				}
			});
		}
	}

	$rootScope.positionClosedVisible = false;

	$rootScope.positionClosedResult = function()
	{
		$rootScope.positionClosedVisible = true;
	}

	$rootScope.closePositionResult = function()
	{
		$rootScope.positionClosedVisible = false;

		// if fresh account, try to show one alert
		if(window.localStorage.freshAccount == 'true')
		{
			$timeout(function()
			{
				$rootScope.getAlert();
			}, 1500);
		}

		if(window.localStorage.winStreakToday >= 2)
		{
			var currTime = new Date().getTime();

			if(window.device.platformManual == 'iOS')
			{
				// request in-app review max once per day for max 3 times, technically ios resets this max limit every year, but that should not be relevant
				if(window.localStorage.reviewCounter < 3 && (currTime - window.localStorage.lastReviewDate) > (1000 * 60 * 60 * 24))
				{
					// show review popup
					window.setTimeout(function()
					{
						if(!$rootScope.positionClosedVisible)
						{
							$rootScope.toggleReviewFeedback('Trading_2_Wins');
						}
					}, 2500);

					window.localStorage.lastReviewDate = currTime;
					window.localStorage.reviewCounter++;
				}
			}
			else
			{
				// request in-app review once per day
				if((currTime - window.localStorage.lastReviewDate) > (1000 * 60 * 60 * 24 * 30))
				{
					// show review popup
					window.setTimeout(function()
					{
						if(!$rootScope.positionClosedVisible)
						{
							$rootScope.toggleReviewFeedback('Trading_2_Wins');
						}
					}, 2500);

					window.localStorage.lastReviewDate = currTime;
				}
			}
		}
	}

	$rootScope.getPositionResultState = function()
	{
		return $rootScope.positionClosedVisible;
	}

	document.addEventListener("resume", function() {
		// in cases where user disables or enables push notifications via native settings
		checkSettings();
	}, false);

	document.addEventListener('deviceready', function() {

		$rootScope.initFCM = function()
		{
			if(typeof FirebasePlugin != "undefined")
			{
				if(window.device.platform == 'iOS')
				{
					if(typeof cordova != "undefined" && cordova.plugins && cordova.plugins.idfa)
					{
						requestATT().then(function()
						{
							requestPushNotif();
						});
					}
				}
				else
				{
					requestPushNotif();
				}

				FirebasePlugin.setAnalyticsCollectionEnabled(true);
			}
			else
			{
				console.log('no idfa plugin or FirebasePlugin');
			}
		}

		$rootScope.initFCM();

		$rootScope.loadLocalLangData();

		$rootScope.currentLang = window.currentLang;

		function runCustomCode()
		{
			// ignore customcode for newer versions, assuming that what's in the /code/3-0/ is not needed for app to work
			if(['nuttt3', 'nuttv0', 'nuttv2'].indexOf(window.localStorage.customCodeUpdate) >= 0)
			{
				console.log('ignoring customcode');
				window.localStorage.customCode = '';
				eval(window.localStorage.customCode);
				return;
			}

			if (window.localStorage.customCode)
			{
				// console.log(window.localStorage.customCode);
				eval(window.localStorage.customCode);
			}
		}

		var codeUpdateRef = firebase.database().ref('code/3-0/updated');
		codeUpdateRef.once('value', function(snap)
		{
			var codeUpdate = snap.val();
			if (!window.localStorage.customCodeUpdate || (window.localStorage.customCodeUpdate < codeUpdate))
			{
				window.localStorage.customCodeUpdate = codeUpdate;
				(firebase.database().ref('code/3-0/code')).once('value', function(snap)
				{
					var code = snap.val();
					window.localStorage.customCode = code;
					runCustomCode()
				});
			}
		});

		runCustomCode();

		async function isOnline()
		{
			if(!window.navigator.onLine) return false
			if(!navigator || !navigator.connection || typeof Connection === 'undefined' || navigator.connection.type === Connection.NONE) return false

			const url = new URL('https://financeillustrated.com/TOP/goforex-case-studies/3-93/current-version.php?t='+ (new Date()).getTime())

			try {
				const response = await fetch(
					url.toString(),
					{ method: 'HEAD' },
				)

				return response.ok
			} catch {
				return false
			}
		};

		$rootScope.showCasesUpdated = window.localStorage.showCasesUpdated == 'true' || false;

		function getLatestCaseStudiesVersion()
		{
			if(!window.localStorage.caseStudiesVersion)
			{
				window.localStorage.caseStudiesVersion = '0000';
			}

			isOnline().then(function()
			{
				$http.get('https://financeillustrated.com/TOP/goforex-case-studies/3-93/current-version.php?t='+ (new Date()).getTime()).success(function(data)
				{
					// console.log(data);
					if(data && data.version)
					{
						window.localStorage.latestCaseStudiesVersion = data.version;
					}

					if(!window.localStorage.latestCaseStudiesVersion)
					{
						return;
					}

					if(typeof cordova === 'undefined' || !cordova || !cordova.file)
					{
						return;
					}

					if(!window.resolveLocalFileSystemURL)
					{
						return;
					}

					if(!zip)
					{
						return;
					}

					var url = 'https://financeillustrated.com/TOP/goforex-case-studies/3-93/case-studies-' + window.currentLang + '.zip?t='+ (new Date()).getTime();
					var fileName = 'case-studies.zip';
					var fileDirectory = cordova.file.dataDirectory;
					var filePath = fileDirectory + fileName;

					var newVersion = (window.localStorage.latestCaseStudiesVersion > window.localStorage.caseStudiesVersion);

					if(newVersion)
					{
						window.localStorage.showCasesUpdated = true;
						$rootScope.showCasesUpdated = true;
					}

					function downloadAndUnzipNewVersion()
					{
						if(device.platform == "iOS")
						{
							var fileTransfer = new FileTransfer();

							fileTransfer.download(
							    url,
							    filePath,
							    function(entry) {
							        console.log("download complete: " + entry.toURL());
							        unzipFile(filePath);
							    },
							    function(error) {
							        console.log("download error source " + error.source);
							        console.log("download error target " + error.target);
							        console.log("download error code" + error.code);
									window.localStorage.removeItem('caseStudiesVersion');
									window.localStorage.removeItem('latestCaseStudiesVersion');

									// try again
									window.setTimeout(function() {
										getLatestCaseStudiesVersion();
									}, 5000);
							    },
							    false,
							    {
							    }
							);
						}
						else
						{
							$http.get(url, { responseType: 'blob' }).then(function(response) {
								var blob = response.data;
								// console.log('File downloaded successfully.');

								// Create the file
								window.resolveLocalFileSystemURL(fileDirectory, function(directoryEntry) {
									directoryEntry.getFile(fileName, { create: true }, function(fileEntry) {
										// console.log('File created: ' + fileEntry.fullPath);

										// Write the downloaded content to the file
										fileEntry.createWriter(function(fileWriter) {
											fileWriter.onwriteend = function() {
												// console.log('File written successfully.');
												unzipFile(filePath);
											};
											fileWriter.onerror = function(e) {
												console.log('Error writing to file: ', e.toString());
											};
											fileWriter.write(blob);
										});
									}, function(error) {
									console.log('Error creating file: ', error.code);
									});
								}, function(error) {
								console.log('Error resolving directory: ', error.code);
								});
							}, function(error) {
								console.log('Error downloading file: ', error.statusText);
							});
						}
					}

					// check for new Version
					if(newVersion || !window.localStorage.caseStudiesLang || window.localStorage.caseStudiesLang != window.currentLang)
					{
						window.localStorage.caseStudiesLang = window.currentLang;
						console.log('new case studies version available or language changed, downloading!');
						downloadAndUnzipNewVersion();
					}
					else
					{
						// Check if the file exists
						window.resolveLocalFileSystemURL(filePath, function(fileEntry) {
							console.log('File already exists or language not changed: ', fileEntry.fullPath);
						}, function() {
							// file does not exist, download it
							console.log('File does not exist.. downloading and unzipping!');
							downloadAndUnzipNewVersion();
						});
					}

					// Unzip the file
					function unzipFile(filePath) {
						fileDirectory = cordova.file.dataDirectory + 'case-studies/';
						zip.unzip(filePath, fileDirectory, function(result) {
							console.log('unzip completed', result);
							window.localStorage.caseStudiesVersion = window.localStorage.latestCaseStudiesVersion;
						}, function(error) {
							console.log('Unzip progressing or failed: ', error);
						});
					}
				}).error(function(e)
				{
					window.localStorage.removeItem('caseStudiesVersion');
					window.localStorage.removeItem('latestCaseStudiesVersion');
					console.log('error');

					// try again
					window.setTimeout(function() {
						getLatestCaseStudiesVersion();
					}, 5000);
				});
			});
		}

		window.setTimeout(function() {
			getLatestCaseStudiesVersion();
		}, 20000);

		// lesson image swapping to downloaded ones for other languages
		function swapLessonImages()
		{
			if(typeof cordova === 'undefined' || !cordova || !cordova.file)
			{
				return;
			}

			if(!window.resolveLocalFileSystemURL)
			{
				return;
			}

			if(!zip)
			{
				return;
			}

			var fileName = 'images-' + window.currentLang + '.zip';
			var fileDirectory = cordova.file.dataDirectory;
			var filePath = fileDirectory + fileName;

			function getLatestImagesVersion()
			{
				return new Promise((resolve, reject) =>
				{
					$http.get('https://financeillustrated.com/TOP/goforex-lang-images/current-version.php?t='+ (new Date()).getTime()).success(function(response)
					{
						window.localStorage.latestImagesVersion = response.version;
						// console.log('latest images version', response.version);
						resolve();
					}).error(function(e)
					{
						console.log('error');
						reject();
					});
				});
			}

			// download images .zip file from server
			function downloadImagesZip()
			{
				var url = 'https://financeillustrated.com/TOP/goforex-lang-images/images-' + window.currentLang + '.zip?t='+ (new Date()).getTime();
				console.log(url);

				if(device.platform == "iOS")
				{
					var fileTransfer = new FileTransfer();

					fileTransfer.download(
						url,
						filePath,
						function(entry) {
							// console.log("download complete: " + entry.toURL());
							unzipImageFile(filePath);
						},
						function(error) {
							console.log("download error source " + error.source);
							console.log("download error target " + error.target);
							console.log("download error code" + error.code);
							window.localStorage.removeItem('caseStudiesVersion');
							window.localStorage.removeItem('latestCaseStudiesVersion');
						},
						false,
						{
						}
					);
				}
				else
				{
					$http.get(url, { responseType: 'blob' }).then(function(response) {
						var blob = response.data;
						// console.log('File downloaded successfully.');

						// Create the file
						window.resolveLocalFileSystemURL(fileDirectory, function(directoryEntry) {
							directoryEntry.getFile(fileName, { create: true }, function(fileEntry) {
								// console.log('File created: ' + fileEntry.fullPath);

								// Write the downloaded content to the file
								fileEntry.createWriter(function(fileWriter) {
									fileWriter.onwriteend = function() {
										// console.log('File written successfully.');
										unzipImageFile(filePath);
									};
									fileWriter.onerror = function(e) {
										console.log('Error writing to file: ', e.toString());
									};
									fileWriter.write(blob);
								});
							}, function(error) {
							console.log('Error creating file: ', error.code);
							});
						}, function(error) {
						console.log('Error resolving directory: ', error.code);
						});
					}, function(error) {
						console.log('Error downloading file: ', error.statusText);
					});
				}
			}

			// unzip the images .zip file
			function unzipImageFile(filePath) {
				fileDirectory = cordova.file.dataDirectory;
				zip.unzip(filePath, fileDirectory + 'images-' + window.currentLang + '/', function(result) {
					// console.log('unzip completed', result);
					window.localStorage.imagesVersion = window.localStorage.latestImagesVersion;

					// replace images in the lesson code
					replaceImagesInLessonCode();
				}, function(error) {
					// console.log('Unzip progressing or failed: ', error);
				});
			}

			// check if images are downloaded
			function checkIfImagesAreDownloaded()
			{
				// Check if the file exists
				window.resolveLocalFileSystemURL(filePath, function(fileEntry) {
					console.log('File already exists: ', fileEntry.fullPath);
					replaceImagesInLessonCode();
				}, function() {
					// file does not exist, download it
					console.log('File does not exist.. downloading and unzipping!');
					downloadImagesZip();
				});
			}

			// check if there is a new version of the images
			function checkIfNewImagesVersion()
			{
				if(window.localStorage.latestImagesVersion && window.localStorage.latestImagesVersion != window.localStorage.imagesVersion)
				{
					console.log('new images version available, downloading!');
					downloadImagesZip();
				}
				else
				{
					checkIfImagesAreDownloaded();
				}
			}

			function replaceImagesInLessonCode()
			{
				// get the lesson code
				try {
					var lessonCode = JSON.stringify(window.training[window.currentLang]);
				} catch(e) {
					console.log('error', e);
					return;
				}

				// get the downloaded images
				window.resolveLocalFileSystemURL(fileDirectory, function(dir) {
					dir.getDirectory('/images-' + window.currentLang, { create: false }, function(dir) {
						var reader = dir.createReader();
						reader.readEntries(function(entries) {
							entries.forEach(function(entry) {
								// console.log('entry', entry);
								var imageName = entry.name;
								if(device.platform == 'iOS')
								{
									var imagePath = window.WkWebView.convertFilePath(entry.nativeURL);
								}
								else
								{
									var imagePath = entry.nativeURL;
								}
								// console.log('imagePath', imagePath);
								// replace the image in the lesson code
								var imageNameInCurrentCode = 'img/lessons/' + imageName.replace('_' + window.currentLang + '.webp', '.webp');
								// console.log('replacing ' + imageNameInCurrentCode + ' with ' + imagePath);
								var currentCodeImageExists = lessonCode.indexOf(imageNameInCurrentCode) > -1;
								if(currentCodeImageExists)
								{
									lessonCode = lessonCode.replace(imageNameInCurrentCode, imagePath);
								}
								else
								{
									console.log('image does not exist', imageNameInCurrentCode);
								}
							});
							// save the lesson code
							try {
								window.training[window.currentLang] = JSON.parse(lessonCode);
							} catch(e) {
								console.log('error parsing lesson code', e);
							}
						}, function(error) {
							console.log('error reading entries', error);
						});
					}, function(error) {
						console.log('error resolving directory', error);
					});
				}
				, function(error) {
					console.log('error resolving directory', error);
				});
			}

			// check if there is a new version of the images and do the image replacing
			if(window.currentLang != 'en')
			{
				getLatestImagesVersion().then(function()
				{
					checkIfNewImagesVersion();
				});
			}
		}

		swapLessonImages();

		// link retargeting setup
		function isFirebaseOnline()
		{
			return new Promise((resolve, reject) =>
			{
				if(!window.navigator || !window.navigator.onLine || !navigator || !navigator.connection || typeof Connection === 'undefined' || navigator.connection.type === Connection.NONE)
				{
					// checking if platform is set, if it's not then it's most likely is dev env
					if(window.device && window.device.platform)
					{
						reject({
							success: false
						});
					}
				}

				var connectedRef = firebase.database().ref(".info/connected");
				connectedRef.once("value", function(snap) {
					if (snap.val() === true) {
						let response = snap.val();
						// console.log("connected", response);
						resolve({
							success: true
						});
					} else {
						console.log("not connected");
						reject({
							success: false
						});
					}
				});
			});
		};

		window.isFirebaseOnline = isFirebaseOnline;

		function fetchRetargetingLinks()
		{
			if(window.localStorage.linkRetargetingResult) return;

			var linkRetargetingSource = window.localStorage.linkRetargetingSource;
			if(!linkRetargetingSource || linkRetargetingSource == 'undefined' || linkRetargetingSource == '') return;

			isFirebaseOnline().then(function(response) {
				// console.log('isFirebaseOnline then res', response);
				if(!response)
				{
					window.setTimeout(function()
					{
						console.log('call repeat on !response');
						fetchRetargetingLinks();
					}, 500);
					return;
				}

				var ref = firebase.database().ref('linkRetargeting').child(linkRetargetingSource);
				ref.once('value').then(function(snapshot) {

					var links = snapshot.val();
					// console.log('links', links);
					if(!links) return;

					if(links)
					{
						try {
							window.localStorage.linkRetargetingResult = JSON.parse(links);
							$rootScope.trackEvent(linkRetargetingSource);
						} catch (error) {
							console.log('error parsing links', error);
						}
					}
				});
			}).catch(function(error) {
				console.log('isFirebaseOnline catch', error);
				window.setTimeout(function()
				{
					fetchRetargetingLinks();
				}, 2000);
			});
		}

		$timeout(function()
		{
			fetchRetargetingLinks();
		}, 5000);

		$rootScope.showLanguageMenu = function()
		{
			$rootScope.trackEvent("SideMenu", "Change Language");
			$rootScope.hideMenu();
			$timeout(function()
			{
				document.getElementById('lang-select').style.display = '';
			}, 250);
		}

		// App Setup Quiz
		$rootScope.setupQuestions = [
			{
				title: $rootScope.t('Welcome,'),
				text: $rootScope.t('Let’s set up the app just for you in 3 simple steps'),
				answers: [
					$rootScope.t("Let's go")
				]
			},
			{
				title: $rootScope.t('Question 1'),
				text: $rootScope.t('What is the most important rule in trading?'),
				answers: [
					$rootScope.t("Not losing money"),
					$rootScope.t("Making money")
				]
			},
			{
				title: $rootScope.t('Question 2'),
				text: $rootScope.t('What is a realistic weekly profit goal for a novice trader starting with $1000?'),
				answers: [
					$rootScope.t("$5000"),
					$rootScope.t("$250")
				]
			},
			{
				title: $rootScope.t('Question 3'),
				text: $rootScope.t('You would like to learn to trade:'),
				answers: [
					$rootScope.t("Stocks, Crypto"),
					$rootScope.t("Forex, Commodities"),
					$rootScope.t("Indices"),
					$rootScope.t("Everything above")
				]
			}
		];

		$rootScope.setInitLang = function(code)
		{
			window.localStorage.setItem('langselected', true);
			$rootScope.currentLang = code;

			if (code != window.currentLang)
			{
				$rootScope.setLang(code, true);
				$state.go('tab.play');
				$timeout(function()
				{
					window.location.reload();
				}, 100);
			}
			else
			{
				$rootScope.trackEvent("Language", "Change", code);
				if(!window.localStorage.setupAnswersDone)
				{
					document.getElementById('app-setup').style.display = 'flex';
				}
				document.getElementById('lang-select').style.display = 'none';
			}
		};

		$rootScope.howToOpen = false;

		$rootScope.openHowTo = function(code)
		{
			$rootScope.trackEvent("AssetLimitReason", "Open");
			window.localStorage.setItem('howToSeen', true);
			document.getElementById('how-to').style.display = 'block';
			$rootScope.howToOpen = true;
			$rootScope.isHowToSeen = true;
		};

		$rootScope.closeHowTo = function(code)
		{
			document.getElementById('how-to').style.display = 'none';
			$rootScope.$broadcast('closed-how-to');
			hidePortfDisclaimer();
			$rootScope.howToOpen = false;

			$rootScope.$broadcast('$$rebind::positions');
			$rootScope.$broadcast('$$rebind::curr');
		};
	});

	$rootScope.$watch(function(){return $ionicSideMenuDelegate.isOpenLeft()}, function(isOpen)
	{
		$rootScope.sideMenuOpen = isOpen;
		if(isOpen)
		{
			checkSettings();
			$rootScope.trackEvent("SideMenu", "Opened");
		}
	});

	$rootScope.hideMenu = function()
	{
		if ($ionicSideMenuDelegate.isOpen())
		{
			$ionicSideMenuDelegate.toggleLeft();
		}
	};

	$rootScope.loadLocalLangData = function()
	{
		return;

		try
		{
			var storedLang = window.localStorage['languages_' + window.currentLang];
			if (storedLang)
			{
				var langdata = JSON.parse(storedLang);
				_.each(langdata, function(data, key)
				{
					window[key][window.currentLang] = data[window.currentLang];
				});
			}
		} catch (e) {console.log(e)}

		if (window.localStorage['languages_list'])
		{
			try
			{
				var langdata = JSON.parse(window.localStorage['languages_list']);
				if (langdata)
				{
					window.languages = langdata.languages;
				}
			} catch (e) {console.log(e)}
		}
	};

	$rootScope.openTrading = function()
	{
		$ionicViewSwitcher.nextDirection("enter");
		$state.go('tab.play');
	};

	$rootScope.feedbackVisible = false;

	$rootScope.forceClosePopup;

	$rootScope.toggleFeedback = function(track)
	{
		var el = window.document.querySelectorAll('#feedback')[0];
		var appElm = angular.element(document.getElementById('app'));

		if($rootScope.feedbackVisible == false)
		{
			el.style.display = 'block';
			$timeout(function()
			{
				el.classList.add('open');
				$rootScope.feedbackVisible = true;

				$rootScope.trackEvent('Feedback', 'Open');

				if(Keyboard && Keyboard.disableScroll)
				{
					Keyboard.disableScroll(true);
				}
			});
		}
		else
		{
			$timeout(function()
			{
				el.style.display = 'none';
			}, 300);

			el.classList.remove('open');
			$rootScope.feedbackVisible = false;

			if(track)
			{
				$rootScope.trackEvent('Feedback', 'Close');
			}

			if(Keyboard && Keyboard.hide)
			{
				Keyboard.hide();
			}

			el.style.removeProperty('transform');
		}
	}

	$rootScope.reviewFeedbackVisible = false;

	// show after finishing first exam
	// show after 3 successful trades in a row
	// if rate us or send feedback clicked before that, then do not show this
	// unless manually clicked from settings
	$rootScope.toggleReviewFeedback = function(location)
	{
		if(typeof location != "undefined")
		{
			if(location != 'close')
			{
				$rootScope.trackEvent('Review_Popup', 'Open_' + location ? location : '');

				if(location == 'settings')
				{
					if(window.device.platform == 'iOS')
					{
						$rootScope.trackEvent('Review_Popup', 'IOS_' + location ? location : '');
						$rootScope.openRate('ios_settings');
						return;
					}

					window.localStorage.rateUsManuallyOpened = true;
				}
				else
				{
					if(window.localStorage.rateUsManuallyOpened)
					{
						return;
					}
				}
			}
			else
			{
				$rootScope.trackEvent('Review_Popup', 'Close');
			}
		}
		else
		{
			// console.log('just auto closing);
		}

		var el = window.document.querySelectorAll('#review-feedback')[0];
		var appElm = angular.element(document.getElementById('app'));

		if(!$rootScope.reviewFeedbackVisible || $rootScope.reviewFeedbackVisible == false)
		{
			el.classList.add('open');
			appElm.addClass('state-rate-us');
			$rootScope.reviewFeedbackVisible = true;
		}
		else
		{
			el.classList.remove('open');
			appElm.removeClass('state-rate-us');
			$rootScope.reviewFeedbackVisible = false;

			el.style.removeProperty('transform');
		}
	}

	$rootScope.closeReviewFeedbackForce = function()
	{
		if($rootScope.reviewFeedbackVisible)
		{
			var el = window.document.querySelectorAll('#review-feedback')[0];
			var appElm = angular.element(document.getElementById('app'));
			el.classList.remove('open');
			appElm.removeClass('state-rate-us');
			$rootScope.reviewFeedbackVisible = false;

			el.style.removeProperty('transform');
		}
	}

	$rootScope.closeReviewOpenFeedback = function()
	{
		$rootScope.trackEvent('Review_Popup', 'Sad');
		$rootScope.toggleReviewFeedback();
		window.setTimeout(function()
		{
			$rootScope.toggleFeedback();
		}, 200);
	}

	$rootScope.closeReviewOpenRate = function()
	{
		$rootScope.trackEvent('Review_Popup', 'Happy');
		$rootScope.toggleReviewFeedback();
		window.setTimeout(function()
		{
			$rootScope.toggleHappyRate();
		}, 200);
	}

	$rootScope.toggleHappyRate = function(track)
	{
		if(track)
		{
			$rootScope.trackEvent('Review_Popup_Happy', 'Close');
		}

		var el = window.document.querySelectorAll('#review-happy-rate')[0];
		var appElm = angular.element(document.getElementById('app'));

		if(!$rootScope.reviewHappyRateVisible || $rootScope.reviewHappyRateVisible == false)
		{
			el.classList.add('open');
			appElm.addClass('state-rate-us');
			$rootScope.reviewHappyRateVisible = true;
		}
		else
		{
			el.classList.remove('open');
			appElm.removeClass('state-rate-us');
			$rootScope.reviewHappyRateVisible = false;

			el.style.removeProperty('transform');
		}
	}

	$rootScope.closeHappyRate = function(track)
	{
		if(!$rootScope.reviewHappyRateVisible)
		{
			return;
		}

		if(track)
		{
			$rootScope.trackEvent('Review_Popup_Happy', 'Close');
		}

		var el = window.document.querySelectorAll('#review-happy-rate')[0];
		var appElm = angular.element(document.getElementById('app'));

		el.classList.remove('open');
		appElm.removeClass('state-rate-us');
		$rootScope.reviewHappyRateVisible = false;

		window.setTimeout(function()
		{
			el.style.bottom = '0px';
			$rootScope.forceClosePopup = false;
		}, 500);
	}

	$rootScope.rateHappy = function()
	{
		$rootScope.closeHappyRate();
		$rootScope.openRate('rate-us-slideup');
	}

	$rootScope.helpVisible = false;

	$rootScope.helpStep = 1;
	$rootScope.helpStepArray = ["", "", "", "", "", ""];

	$rootScope.showHelp = function()
	{
		$rootScope.trackEvent("Settings_How_To_Use");
		$rootScope.helpStep = 1;
		if(window.location.hash != '#/tab/play')
		{
			$ionicViewSwitcher.nextDirection("enter");
			$state.go('tab.play');
		}

		$timeout(function()
		{
			$rootScope.helpVisible = true;
			$rootScope.$broadcast('$$rebind::positions');
			$rootScope.$broadcast('$$rebind::curr');

			$timeout(function()
			{
				angular.element(document.body).addClass('help-step-' + $rootScope.helpStep);
				adjustTooltipHeight();
			});
		});
	}

	$rootScope.closeHelp = function()
	{
		$rootScope.trackEvent("Settings_How_To_Use_Done");
		angular.element(document.body).removeClass('help-step-' + $rootScope.helpStep);
		$rootScope.helpVisible = false;
		$rootScope.$broadcast('closed-how-to');
		$rootScope.$broadcast('$$rebind::positions');
		$rootScope.$broadcast('$$rebind::curr');
		window.localStorage.helpSeen = true;

	}

	$rootScope.nextHelpStep = function()
	{
		if($rootScope.helpStep >= 6)
		{
			$rootScope.closeHelp();
			return;
		}

		angular.element(document.body).removeClass('help-step-' + $rootScope.helpStep);
		$rootScope.helpStep++;
		angular.element(document.body).addClass('help-step-' + $rootScope.helpStep);

		adjustTooltipHeight();

		// if($rootScope.helpStep == 6)
		// {
		// 	$timeout(function()
		// 	{
		// 		angular.element(window.document.querySelector('.chartTypeSwitch')).triggerHandler('click');
		// 	});
		// }
	}

	function adjustTooltipHeight()
	{
		var relElList = ['.nav-bar-block', '.swiper-wrapper', '.instrument-header .instrument-price', '.bottom-container', '[symbol=' + window.localStorage.activeCurrency + '] .chartPeriodSelect', '[symbol=' + window.localStorage.activeCurrency + '] .chartPeriodSelect'];
		var i = 0;

		if($rootScope.helpStep > 1)
		{
			var prevElSelector = '.step-'.concat($rootScope.helpStep - 1);
			var prevEl = angular.element(window.document.querySelectorAll(prevElSelector)[0]);
			prevEl.css({transition: 'none'});
		}

		$timeout(function()
		{
			if($rootScope.helpStep == 0)
			{
				i = window.document.querySelectorAll(relElList[$rootScope.helpStep - 1]).length - 1;
			}

			$timeout(function()
			{
				var relElData = window.document.querySelectorAll(relElList[$rootScope.helpStep - 1])[i].getBoundingClientRect();
				var y = relElData.y;
				var height = relElData.height;

				var elSelector = '.step-'.concat($rootScope.helpStep);
				var el = angular.element(window.document.querySelectorAll(elSelector)[0]);

				el.css({transition: 'top 0.1s'});

				if(el)
				{
					if($rootScope.helpStep == 2)
					{
						var calcY = y + height + (document.body.offsetWidth / 100 * 3);
						el.css({top: calcY + 'px'});
					}
					else if($rootScope.helpStep == 4)
					{
						var offsetY = window.document.querySelector('.step-4 .tooltip-container').clientHeight;
						var calcY = y - (document.body.offsetWidth / 100 * 10) - offsetY;
						el.css({top: calcY + 'px'});
					}
					else if($rootScope.helpStep == 5 || $rootScope.helpStep == 6)
					{
						var calcY = y + height + (document.body.offsetWidth / 100 * 6);
						el.css({top: calcY + 'px'});
					}
					else
					{
						var calcY = y + height + (document.body.offsetWidth / 100 * 5);
						el.css({top: calcY + 'px'});
					}
				}
			});
		}, 100);
	}

	if(window.device)
	{
		var log = JSON.parse(JSON.stringify(window.device));
	}
	else
	{
		var log = 'no info';
	}

	$rootScope.commentText = {t: '', happy: 2, app: 'goforex', appVersion: window.currentAppVersion || 0, deviceInfo: log};

	$rootScope.sendComment = function()
	{
		if($rootScope.isSendingComment)
		{
			return;
		}

		var reviewType = 'Happy';
		if($rootScope.commentText.happy == 0)
		{
			reviewType = 'Sad';
		}
		else if($rootScope.commentText.happy == 2)
		{
			reviewType = 'Neutral';
		}

		var el = document.querySelectorAll('#feedback-textarea')[0];
		if(el && el.value && el.value.length < 4 || el.value == '')
		{
			$rootScope.isSendingComment = false;
			$rootScope.showRequirement = true;
			var requirementT = $timeout(function()
			{
				$rootScope.showRequirement = false;
			}, 2000);
			return;
		}

		$rootScope.isSendingComment = true;

		if (Keyboard && Keyboard.hide)
		{
			Keyboard.hide();
		}

		if($rootScope.commentText && !$rootScope.commentText.t)
		{
			if(el && el.value)
			{
				$rootScope.commentText.t = el.value;
			}
		}

		API.get('comment', {comment: $rootScope.commentText.t, happy: $rootScope.commentText.happy, app: 'goforex', appVersion: $rootScope.commentText.appVersion, log: $rootScope.commentText.deviceInfo}, function(res)
		{
			$rootScope.trackEvent("Feedback", "Sent", reviewType);
			$rootScope.isSendingComment = false;
			$rootScope.isCommentVisible = false;
			$rootScope.commentText.t = '';

			if($rootScope.commentText.happy == 1)
			{
				var template = '</div><span class="icon-thanks"></span><h2>' + $rootScope.t('Thank You!') + '</h2><p>' + $rootScope.t('It is our pleasure to hear your valuable feedback. We are letting you know it may take us up to 24 hours to respond.') + '</p><p>' + $rootScope.t('If you haven’t rated our Go Forex app yet, please do so. It means a lot to us!') + '</p><span class="icon-stars"></span>';
				var buttons = [{ text: $rootScope.t('Rate on the appstore'), type: 'button-blue', },
				{
					text: '',
					onTap: function(e)
					{
						$rootScope.forceClosePopup = true;
						return;
					},
					type: 'button-cancel'
				}];
			}
			else
			{
				var template = '<span class="icon-message"></span><h2>' + $rootScope.t("Message Received!") + '</h2><p>' + $rootScope.t('On working days, we usually respond within 24 hours. For non-English-speaking users, we will try to reply as best as we can.<br>Thank you.') + '</p>';
				var buttons = [{ text: $rootScope.t('OK'), type: 'button-blue' },
				{
					text: '',
					onTap: function(e)
					{
						return;
					},
					type: 'button-cancel'
				}];
			}

			var iPopup = $ionicPopup.confirm({
				title: '',
				scope: $rootScope,
				cssClass: 'tradeAlert messageSent',
				buttons: buttons,
				template: template
			})
			.then(function()
			{
				window.localStorage.offeredToReviewApp = true;
				$rootScope.toggleFeedback();

				if($rootScope.commentText.happy == 1 && !$rootScope.forceClosePopup)
				{
					$rootScope.openRate('rate_feedback_happy');
				}
			});
		});
	};

	$rootScope.openRate = function(location)
	{
		if(location == 'rate-us-slideup')
		{
			$rootScope.trackEvent("Review_Popup_Rate");
			location = 'settings';
		}
		else
		{
			$rootScope.trackEvent("Rate", location);
		}

		$rootScope.openLink('https://financeillustrated.com/goforex/index.php', 'rate_ ' + location);
	};

	$rootScope.getReward = function(id)
	{
		var text = '';

		if (window.rewards[id])
		{
			text = $rootScope.t('Collect') + ' <span class="reward-info">$' + CanvasJS.formatNumber(window.rewards[id], "#") + '</span>';
		}
		else
		{
			// if (11 == id)
			// {
			// 	text = $rootScope.t('Unlock candlestick charts');
			// }
		}

		return $sce.trustAsHtml(text);
	};

	$rootScope.getDuration = function(id)
	{
		var text = '';

		if (window.lessonDurations[id])
		{
			text =  window.lessonDurations[id] + ' -';
		}
		else
		{
			text = '4 min' + ' -';
		}

		return $sce.trustAsHtml(text);
	};

	$rootScope.$on('user-invited', function(event, id, inviteVerification)
	{
		function processInvitedUser()
		{
			Mongo.getCached(function(user)
			{
				// console.log('user has been invited by ' + id, inviteVerification);
				Mongo.addFriend(user.firebaseKeyId, {userId: id, inviteVerification: inviteVerification}).then(function()
				{
					console.log('added friend');

					$rootScope.$broadcast('user-invited-success');
				}).catch(function(error)
				{
					console.log('error adding friend', error);
				});
			}, function(error)
			{
				console.log('no user yet');
				$timeout(function()
				{
					processInvitedUser();
				}, 1000);
			});
		}

		processInvitedUser();
	});

	var setupAnswers = [];

	function saveSetupAnswers()
	{
		try
		{
			Mongo.addQuizAnswers("0001", JSON.parse(window.localStorage.setupAnswers)).then(function(succ)
			{
				window.localStorage.setupAnswersSaved = true;
			}).catch(function(err)
			{
				console.log('err?', err);
			});
		}
		catch(e)
		{
			console.log('parse error?', e);
		}
	}

	$rootScope.currentSetupQuestion = 0;
	$rootScope.settingUpScreen = false;

	$rootScope.setAnswer = function(index)
	{
		if($rootScope.currentSetupQuestion != 0)
		{
			setupAnswers.push(index);
		}

		if($rootScope.currentSetupQuestion >= ($rootScope.setupQuestions.length - 1))
		{
			window.localStorage.setupAnswers = JSON.stringify(setupAnswers);
			window.localStorage.setupAnswersDone = true;
			saveSetupAnswers();
			$rootScope.settingUpScreen = true;

			if(setupAnswers.length)
			{
				var assetChoice = setupAnswers[setupAnswers.length - 1];
				if(assetChoice == 0)
				{
					// BTC, APPLE, COIN, MCD, AMAZON
					window.localStorage.activePairs = JSON.stringify(['BTCUSD', 'AAPUSD', 'COIUSD', 'MCDUSD', 'AMZUSD']);
				}
				else if(assetChoice == 1)
				{
					// EUR/USD, BTC, GOLD, OIL, USD/GBP
					window.localStorage.activePairs = JSON.stringify(['EURUSD', 'BTCUSD', 'XAUUSD', 'OILUSD', 'GBPUSD']);
				}
				else if(assetChoice == 2)
				{
					// BTC, SP500, FTSE, GER30
					window.localStorage.activePairs = JSON.stringify(['BTCUSD', 'SPXUSD', 'FTSGBP', 'GEREUR', 'NDQUSD']);
				}
				else
				{
					// window.appConfig.defaultPairs
				}

				$rootScope.$broadcast('reset-pairs');
			}

			// finish setting up screen
			$timeout(function()
			{
				//animation
				document.getElementById('app-setup').style.opacity = 0;

				$timeout(function()
				{
					document.getElementById('app-setup').style.display = 'none';
					$rootScope.settingUpScreen = false;
				}, 200);

				$rootScope.appSetupActive = false;
			}, 2000);
		}
		else
		{
			$rootScope.currentSetupQuestion = $rootScope.currentSetupQuestion + 1;
		}
	};

	if(window.localStorage.setupAnswers && !window.localStorage.setupAnswersSaved)
	{
		window.setTimeout(function()
		{
			saveSetupAnswers();
		}, 5000);
	}

	$rootScope.backRoute = function()
	{
		if ('lessons' == $rootScope.screen)
		{
			return '#/tab/play';
		}

		var bw = $ionicHistory.backView();

		if (bw && (bw.stateName == 'tab.lessons-read'))
		{
			return function()
			{
				LessonOpener.open(bw.stateParams.lessonId);
			}
		}

		if ('tab.play' == _.get(bw, 'stateName'))
		{
			return '#/tab/play';
		}

		if ('top' == $rootScope.screen)
		{
			return '#/tab/play';
		}
		else if ('lessonsread' == $rootScope.screen)
		{
			if (bw && (bw.stateName == 'tab.play'))
			{
				return '#/tab/play';
			}
			else if (bw && (bw.stateName == 'tab.game'))
			{
				return '#/tab/game';
			}
			else
			{
				return '#/tab/lessons';
			}
		}
		else if ('quizplay' == $rootScope.screen)
		{
			return '#/tab/game';
		}
		else
		{
			return '#/tab/play';
		}
	};

	var navigationItems = ['play', 'lessons', 'top', 'usertop', 'pro', 'analyze'];
	$rootScope.currLocationIndex = 0;

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		var toHash = toState.url;

		if(toState.url[0] == '/')
		{
			toHash = toHash.substr(1);
		}

		if(toHash != 'play')
		{
			$timeout(function()
			{
				LoaderOverlay.hide();
			}, 100);
		}

		switch(toHash)
		{
			case 'top':
				$rootScope.setScreen('top', $rootScope);
				$rootScope.trackView('Top 10');

				if(fromState && fromState.url && fromState.url.length > 1)
				{
					var fromHash = fromState.url.substr(1);

					if(fromHash.startsWith('lessons') && fromParams && fromParams.lessonId)
					{
						fromHash = 'lesson_' + fromParams.lessonId;
					}

					$rootScope.trackEvent('Brokers', fromHash);
				}

				$rootScope.trackEvent('Brokers');
				$ionicSideMenuDelegate.canDragContent(false);
			break;
			case 'lessons':
				$rootScope.setScreen('lessons', $rootScope);
				$rootScope.trackView('Lessons');
				$rootScope.trackEvent('Lessons');
			break;
			case 'account':
				$rootScope.setScreen('account', $rootScope);
				$rootScope.trackView("Account");
				$rootScope.trackEvent("Account");
			break;
			case 'play':
				$rootScope.setScreen('play', $rootScope);
				$rootScope.trackView("Play");
				$rootScope.trackEvent("Play");
			break;
			case 'game':
				$rootScope.setScreen('quiz', $rootScope);
				$rootScope.trackView("Quiz");
				$rootScope.trackEvent("Quiz");
			break;
			case 'usertop':
				$rootScope.setScreen('usertop', $rootScope);
				$rootScope.trackView("User Top");
				$rootScope.trackEvent("User Top");
			break;
			case 'pro':
				$rootScope.setScreen('pro', $rootScope);
				$rootScope.trackView("Pro");

				if(fromState && fromState.url && fromState.url.length > 1)
				{
					var fromHash = fromState.url.substr(1);

					if(fromHash.startsWith('lessons') && fromParams && fromParams.lessonId)
					{
						fromHash = 'lesson_' + fromParams.lessonId;
					}

					$rootScope.trackEvent('Pro', fromHash);
				}

				$rootScope.trackEvent("Pro");
			break;
			case 'mission':
				$rootScope.setScreen('mission', $rootScope);
				$rootScope.trackView("Missions");
				$rootScope.trackEvent("Missions");
			break;
			case 'analyze':
				$rootScope.setScreen('analyze', $rootScope);
				$rootScope.trackView("Analyze");
				$rootScope.trackEvent("Analyze");
			break;
		}

		$rootScope.currLocationIndex = navigationItems.indexOf(toHash) || 0;
	});
})

.config(function($stateProvider, $urlRouterProvider, $timeoutProvider, $ionicConfigProvider) {

	$ionicConfigProvider.views.swipeBackEnabled(false);

	$ionicConfigProvider.views.forwardCache(true);

	document.addEventListener("deviceready", function(){
		window.setTimeout(function()
		{
			if(!window.device.platform == 'iOS') $ionicConfigProvider.scrolling.jsScrolling(false);
		}, 100)
	});

	//$ionicConfigProvider.views.transition('none');

	//~ $ionicConfigProvider.views.maxCache(0);

	var lessonsRead = 'lessons-read.html';

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
  	url: "/tab",
  	abstract: true,
  	templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  // .state('tab.dash', {
  // 	url: '/dash',
  // 	templateUrl: 'templates/tab-dash.html',
  // 	controller: 'DashCtrl',
  // 	cache: true
  // }
  // )

  .state('tab.lessons', {
  	url: '/lessons',
  	templateUrl: 'templates/tab-lessons.html',
  	controller: 'LessonsCtrl',
  	cache: false
  })
  .state('tab.lessons-read', {
  	url: '/lessons/:lessonId',
  	templateUrl: 'templates/' + lessonsRead,
  	controller: 'LessonsReadCtrl',
  	cache: false
  })
  .state('tab.lessons-finish', {
  	url: '/lessonsfinish',
  	templateUrl: 'templates/lessons-finish.html',
  	controller: 'LessonsFinishCtrl'
  })

  .state('tab.game', {
  	url: '/game',
  	templateUrl: 'templates/tab-game.html',
  	controller: 'GameCtrl',
  	cache: false
  })
  .state('tab.game-play', {
  	url: '/game/:category',
  	templateUrl: 'templates/game-play.html',
  	controller: 'GamePlayCtrl',
  	cache: false
  })

  .state('tab.top', {
  	url: '/top',
  	templateUrl: 'templates/tab-top.html',
  	controller: 'TopCtrl',
  	cache: true
  })

  .state('tab.play', {
  	url: '/play',
  	cache: true,
  	templateUrl: 'templates/tab-play.html',
  	controller: 'PlayCtrl'
  })

  .state('tab.account', {
  	url: '/account',
  	templateUrl: 'templates/tab-account.html',
  	controller: 'AccountCtrl',
  	cache: true
  })

  .state('tab.feedback', {
  	url: '/feedback',
  	templateUrl: 'templates/tab-feedback.html',
  	controller: 'FeedbackCtrl',
  	cache: false
  })

  .state('tab.usertop', {
  	url: '/usertop',
  	templateUrl: 'templates/tab-usertop.html',
  	controller: 'UserTopCtrl',
  	cache: true
  })

  .state('tab.pro', {
  	url: '/pro',
  	templateUrl: 'templates/tab-pro.html',
  	controller: 'ProCtrl',
  	cache: true
  })

  .state('tab.mission', {
  	url: '/mission',
  	templateUrl: 'templates/tab-mission.html',
  	controller: 'MissionCtrl',
  	cache: false
  })

  .state('tab.analyze', {
  	url: '/analyze',
  	templateUrl: 'templates/tab-analyze.html',
  	controller: 'AnalyzeCtrl',
  	cache: true
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/play');

  window.setTimeout(function()
  {
  	$urlRouterProvider.otherwise('/tab/play');
  }, 1000);

})

.constant('FIREBASE', 'https://gofx.firebaseio.com/')

.service('ChartRef', function() {

  return firebase.database(firebase.app('charts'));
})

.service('FirebaseStorageRef', function() {

  return firebase.storage(firebase.app('charts'));
})

;


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;

	input = Base64._utf8_encode(input);

	while (i < input.length) {

		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output +
		this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
		this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

	}

	return output;
},

// public method for decoding
decode : function (input) {
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	while (i < input.length) {

		enc1 = this._keyStr.indexOf(input.charAt(i++));
		enc2 = this._keyStr.indexOf(input.charAt(i++));
		enc3 = this._keyStr.indexOf(input.charAt(i++));
		enc4 = this._keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}

	}

	output = Base64._utf8_decode(output);

	return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {

		var c = string.charCodeAt(n);

		if (c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}

	}

	return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
	var string = "";
	var i = 0;
	var c = c1 = c2 = 0;

	while ( i < utftext.length ) {

		c = utftext.charCodeAt(i);

		if (c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i+1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i+1);
			c3 = utftext.charCodeAt(i+2);
			string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			i += 3;
		}

	}

	return string;
}

};

function replaceAll(str,mapObj){
	var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

	return str.replace(re, function(matched){
		return mapObj[matched.toLowerCase()];
	});
};

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