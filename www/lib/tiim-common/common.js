angular.module('tiim', [])

.run(function($rootScope, ChartRef, ChartData, CandleData, $timeout, $interval, FireStorage, PortfolioTitle, $filter, $ionicHistory, $ionicLoading, UsageStats, $cordovaDevice, RenderedLessons, $state, LessonOpener, $http, Mongo, API, OnlineStatus, LoaderOverlay) {

	// document.addEventListener("pause", () => {window.commonPause();}, false);
	window.commonPause = function()
	{
		window.isPaused = true;
		$rootScope.goOffline();
	};

	// document.addEventListener("resume", () => {window.commonResume();}, false);
	window.commonResume = function()
	{
		window.isPaused = false;
		$rootScope.goOnline();
	};

	$rootScope.screen = 'home';

	$rootScope.devWidth = ((window.innerWidth > 0) ? window.innerWidth : screen.width);

	var navBarClassIntv = null;
	var navBar = null;
	var navBottom = null;
	$rootScope.setScreen = function(screen)
	{
		if (!navBar || !navBar.parentNode)
		{
			navBar = document.getElementsByTagName('ion-nav-bar')[0];

			if(!navBar)
			{
				console.log('no navbar, cannot set screen name');
				$timeout(function()
				{
					$rootScope.setScreen(screen);
				}, 100);

				return;
			}
		}

		PortfolioTitle.stop();

		var setScreen = function()
		{
			$rootScope.screen = screen;
			$rootScope.$broadcast('$$rebind::screen');
		};

		navBar.className = screen;

		if(window.isGoforex)
		{
			if (!navBottom || !navBottom.parentNode)
			{
				navBottom = document.getElementById('navigation-wrapper');
			}
			navBottom.className = screen;
		}

		setScreen();
	};

	$rootScope.isRoute = function(key)
	{
		return window.location.hash.indexOf(key) > -1;
	};

	$rootScope.goOffline = function()
	{
		$rootScope.reconnecting = false;
		$rootScope.offlineTimeout = $timeout(function()
		{
			//~ firebase.database().goOffline();
			//~ ChartRef.goOffline();
			ChartData.resetAll();
			CandleData.resetAll();
		}, 5000, false, false);
	};

	$rootScope.goOnline = function()
	{
		if ($rootScope.offlineTimeout)
		{
			$timeout.cancel($rootScope.offlineTimeout);
		}

		$rootScope.reconnecting = true;
		firebase.database().goOnline();
		ChartRef.goOnline();
	};

	$rootScope.isExactRoute = function(key)
	{
		return window.location.hash == '#/' + key;
	};

	$rootScope.trackHome = function(event)
	{
		$rootScope.trackEvent("Navigation", "Home", 'Home');
		if (event && event.stopImmediatePropagation)
		{
			event.stopImmediatePropagation();
		}
	};

	$rootScope.setLocalStorage = function(key, index, value)
	{
		var obj = FireStorage.get(key) || '{}';
		try
		{
			obj = JSON.parse(obj) || {};
		}
		catch (e)
		{
			obj = {};
		}

		obj[index] = value;
		FireStorage.set(key, JSON.stringify(obj));
	};

	$rootScope.getLocalStorage = function(key, index)
	{
		var obj = FireStorage.get(key) || '{}';

		try
		{
			obj = JSON.parse(obj) || {};
			return obj[index];
		}
		catch (e)
		{
			return null;
		}
	};

	$rootScope.t = function(str, params, alt)
	{
		var lang = window.currentLang || 'en';
		var origStr = str;

		str = str.split('\n').join(' ');
		str = str.split('\r').join('');
		str = str.split('\t').join('');

		var str = _.get(window.language, [lang, str]) || str;

		if (alt && (lang != 'en') && (str == origStr))
		{
			str = $rootScope.t(alt);
		}

		if (params)
		{
			var repl = {};
			_.each(params, function(val, key)
			{
				repl['_' + (key + 1)] = val;
			});
			str = replaceAll(str, repl);
		}

		return str;
	};

	$rootScope.getLanguages = function()
	{
		return window.languages;
	};

	$rootScope.getCurrentLang = function()
	{
		return window.currentLang;
	};

	$rootScope.setLang = function(lang, noReload)
	{
		$rootScope.trackEvent("Language", "Change", lang);

		function loadScript(url, callback)
		{
			// Adding the script tag to the head as suggested before
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;

			// Then bind the event to the callback function.
			// There are several events for cross browser compatibility.
			script.onreadystatechange = callback;
			script.onload = callback;
			script.onerror = callback;

			// Fire the loading
			head.appendChild(script);
		}

		if (!lang)
		{
			lang = window.currentLang;
		}

		if (noReload)
		{
			loadScript('js/training/' + lang + '.js', function()
			{
				RenderedLessons.clearCache();

				$timeout(function()
				{
					$ionicHistory.clearCache();
					$ionicHistory.clearCache([$state.current.name]).then(function() {
						if(window.isGoforex)
						{
							$state.go('tab.play', {}, {reload: true});
						}
						else
						{
							$state.go('tab.dash', {}, {reload: true});
						}
					});
				}, 100);

				$ionicHistory.nextViewOptions({
					disableAnimate: true
				});

				$rootScope.reloadSideMenu = true;
				$rootScope.$broadcast('$$rebind::lang');
				$timeout(function() {
					$rootScope.$apply();
					$rootScope.reloadSideMenu = false;
					$rootScope.$broadcast('$$rebind::lang');

					$rootScope.setScreen('home');
					$interval(function()
					{
						$rootScope.setScreen('home');
						PortfolioTitle.start();
					}, 100, 10);
				});
			});
		}

		window.localStorage.language = lang;
		window.currentLang = lang;
		$rootScope.currentLang = lang;

		if (!noReload)
		{
			window.location.reload();
		}
	};

	$rootScope.openLink = function(link, source)
	{
		var tmp = document.createElement ('a');
		tmp.href = link;

		var category = "Link";
		if(source)
		{
			category = category + "_" + source;
		}

		$rootScope.trackEvent(category);

		var customLinks = window.localStorage.linkRetargetingResult;
		if(customLinks && customLinks != 'undefined' && customLinks != '')
		{
			// might make _DEVICEID_ not add window.device.uuid depending on the link we're changing it to, not sure if we'll need it still though
			try {
				var customLinksJson = JSON.parse(customLinks);
				// console.log('customLinksJson: ', customLinksJson);
				if(customLinksJson[link])
				{
					// console.log('changing link from: ', link, ' to: ', customLinksJson[link]);
					link = customLinksJson[link];
					var retargetingSource = window.localStorage.linkRetargetingSource;
					if(retargetingSource)
					{
						var lastPart = retargetingSource.split('_').pop();
						$rootScope.trackEvent(category, lastPart);
					}
				}
			} catch (error) {
				console.log('Error parsing customLinksJson: ', error);
			}
		}

		if (window.device)
		{
			link = link.split('_DEVICEID_').join(window.device.uuid);
			var log = JSON.parse(JSON.stringify(window.device));
			log.date = firebase.database.ServerValue.TIMESTAMP;
			log.link = link;
			firebase.database().ref('clicks').push(log);
		}

		// avoid browser caching
		if(link.indexOf('?') > -1)
		{
			link = link.concat('&').concat(new Date().getTime());
		}
		else
		{
			link = link.concat('?').concat(new Date().getTime());
		}

		// console.log('would open', link);

		if (window.cordova)
		{
			cordova.InAppBrowser.open(link, '_system', 'location=yes');
		}
		else
		{
			window.location.href = link;
		}
	};

	$rootScope.openLinkTest = function(link, source)
	{
		var tmp = document.createElement ('a');
		tmp.href = link;

		$rootScope.trackEvent("select_content", "link_open", link);
		$rootScope.trackEvent("Domain", "Open", tmp.hostname);

		if (window.device)
		{
			link = link.split('_DEVICEID_').join(window.device.uuid);
			var log = JSON.parse(JSON.stringify(window.device));
			log.date = firebase.database.ServerValue.TIMESTAMP;
			log.link = link;
			firebase.database().ref('clicks').push(log);
		}

		if (window.cordova)
		{
			cordova.InAppBrowser.open(link, '_system', 'location=yes');
		}
		else
		{
			window.location.href = link;
		}
	};

	$rootScope.backRoute = function()
	{
		if ('lessons' == $rootScope.screen)
		{
			return '#/tab/dash';
		}

		var bw = $ionicHistory.backView();

		if (bw && (bw.stateName == 'tab.lessons-read'))
		{
			return function()
			{
				LessonOpener.open(bw.stateParams.lessonId);
			}
			//~ return '#/tab/lessons/' + bw.stateParams.lessonId;
		}

		if ('top' == $rootScope.screen)
		{
			return '#/tab/dash';
		}
		else if ('lessonsread' == $rootScope.screen)
		{
			if (bw && (bw.stateName == 'tab.dash'))
			{
				return '#/tab/dash';
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
			return '#/tab/dash';
		}
	};

	$rootScope.trackEvent = function(Category, Action, Label, Value, Source)
	{
		var combined = Category;
		if(Action) combined += '_' + Action;
		if(Label) combined += '_' + Label;
		if(Value) combined += '_' + Value;
		if(Source) combined += '_' + Source;

		// remove all spaces from string
		combined = combined.replace(/ /g,'');

		if (window.analytics)
		{
			if(combined)
			{
				window.analytics.trackEvent(combined);
			}
			else
			{
				window.analytics.trackEvent(Category, Action, Label, Value);
			}
		}

		if (window.plugins && window.plugins.appsFlyer)
		{
			if(combined)
			{
				window.plugins.appsFlyer.logEvent('Event', {'custom': combined}, null, null);
			}
			else
			{
				window.plugins.appsFlyer.logEvent('Event', {type: Category + ' - ' + Action, value: Label + (Value ? ' - ' + Value : '')}, null, null);
			}
		}

		if (window.FirebasePlugin)
		{
			if(combined)
			{
				window.FirebasePlugin.logEvent(combined);
			}
			else
			{
				window.FirebasePlugin.logEvent(Category, {action: Action, label: Label, value: Value});
			}
		}

		if (window.facebookConnectPlugin)
		{
			var evt = Category + ' - ' + Action;
			evt = evt.replace(/[^A-Za-z0-9_\- ]/g, '');
			window.facebookConnectPlugin.logEvent(evt, {label: Label, value: Value}, 0/*, function() { console.log('fb event success'); }, function() { console.log('fb event failure'); }*/);
		}

		if (window.mixpanel) {
			window.mixpanel.track(Category, {action: Action, label: Label, value: Value});
		}
	};

	$rootScope.trackPurchase = function(event, object)
	{
		if (window.FirebasePlugin)
		{
			window.FirebasePlugin.logEvent(event, object);
		}

		if (window.plugins && window.plugins.appsFlyer)
		{
			window.plugins.appsFlyer.logEvent(event, object, null, null);
		}
	}

	$rootScope.trackEventTest = function(type, link, source)
	{
	};

	$rootScope.trackView = function(ScreenTitle)
	{
		if (window.analytics)
		{
			window.analytics.trackView(ScreenTitle);
		}

		if (window.FirebasePlugin)
		{
			window.FirebasePlugin.logEvent("page_view", {page: ScreenTitle});
		}

		if (window.plugins && window.plugins.appsFlyer && window.plugins.appsFlyer.trackEvent)
		{
			window.plugins.appsFlyer.trackEvent('View', {title: ScreenTitle});
		}

		if (window.mixpanel) {
			window.mixpanel.track('View', {title: ScreenTitle});
		}
	};

	$rootScope.formatRate = function(rate, maxLen)
	{
		maxLen = maxLen || 7;

		if (!rate)
		{
			return '0';
		}
		else if (rate >= 1000)
		{
			return $filter('number')(rate, 2);
		}
		else
		{
			return (rate.toString() + (rate % 1 ? '0000' : '')).substr(0, maxLen);
		}
	};

	document.addEventListener('deviceready', function() {
		if (window.device)
		{
			$timeout(function()
			{
				if(!window.device.uuid && !window.device.platform)
				{
					if(window.navigator && window.navigator.platform == 'Win32')
					{
						window.device.uuid = '96F455B6-7DC8-4094-ADEA-DB2F5C434B7Fasdasd';
						// window.device.uuid = 'dev-rolis-bug-source';
						// $rootScope.uuid = 'dev-rolis-bug-source';
					}
					else
					{
						window.device.uuid = 'dev-friends';
					}
				}

				$rootScope.uuid = (window.isAppTest ? 'test-' : '') + window.device.uuid;

			}, 1);

			if (window.isAppTest)
			{
				Mongo.resetAccount();
			}
		} else
		{
			// $rootScope.uuid = 'xemulatorq' + ionic.Platform.navigator.productSub + ionic.Platform.navigator.productSub;
			// $rootScope.uuid = 'face bookdev4';
			$rootScope.uuid = '8ca11b45e981638a';
			// $rootScope.uuid = 'a19b01acd981405f';
		}

		// alert($rootScope.uuid);
	}, false);

	$rootScope.$on('$stateChangeStart', function(event, toState, fromState)
	{
		angular.element(document.body).addClass('state-change');
	});

	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
	{
		angular.element(document.body).removeClass('state-change');
		var loading = document.querySelector('.loading-container.visible.active');

		var backdrop = document.querySelector('.backdrop');
		if (backdrop)
		{
			backdrop.innerHTML = '';
		}

		// $timeout(function(){
		// 	if (loading)
		// 	{
		// 		$ionicLoading.hide();
		// 	}
		// },1000);
	});

	setTimeout(function()
	{
		UsageStats.track();
	}, 5);

	var handleOauthLogin = function(current, method, userID, accessToken, loginCallback, userInfo)
	{
		FireStorage.set('oauthMethod', method);
		FireStorage.set('oauthID', userID);
		FireStorage.set('oauthToken', accessToken);

		var callback = function(user) {
			LoaderOverlay.hide();

			if(loginCallback)
			{
				loginCallback();
			}
		};

		var updateUserData = function(usr) {
			console.log('updating', usr);
			// checking if there's already a device connected with this oauth user id
			firebase.database().ref('oauthid').child(userID).once("value", function(snap)
			{
				var existingDeviceID = snap.val();

				var updateMongo = function() {
					var upd = {name: usr.name, oauthID: userID, oauthMethod: method, email: usr.email || '', token: accessToken};

					if (usr.picture) {
						upd.picture = usr.picture;
					}

					Mongo.update(upd, function() {
						window.location.reload();
					});
				}

				// if no device connected, should stay on the same account
				if (!existingDeviceID)
				{
					firebase.database().ref('oauthid').child(userID).set(current.firebaseKeyId);
					Mongo.setOauthID(function(uid)
					{
						Mongo.get(function(user)
						{
							var update = {};
							update[uid] = user.firebaseKeyId;
							(firebase.database().ref('oauth')).update(update, function()
							{
								updateMongo();
								callback(user);
							});
						});
					});
				}
				else
				{
					console.log('different account?');
					Mongo.setUserId(existingDeviceID);
					Mongo.get(function(newUser)
					{
						Mongo.setOauthID(function(uid)
						{
							updateMongo();
							callback(newUser);
						});
					});
				}
			}, function(error)
			{
				console.log('setting oauthid error?', error);
				OnlineStatus.setLoginState(false);
			});
		}

		if (userInfo) {
			updateUserData(userInfo)
		} else if ('facebook' == method) {
			$http.get('https://graph.facebook.com/' + userID + '?fields=name,email,picture.type(large)&access_token=' + accessToken).then(function(res)
			{
				var upd = {name: res.data.name, email: res.data.email};

				if(res.data.picture)
				{
					upd.picture = res.data.picture.data.url;
				}

				// deprecated: graph image does not work anymore
				// unless that's because app is deactivated atm in facebook dev
				// if (res.data.picture && res.data.picture.data && !res.data.picture.data.is_silhouette) {
				// 	var url = res.data.picture.data.url;

				// 	if (url.indexOf('platform-lookaside.fbsbx.com')) {
				// 		var asid = url.split('?asid=').pop().split('&').shift();
				// 		url = 'https://graph.facebook.com/' + asid + '/picture?type=large';
				// 	}

				// 	upd.picture = url;
				// }

				updateUserData(upd);
			});
		}
	};

	$rootScope.oauthLogin = function(method, callback)
	{
		$rootScope.trackEvent("Login", method);
		// if(!$ionicLoading._getLoader().$$state.status)
		// {
			LoaderOverlay.forceShow();
		// }

		var firebaseAuthProvider = null;
		var pluginAuthHandler = null;

		var errorHandler = function(error)
		{
			LoaderOverlay.hide();
			OnlineStatus.setLoginState(false);
		};

		OnlineStatus.setLoginState(true);

		if ('facebook' == method) {
			if (!window.facebookConnectPlugin) {
				firebaseAuthProvider = new firebase.auth.FacebookAuthProvider();
				firebaseAuthProvider.addScope('email');
				firebaseAuthProvider.addScope('public_profile');
			} else {
				pluginAuthHandler = function(user) {
					facebookConnectPlugin.login(
						['email', 'public_profile'],
						function(success)
						{
							handleOauthLogin(user, 'facebook', success.authResponse.userID, success.authResponse.accessToken, callback);
						},
						errorHandler
					);
				}
			}
		} else if ('google' == method) {
			// TODO: test again if this works on ios with these changes.
			if (typeof FirebasePlugin != 'undefined')
			{
				pluginAuthHandler = function(user) {
					var googleWebClientID = window.appConfig.googleWebClientID || '932740909364-hs536bqsitc1u3odipdb0na9cbff4724.apps.googleusercontent.com';
					FirebasePlugin.authenticateUserWithGoogle(googleWebClientID, function(credential) {
						FirebasePlugin.signInWithCredential(credential, function() {
							API.get('getGoogleData', {idToken: credential.idToken}, function(res)
							{
								var data = res;
								if(!data.sub || !data.email || !data.name || !data.picture)
								{
									return errorHandler('Google data incomplete');
								}

								handleOauthLogin(user, method, data.sub, credential.idToken, callback, {name: data.name, email: data.email, picture: data.picture || ''});
							});
						}, function(error) {
							console.error("Failed to sign in", error);
						});
					}, function(error) {
						console.error("Failed to authenticate with Google: " + error);
					});

					// window.plugins.googleplus.login(
					// 	{
					// 	  scopes: 'profile email', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
					// 	  webClientId: window.appConfig.googleWebClientID || '932740909364-hs536bqsitc1u3odipdb0na9cbff4724.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
					// 	  offline: true, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
					// 	},
					// 	function (obj) {
					// 		// console.log('success?', obj);
					// 		handleOauthLogin(user, method, obj.userId, obj.accessToken, callback, {name: obj.displayName, email: obj.email, picture: obj.imageUrl});
					// 	},
					// 	function (msg) {
					// 		console.log('error: ' + msg);
					// 	}
					// );
				};
			}
			else
			{
				firebaseAuthProvider = new firebase.auth.GoogleAuthProvider();
			}
		} else if ('apple' == method) {
			if(window.cordova && window.cordova.plugins && window.cordova.plugins.SignInWithApple)
			{
				pluginAuthHandler = function(user) {
					window.cordova.plugins.SignInWithApple.signin(
					  { requestedScopes: [0, 1] },
					  function(obj){

					  	try
					  	{
					  		if(window.localStorage.appleData)
					  		{
					  			var appleData = JSON.parse(window.localStorage.appleData);
					  		}
					  		else
					  		{
								var appleData = {};
					  		}
					  	}
					  	catch (e)
					  	{
					  		console.log(e);
							var appleData = {};
					  	}

					    var email = obj.email;
					    if(user.email)
					    {
							email = user.email;
							appleData.email = email;
						}

						var name;
						if(user.name)
						{
							name = user.name;
						}
						else
						{
							if(obj.fullName)
							{
								if(obj.fullName.nickname)
								{
									name = obj.fullName.nickname;
								}
								else
								{
									if(obj.fullName.givenName)
									{
										name = obj.fullName.givenName;
									}

									if(obj.fullName.familyName)
									{
										if(name)
										{
											name = name + ' ' + obj.fullName.familyName;
										}
										else
										{
											name = obj.fullName.familyName;
										}
									}
								}
							}
							else
							{
								// no name given
								if(appleData.name)
								{
									name = appleData.name;
								}
								else if(user.fiId)
								{
									name = "Trader #" + user.fiId;
								}
							}
						}

						if(name)
						{
							appleData.name = name;
						}

						window.localStorage.appleData = JSON.stringify(appleData);

					    var appleUserId = obj.user.replaceAll('.', '-');
					    var refreshToken;

					    API.get('getRefreshToken', {code: obj.authorizationCode}, function(res)
						{
							refreshToken = res;

							if(refreshToken)
							{
								appleData.refreshToken = refreshToken;
								window.localStorage.appleData = JSON.stringify(appleData);
							}

							if(!name)
							{
								try
								{
									var appleJson = JSON.parse(window.localStorage.appleData);
									if(appleJson && appleJson.name)
									{
										name = appleJson.name;
									}
								} catch (e)
								{
									console.log(e);
								}
							}

							// using refresh token as token. Required for apple sign in revoking.
							// Don't think token is used for login later in this case. At least it's working fine for now like this.
							handleOauthLogin(user, method, appleUserId, refreshToken, callback, {name: name, email: email, picture: obj.imageUrl || ''});
						});
					  },
					  function(err){
					    console.log(JSON.stringify(err));
						OnlineStatus.setLoginState(false);
					  }
					)
				};
			}
			else
			{
				firebaseAuthProvider = new firebase.auth.OAuthProvider('apple.com');
				firebaseAuthProvider.addScope('email');
				firebaseAuthProvider.addScope('name');
			}
		}

		Mongo.get(function(user)
		{
			if (firebaseAuthProvider) {
				firebase.auth().signInWithPopup(firebaseAuthProvider).then(function(authData) {
					console.log('handle login', user, method, authData.user.providerData[0].uid, authData.credential.accessToken, callback, authData.additionalUserInfo);
					handleOauthLogin(user, method, authData.user.providerData[0].uid, authData.credential.accessToken, callback, authData.additionalUserInfo.profile);
				}).catch(errorHandler);
			} else {
				pluginAuthHandler(user);
			}
		});
	};
})

.service('UsageStats', function(FireStorage)
{
	var daysSince = function(key)
	{
		return Math.floor((Date.now() - parseInt(FireStorage.get(key))) / 1000 / 86400);
	};

	var secondsSince = function(key)
	{
		return (Date.now() - parseInt(FireStorage.get(key))) / 1000;
	};

	return {
		track: function()
		{
			if (!FireStorage.get('firstUseDate'))
			{
				FireStorage.set('firstUseDate', Date.now());
				FireStorage.set('checkedOldSub', true);
			}

			var lastUse = FireStorage.get('lastUseDate');
			if (!lastUse || ((Date.now() - lastUse) > 3600 * 1000))
			{
				FireStorage.set('timesOpened', ~~parseInt(FireStorage.get('timesOpened')) + 1);
			}

			var lastUseDay = FireStorage.get('lastUseDay');
			var d = new Date();
			var currentDay = d.getDate() + '-' + (d.getMonth() + 1);
			if (lastUseDay != currentDay)
			{
				FireStorage.set('lastUseDay', currentDay);
				FireStorage.set('daysUsed', ~~parseInt(FireStorage.get('daysUsed')) + 1);
			}

			FireStorage.set('lastUseDate', Date.now());
		},

		sinceFirstUse: function()
		{
			return secondsSince('firstUseDate');
		},

		daysSinceFirstUse: function()
		{
			return daysSince('firstUseDate');
		},

		sinceLastUse: function()
		{
			return secondsSince('lastUseDate');
		},

		daysSinceLastUse: function()
		{
			return daysSince('lastUseDate');
		},

		timesOpened: function()
		{
			return FireStorage.get('timesOpened');
		},

		daysUsed: function()
		{
			return FireStorage.get('daysUsed');
		},

		firstUseDate: function()
		{
			return FireStorage.get('firstUseDate');
		}
	};
})

.service('OnlineStatus', function($timeout, $rootScope, $http, $window)
{
	var watches = [];
	var isConnected = true;
	var connectedTimeout = null;
	var adActive = false;
	var loginActive = false;

	var offlineTimeout = null;

	$rootScope.$watch(
		function () {
			return isConnected;
		}, function(n,o){
			console.log("online status changed ", n);

			var notifyWatches = function(status)
			{
				_.each(watches, function(watch)
				{
					watch(status || window.isOfflineEnabled);
				});

				if (status)
				{
					$rootScope.$emit('online');
				}
			};

			if (n === true) {
				isConnected = true;
				if (connectedTimeout)
				{
					$timeout.cancel(connectedTimeout);
					connectedTimeout = null;
				}
				else
				{
					notifyWatches(true);
				}
			}
			else
			{
				connectedTimeout = $timeout(function()
				{
					isConnected = false;
					notifyWatches(false);
					connectedTimeout = null;
				}, 2000);
			}
		}
	);

	// window.setInterval(function()
	// {
	// 	if (isConnected)
	// 	{
	// 		return;
	// 	}

	// 	$http.get('http://www.geoplugin.net/json.gp').then(function(resp)
	// 	{
	// 		window.setTimeout(function()
	// 		{
	// 			if (!isConnected && !adActive && !loginActive)
	// 			{
	// 				// window.location.reload();
	// 			}
	// 		}, 5000);
	// 	}, function(err)
	// 	{

	// 	});
	// }, 5000);

	var pub = {
	    is: function()
	    {
			return isConnected || window.isOfflineEnabled;
	    },

		addWatch: function(watch)
	    {
			watches.push(watch);
	    },

		markOffline: function() {
			console.error('marking offline');
			if (!offlineTimeout) {
				offlineTimeout = window.setTimeout(function() {
					isConnected = false;
					offlineTimeout = null;
				}, 4000);
			}
		},

		markOnline: function() {
			window.clearTimeout(offlineTimeout);
			offlineTimeout = null;
			isConnected = true;
		},

		setAdState: function(state) {
			adActive = state;
		},

		setLoginState: function(state) {
			loginActive = state;
		},
	};

	var callPing = function() {
		window.setTimeout(function() {
			var currentBaseUrlIndex = window.localStorage.currentBaseUrlIndex || 0;
			var pingUrl = window.appConfig.apiUrlProtocol + window.appConfig.apiUrl[currentBaseUrlIndex] + '?' + Date.now().toString();

			var params = {
				url: pingUrl,
				method: 'GET',
				timeout: 5000
			};

			axios(params).then(function(response) {
				callPing();
				pub.markOnline();
			}).catch(function(error)
			{
				callPing();
				pub.markOffline();
			});
		}, 3000);
	};

	callPing();

	return pub;
})

.service('FireStorage', function($rootScope)
{
	var data = {};

	var ref = null;

	var user = null;

	var waitForUUID = $rootScope.$watch('uuid', function(val)
	{
		if (val)
		{
			waitForUUID();

			ref = firebase.database().ref().child("localStorage").child(val);

			ref.on('value', function(snap)
			{
				val = snap.val();

				if (val)
				{
					data = val;

					_.each(data, function(val, key)
					{
						if (!window.localStorage[key])
						{
							window.localStorage[key] = val;

							if ('oauthID' == key)
                            {
                                user.reloadUser();
                            }
						}
					});
				}
			});
		}
	});

	var self = {
		injectUser: function(Mongo)
		{
			user = Mongo;
		},

		get: function(key)
		{
			var val = window.localStorage[key] || data[key];
			if (val && !data[key])
			{
				this.set(key, val);
			}

			return val;
		},

		set: function(key, value)
		{
			if(!ref)
			{
				window.setTimeout(function()
				{
					self.set(key, value);
				}, 1000);

				return;
			}

			if ('null' == value)
			{
				value = null;
				window.localStorage.removeItem(key);
			}
			else
			{
				window.localStorage[key] = value;
			}

			data[key] = value;

			if (ref)
			{
				ref.child(key).set(value);
			}
		},

		clearOauth: function() {
			self.set('oauthMethod', null);
			self.set('oauthID', null);
			self.set('oauthToken', null);
		}
    };

	return self;
})

.service('VMin', function()
{
    var width = document.body.offsetWidth;
	return function(vmin)
    {
		return (width / 100) * vmin;
	};
})

.directive('t', function($compile, $rootScope)
{
	return {
		restrict: "E",
		scope: true,
		link: function(scope, element, attrs)
		{
			//var newElem = angular.element('<span>{{ t("' + $rootScope.t(element.html()) + '") }}</span>');
			var text = element.html();
			if(!window.isGoforex)
			{
				text = text.split('<br>').join('<br />');
			}
			var trans = $rootScope.t(text, null, attrs.alt);

			_.each(attrs.$attr, function(attrKey)
			{
				trans = trans.split('_' + attrKey).join(attrs[attrKey]);
			});

			if ((trans.indexOf('{{') == -1) && !attrs.af)
			{
				element.on('$destroy', function () { scope.$destroy(); });
			}

			var newElem = angular.element('<span ' + (attrs.af ? 'autofont="true" class="autofont-container"' : '') + '><span>' + trans + '</span></span>');
			newElem = $compile(newElem)(scope);
			element.replaceWith(newElem);
		}
	}
})

.directive('bindHtmlCompile', function ($compile, $timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			scope.$watch(function () {
				return attrs.bindHtmlCompile;
			}, function (value) {
				value = scope.$eval(value);
				element.html(value);
				$compile(element.contents())(scope);
			});

			element.on('$destroy', function () { scope.$destroy(); });
		}
	};
})

.directive('clickOutside', ['$document', '$parse', '$timeout', function clickOutside($document, $parse, $timeout) {
	return {
		restrict: 'A',
		link: function($scope, elem, attr) {

			var fn = $parse(attr['clickOutside']);

			// add the elements id so it is not counted in the click listening
			var classList = [];
			$timeout(function()
			{
				classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.split(' ').join('').split(',') : [];
				if (attr.id !== undefined) {
					classList.push(attr.id);
				}
			}, 0, false);

			var eventHandler = function(e) {

				//check if our element already hiden
				if(angular.element(elem).hasClass("ng-hide") || (!angular.element(elem)[0].clientHeight || !angular.element(elem)[0].clientWidth)){
					return;
				}

				var i = 0,
				element;

				// if there is no click target, no point going on
				if (!e || !e.target) {
					return;
				}

				// loop through the available elements, looking for classes in the class list that might match and so will eat
				for (element = e.target; element; element = element.parentNode) {
					var id = element.id,
					classNames = element.className,
					l = classList.length;

					// Unwrap SVGAnimatedString
					if (classNames && classNames.baseVal !== undefined) {
						classNames = classNames.baseVal;
					}

					// loop through the elements id's and classnames looking for exceptions
					for (i = 0; i < l; i++) {
						// check for id's or classes, but only if they exist in the first place
						if ((id !== undefined && id.indexOf(classList[i]) > -1) || (classNames && classNames.indexOf(classList[i]) > -1)) {
							// now let's exit out as it is an element that has been defined as being ignored for clicking outside
							return;
						}
					}
				}

				// if we have got this far, then we are good to go with processing the command passed in via the click-outside attribute
				return $scope.$applyAsync(function () {
					return fn($scope);
				});
			};

			// assign the document click handler to a variable so we can un-register it when the directive is destroyed
			$document.on('click', eventHandler);

			// when the scope is destroyed, clean up the documents click handler as we don't want it hanging around
			$scope.$on('$destroy', function() {
				$document.off('click', eventHandler);
			});

			elem.on('$destroy', function () { $scope.$destroy(); });
		}
	};
}])

.directive('autofont', function($interval, $timeout) {

	function isOverflowed(element){
		return element.firstChild.offsetHeight > element.offsetHeight || element.firstChild.offsetWidth > element.offsetWidth;
	};

	function getFontSize(element){
		var size = computedStyle(element, 'font-size');
		if(size.indexOf('em') > -1){
			var defFont = computedStyle(document.body, 'font-size');
			if(defFont.indexOf('pt') > -1){
				defFont = Math.round(parseInt(defFont)*96/72);
			}else{
				defFont = parseInt(defFont);
			}
			size = Math.round(defFont * parseFloat(size));
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

	return {
		restrict: 'A',
		link: function(scope, element, attrs)
		{
			var intv = null;
			var resize = function()
			{
				if (!element[0].firstChild || !element[0].firstChild.offsetHeight || (element[0].firstChild.offsetHeight < 16) || element[0].resized)
				{
					//~ console.log('autofont gives up', element[0].innerHTML, element[0].parentNode.clientHeight);
					return;
				}

				element[0].resized = true;
				element[0].style.height = element[0].parentNode.offsetHeight + 'px';
				var size = getFontSize(element[0]);
				if (isOverflowed(element[0]))
				{
					do
					{
						size = size - 1;
						element.css('font-size', size + 'px');
					}
					while (isOverflowed(element[0]) && size > 6);
				}

				element[0].style.height = 'auto';

				if (size)
				{
					$interval.cancel(intv);
					scope.$destroy();

					return true;
				}
			};

			if (!resize())
			{
				intv = $interval(resize, 20, 50, false);

				scope.$on('$destroy', function() {
					$interval.cancel(intv);
				});
			}

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.service('Alert', function($sce, UsageStats, Mongo, $timeout)
{
    var viewed = window.localStorage.getItem('viewedAlerts');
    viewed = viewed ? JSON.parse(viewed) : {};

    var gettingSingleAlert = false;

    return {
		get: function(callback)
		{
			if(gettingSingleAlert)
			{
				console.log('Alerts are busy, return');
				return;
			}

			console.log('Getting user...');

			Mongo.getCached(function(user)
			{
				var ref = firebase.database().ref('alerts').limitToLast(5);
				ref.once('value', function(snap)
				{
					var messages = [];
					_.each(snap.val(), function(alert, key)
					{
						alert.id = key;
						messages.unshift(alert);
					});

					messages = _.sortBy(messages, 'priority').reverse();

					var userAlertsArray = [];
					if(user.alerts)
					{
						var userAlerts = user.alerts;
						for(key in userAlerts)
						{
							userAlertsArray.push(userAlerts[key]);
						}
						for(i in userAlertsArray)
						{
							messages.unshift(userAlertsArray[i]);
						}
					}

					var best = null;

					var ascendingTimeMessages = _.sortBy(messages, function(alert) { return alert.time; });

					console.log(ascendingTimeMessages);

					for (var index = 0; index < ascendingTimeMessages.length; index++) {
						var alert = ascendingTimeMessages[index];

						if (alert.seenAndClosed)
						{
							// console.log(index, 'seen');
							continue;
						}

						if (alert.timestamp && ((new Date(alert.timestamp)) <= (new Date())))
						{
							// console.log(index, 'ts');
							continue;
						}

						if (viewed && viewed[alert.id])
						{
							// console.log(index, 'viewed');
							continue;
						}

						if(!alert.text)
						{
							// console.log(index, 'no text');
							continue;
						}

						if(!alert.title)
						{
							// console.log(index, 'no title');
							continue;
						}

						if (alert.condition)
						{
							try
							{
								eval("var ok = (" + alert.condition + ")");
								if (!ok)
								{
									// console.log(index, 'condition');
									continue;
								}
							}
							catch (e)
							{
								// console.log(index, 'error');
								console.log(e);
								continue;
							}
						}

						// console.log(index, 'ALL PASSED');

						if (!best)
						{
							best = alert;

							if (best.link)
							{
								if (!best.domain && URL)
								{
									try
									{
										var url = new URL(best.link);
										best.host = $sce.trustAsHtml(url.host);
									}
									catch (e)
									{

									}
								}
								else
								{
									best.host = $sce.trustAsHtml(best.domain);
								}
							}

							if(best.changeState)
							{
								best.changeState = $sce.trustAsHtml(best.changeState);
								best.changeStateText = $sce.trustAsHtml(best.changeStateText);
							}

							var tmp = document.createElement("DIV");
							tmp.innerHTML = best.title;
							var textTitle = tmp.textContent || tmp.innerText;

							best.track = textTitle + ' (' + best.id + ')';
							best.originalTitle = best.title;
							best.originalText = best.text;
							best.title = $sce.trustAsHtml(best.title);
							best.text = $sce.trustAsHtml(best.text);
						}
					}

					if (best)
					{
						callback(best);
						// console.log(best, 'BEST FOUND!');
					}
					else
					{
						// alert.get should be called automatically only when freshAccount == false
						// so if it's called manually and there's no alert to show, we can remove fresh account tag
						// console.log('NO FRESH ACC');
						window.localStorage.freshAccount = false;
					}
				});
			});
		},

		getSingle: function(key, callback)
		{
			gettingSingleAlert = true;
    		var self = this;

			Mongo.getCached(function(user)
			{
				var ref = firebase.database().ref('alerts').child(key);
				ref.once('value', function(snap)
				{
					var alert = snap.val();
					alert.id = key;

					best = alert;

					if (best.link)
					{
						if (!best.domain && URL)
						{
							try
							{
								var url = new URL(best.link);
								best.host = $sce.trustAsHtml(url.host);
							}
							catch (e)
							{

							}
						}
						else
						{
							best.host = $sce.trustAsHtml(best.domain);
						}
					}

					if(best.changeState)
					{
						best.changeState = $sce.trustAsHtml(best.changeState);
						best.changeStateText = $sce.trustAsHtml(best.changeStateText);
					}

					var tmp = document.createElement("DIV");
					tmp.innerHTML = best.title;
					var textTitle = tmp.textContent || tmp.innerText;

					best.track = textTitle + ' (' + best.id + ')';
					best.originalTitle = best.title;
					best.originalText = best.text;
					best.title = $sce.trustAsHtml(best.title);
					best.text = $sce.trustAsHtml(best.text);

					if (best)
					{
						callback(best);
					}

					gettingSingleAlert = false;
				});
			}, function()
			{
				$timeout(function()
				{
					self.getSingle(key, callback);
				}, 250);
			});

			$timeout(function()
			{
				gettingSingleAlert = false;
			}, 5000);
		},

		markViewed: function(id, isGlobalAlert)
		{
			viewed[id] = true;
			window.localStorage.setItem('viewedAlerts', JSON.stringify(viewed));

			if(!isGlobalAlert)
			{
				Mongo.getCached(function(user)
				{
					var alertList = user.alerts;
					var alertIndex = _.findIndex(alertList, { id: id });
					alertList[alertIndex].seenAndClosed = true;
					var currentTime = new Date().getTime();
					alertList[alertIndex].closeTime = currentTime;
					Mongo.update({alerts: alertList});
				});
			}
		}
    };
});

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
