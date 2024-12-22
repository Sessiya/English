/*
window.setTimeout(function() {

	var injector = angular.element(document.getElementById('app')).injector();

    var Mongo = injector.get('Mongo');
    var $rootScope = injector.get('$rootScope');

	Mongo.get(function(user) {
		var fb = user.firebaseKeyId;
		var id = user._id;

		var friendIDs = ['62f25f1007fb23001f5de383', '630e98d2681db5052fd240cc', '6396ea6a423e1b001ddacd0b', '6396f1d3423e1b001ddacd47'];

		var steps = [];

		var next = function() {
			window.setTimeout(function() {
				var promise = steps.shift();
				if (!promise) {
					console.log('All done!');
					return;
				}

				promise[1]().then(function(res) {
					console.log('Friends success 🔥 ', promise[0], res.data);
					next();
				}).catch(function(res) {
					console.log('Friends failure 😨 ', promise[0], res.data);
					next();
				});
			}, 1000);
		};

		var p = function(call) {
			return call();
		}

		steps.push(['🔥 delete them all at once', () => Mongo.deleteAllFriends(fb)]);

		steps.push(['🔥 should be 0 friends at the beginning', () => Mongo.getFriends(id)]);

		// steps.push(['😨 should be a valid firebaseKeyId to add a friend', () => Mongo.addFriend('blalblalala', id)]);

		// steps.push(['😨 friend ID must be provided', () => Mongo.addFriend(fb, '')]);

		// steps.push(['😨 cannot add yourself as a friend', () => Mongo.addFriend(fb, id)]);

		steps.push(['🔥 add first friend', () => Mongo.addFriend(fb, {userId: friendIDs[0]})]);

		steps.push(['🔥 add second friend', () => Mongo.addFriend(fb, {userId: friendIDs[1]})]);

		steps.push(['🔥 should be 2 friends now', () => Mongo.getFriends(id)]);

		// steps.push(['🔥 delete first friend', () => Mongo.deleteFriend(fb, friendIDs[0])]);

		// steps.push(['🔥 just 1 friend now', () => Mongo.getFriends(id)]);

		// steps.push(['🔥 one more friend', () => Mongo.addFriend(fb, friendIDs[2])]);

		// steps.push(['🔥 and last one', () => Mongo.addFriend(fb, friendIDs[3])]);

		// steps.push(['🔥 should be 3 friends', () => Mongo.getFriends(id)]);

		// steps.push(['🔥 try adding an existing friend again', () => Mongo.addFriend(fb, friendIDs[3])]);

		// steps.push(['🔥 should still be 3 friends', () => Mongo.getFriends(id)]);

		// steps.push(['🔥 no friends anymore', () => Mongo.getFriends(id)]);

		next();

	});

}, 5000);
*/


//  A formatted version of a popular md5 implementation.
//  Original copyright (c) Paul Johnston & Greg Holt.
//  The function itself is now 42 lines long.

function md5(inputString) {
    var hc="0123456789abcdef";
    function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
    function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
}

var oauthField = 'oauthID';

angular.module('starter.trade')

.factory('Mongo', function($http, $rootScope, SymbolData, OnlineStatus, FireStorage, $firebaseObject, $timeout, $window, UsageStats) {

	var mongoToken;
	var mongoTokenViableUntil;
	var mongoTokenForUser;
	var userId;

	if(window.localStorage.userId && window.localStorage.userId !== 'null' && typeof window.localStorage.userId !== 'undefined')
	{
		// console.log('set initial userId to localStorage', window.localStorage.userId);
		userId = window.localStorage.userId;
	}
	else if($rootScope.uuid)
	{
		// console.log('set initial userId to rootScope.uuid', $rootScope.uuid);
		userId = $rootScope.uuid;
	}
	else
	{
		// console.log('no window.localStorage.userId or $rootScope.uuid, try to set to window.device.uuid?');
		if(window.device && window.device.uuid)
		{
			userId = window.device.uuid;
		}
	}

	var user = null;
	var userBatch = null;
	var gettingTokenProcess = false;
	var gettingTokenProcessTime = 0;

	var initial = {cash: window.initialUserCash, bonusCash: window.initialUserCash, currency: 'USD', symbol: '$'};

	var waitingForToken = false;
	var authInProgress = false;
	var firebaseAuthInProgress = false;
	var registeringUser = false;
	var checkingUser = false;
	var checkingUserExists = false;
	var callbackQueue = [];
	var needNewMongoUser = false;

	var currentBaseUrlIndex = 0;
	window.localStorage.currentBaseUrlIndex = currentBaseUrlIndex;
	var baseUrl = window.appConfig.apiUrl;
	var baseUrlCount = baseUrl.length;
	var baseUrlChanged = false;
	var baseUrlChangedTime = 0;

	//testing
	window.changeBaseUrl = function(idx)
	{
		currentBaseUrlIndex = idx;
	}

	var requestMongo = function(path, headers, params, callback, errorCallback)
	{
		if(window.appPaused)
		{
			// so far ios only issue.
			// if request is made right after resuming the application/while something else is doing something??
			// the application lags and keeps being very slow if the app has been in background for some time -
			// some times it starts lagging some times it does not.

			// calling the functions that were skipped with some delay
			// console.log('returning theese - ' + path, headers, params);
			$timeout(function() {requestMongo(path, headers, params, callback, errorCallback);}, 1000);
			return;
		}

		var finalHeaders =
		{
			'accept': '*/*',
			'Access-Control-Allow-Origin': '*'
		};

		if(headers)
		{
			finalHeaders = Object.assign(finalHeaders, headers);
		}

		var finalParams = {
			url: window.appConfig.apiUrlProtocol + baseUrl[currentBaseUrlIndex] + path,
			method: 'GET',
			headers: finalHeaders,
			timeout: 5000
		};

		if(params)
		{
			var finalParams = Object.assign(finalParams, params);
		}

		axios(finalParams)
		.then(function(response) {
			// console.log('axios requestMongo Success - ' + path, baseUrl[currentBaseUrlIndex]);
			// console.log(response.data);

			if (callback)
			{
				callback(response);
			}
		}).catch(function(error)
		{
			console.log('axios requestMongo Failure - c123', error);
			// console.log('axios requestMongo Failure - ' + path, baseUrl[currentBaseUrlIndex], finalParams, error, baseUrl);

			// ios blocks hostname for a minute or longer whenever xhr requests fail too many times
			// this error gets triggered instantly when that happens without waiting for set timeout
			if(error == 'Error: Network Error' || error == 'Error: timeout of 5000ms exceeded')
			{
				changeBaseUrl();

				if(user && user._id)
				{
					if (ws) {
						ws.close();
					}
				}

				finalParams.url = window.appConfig.apiUrlProtocol + baseUrl[currentBaseUrlIndex] + path;
				$timeout(function() {requestMongo(path, headers, finalParams, callback, errorCallback);}, 5000);
			}
			else
			{
				if(ws)
				{
					ws.close();
				}
				console.log('maybe resetting user in 1 second..');
				window.axiosErrorTimeout = $timeout(function()
				{
					$timeout.cancel(window.axiosErrorTimeout);

					user = null;
					getUserByID(userId, function(user)
					{
						$rootScope.$broadcast('resetting-user-data', user);
					});
				}, 1000);
			}

			if (errorCallback)
			{
				errorCallback(error);
			}
		});
	}

	var changeBaseUrl = function()
	{
		if(baseUrlCount == 1)
		{
			console.log('no other base urls to change to');
			return;
		}

		// sometimes there's multiple requests stuck with the same hostname blocked .url
		// allow changing base url every 5 minutes
		// testing a lot lower base url changing time
		if(baseUrlChangedTime < (new Date().getTime() - (1000 * 20)))
		{
			baseUrlChanged = false;
		}

		if(!baseUrlChanged)
		{
			currentBaseUrlIndex++;
			if(currentBaseUrlIndex >= baseUrlCount)
			{
				currentBaseUrlIndex = 0;
			}

			window.localStorage.currentBaseUrlIndex = currentBaseUrlIndex;

			baseUrlChanged = true;
			baseUrlChangedTime = new Date().getTime();
		}
	}

	var getToken = function(uuid)
	{
		if(!$rootScope.uuid || !OnlineStatus.is())
		{
			// console.log("!$rootScope.uuid or !OnlineStatus.is() return");
			window.setTimeout(function() {
				// console.log('retrying token');
				getToken(uuid);
			}, 1000);
			return;
		}

		if(typeof mongoTokenViableUntil === 'undefined')
		{
			console.log('token undefined, need to create one');
		}
		else
		{
			var currTime = new Date().getTime();
			if(currTime < mongoTokenViableUntil)
			{
				// console.log('token has not expired yet', currTime, mongoTokenViableUntil, (currTime < mongoTokenViableUntil));

				if(mongoTokenForUser && (mongoTokenForUser == userId))
				{
					// console.log('token already set for the most current user');
					return;
				}
			}
		}

		if(registeringUser)
		{
			// console.log('currenty registeringUser true so return');
			return;
		}

		if(gettingTokenProcessTime && (gettingTokenProcessTime + 6000) < Date.now())
		{
			// console.log('taking too long time to auth.');
			gettingTokenProcess = false;

			//maybe sheit izsaukt atkal getToken()
		}

		if(gettingTokenProcess == true)
		{
			// console.log('already trying to get token');
			return;
		}

		gettingTokenProcess = true;
		gettingTokenProcessTime = Date.now();

		if(!userId)
		{
			userId = $rootScope.uuid;
		}

		var postData = {email: userId + '@goforexapp.com', password: userId};

		// console.log('trying to get new token with uuid: ' + userId);
		authInProgress = true;

		var cParams = {
			method: "POST",
			data: postData
		};

		requestMongo('/auth/login', false, cParams, function(response)
		{
			gettingTokenProcess = false;
			authInProgress = false;
			var tokenSuccess = null;

			// most current api decided to return token without data object, idk why
			// just in case, check for both cases
			if(response && response.data && response.data.token)
			{
				tokenSuccess = response.data.token;
			}

			if(tokenSuccess)
			{
				mongoToken = tokenSuccess;
				// 2 hour token time atm
				mongoTokenViableUntil = new Date().getTime() + (1000 * 60 * 60 * 2);
				mongoTokenForUser = userId;

				return mongoToken;
			}
		}, function(error)
		{
			authInProgress = false;
			// console.log('Mongo.auth error');
			// console.log(error.response);
			if(error.response && error.response.data && error.response.data.message == 'NO_EMAIL_DATA')
			{
				console.log('NO_EMAIL_DATA, need to check if user exists and register if it doesnt');
				checkUserAndRegister();
				needNewMongoUser = true;
			}
		});
	}

	var isTokenViable = function()
	{
		if(typeof mongoToken === "undefined")
		{
			console.log('typeof mongoToken === "undefined"')
			return false;
		}

		if(!mongoToken)
		{
			// console.log('!mongoToken')
			return false;
		}

		if(userId != mongoTokenForUser)
		{
			// console.log('userId != mongoTokenForUser')
			return false;
		}

		//if older than 2 hours - reset
		var currTime = new Date().getTime();

		if(currTime > mongoTokenViableUntil)
		{
			// console.log('currTime > mongoTokenViableUntil')
			//need new token
			return false;
		}

		return true;
	}

	var getTokenPromise = function()
	{
		return new Promise((resolve, reject) =>
		{
			// use window.navigator.onLine for getTokenPromise, as isConnected in OnlineStatus goes false when application goes background
			// because of firebase connectedRef. after 2-3 seconds isConnected goes back to true because of the same firebase connectedRef
			// and sometimes other places calls OnlineStatus.markOnline.
			// Sometimes stuff gets called in that timeframe that breaks for example deletePosition call if stoploss trigers position close
			if(!$window.navigator.onLine)
			{
				reject({
					message: 'not connected to internet'
				});
				console.log('no internet');

				return;
			}

			if(isTokenViable())
			{
				resolve({
					message: 'token goog',
					token: mongoToken
				});
				// console.log('token promise is good');

				if(typeof tokenT !== "undefined" && tokenT)
				{
					window.clearTimeout(tokenT);
				}

				return;
			}
			else
			{
				// current token not viable or undefined, getting a new one
				// console.log('calling getToken from getTokenPromise()');
				getToken();
			}

			function waitForToken()
			{
				if(waitingForToken)
				{
					return;
				}

				waitingForToken = true;

				if(mongoToken && isTokenViable())
				{
					resolve({
						message: 'token goog',
						token: mongoToken
					});

					// if(typeof waitForTokenT !== "undefined" && waitForTokenT)
						// window.clearTimeout(waitForTokenT);

					waitingForToken = false;
					return;
				}

				if(waitingForToken)
				{
					window.setTimeout(function()
					{
						// console.log('no token yet, keep waiting');
						waitingForToken = false;
						waitForToken();
					}, 500);
				}
			}

			waitForToken();
		});
	}

	OnlineStatus.addWatch(function(status)
    {
		if(status)
		{
			getTokenPromise().then((success) =>
			{
				// console.log('got Token from OnlineStatus watch', success);
				// trying for initial token?
			}).catch((error) =>
			{
				console.log('initial token failure');
			})
		}
	});

	// getToken();

	function getAuthCredentials(id)
	{
		return {
		  email    : id + '@goforexapp.com',
		  password : id
		};
	};

	function auth(id, callback, errorCallback)
	{
		if (firebaseAuthInProgress)
		{
			callbackQueue.push(callback);
			return false;
		}

		firebaseAuthInProgress = true;

		var cred = getAuthCredentials(id);

		try
		{
			firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).then(function(authData) {
				callback(authData.user.uid);
				if (callbackQueue.length)
				{
					_.each(callbackQueue, function(pending)
					{
						pending(authData.user.uid);
					});
				}

				firebaseAuthInProgress = false;
				callbackQueue = [];
			}, function(error)
			{
				console.log('auth firebase signin error ' + error);

				if(error.code == 'auth/quota-exceeded')
				{
					console.log('firebase ip quote exceeded, retry after 5seconds.');
					$timeout(function()
					{
						firebaseAuthInProgress = false;
						auth(id, callback, errorCallback);
					}, 5000);

					return;
				}

				if (errorCallback)
				{
					errorCallback(error);
				}

				$timeout(function()
				{
					firebaseAuthInProgress = false;
				}, 1000);
			});
		}
		catch (e)
		{
			console.log('auth try catch error ' + e);
			if (errorCallback)
			{
				errorCallback(e);
			}

			$timeout(function()
			{
				firebaseAuthInProgress = false;
			}, 1000);
		}

		return true;
	};

	var b = window.localStorage.getItem('bonusQueue');
	try
	{
		var bonusQueue = b ? JSON.parse(b) : [];
	}
	catch (e)
	{
		var bonusQueue = [];
	}

	var isBonusSaving = false;

	function updateBonusQueue()
	{
		isBonusSaving = false;
		window.localStorage.setItem('bonusQueue', JSON.stringify(bonusQueue));
	};

	function userExists(obj, callback, callback2)
	{
		// console.log('userExists()');
		checkingUserExists = true;
		return new Promise((resolve, reject) =>
		{
			var postData = obj;

			var cParams = {
				method: "POST",
				data: postData
			};

			requestMongo('/checkuser', false, cParams, function(response)
			{
				// console.log('userExists success');
				if(!response.data || response.data == 'false')
				{
					resolve({
						message: 'userExists successful',
						userExists: false
					});

					if(callback)
					{
						callback();
					}
				}
				else
				{
					resolve({
						message: 'userExists successful',
						userExists: true
					});

					if(callback2)
					{
						callback2();
					}
				}

				checkingUserExists = false;
				return response.data;
			}, function(error)
			{
				// console.log('userExists error');
				// console.log(error.response);
				checkingUserExists = false;
			});
		});
	}

	function registerUser(obj, callback)
	{
		return new Promise((resolve, reject) =>
		{
			var postData = obj;

			var cParams = {
				method: "POST",
				data: postData
			};

			requestMongo('/register', false, cParams, function(response)
			{
				resolve({
					message: 'registerUser() successful',
					token: response.data.token
				});

				if(callback)
				{
					callback();
				}

				registeringUser = false;
			}, function(error)
			{
				resolve({
					message: 'registerUser error'
				});

				registeringUser = false;
			});
		});
	}

	function userCounterAdd()
	{
		return new Promise((resolve, reject) =>
		{
			var cParams = {
				method: "POST"
			};

			requestMongo('/counter', false, cParams, function(response)
			{
				resolve({
					message: 'user counter updated',
					counter: response.data
				});
			}, function(error)
			{
				console.log('userCounterAdd() error');
				reject({
					message: 'could not update user counter'
				});
			});
		});
	}

	function checkUserAndRegister(callback)
	{
		if(!checkingUser)
		{
			checkingUser = true;

			if(!userId)
			{
				userId = $rootScope.uuid;
			}

			if(!checkingUserExists)
			{
				userExists({id: userId}).then(function(value)
				{
					$timeout(function()
					{
						checkingUserExists = false;
						checkingUser = false;
					}, 2000);

					if(!value.userExists)
					{
						firebase.auth().signInWithEmailAndPassword(userId + "@goforexapp.com", userId).then(function(firebaseData)
						{
							if(!registeringUser)
							{
								//user does not exist, add it to mongo
								registeringUser = true;

								userCounterAdd().then(function(value)
								{
									if(!value || !value.counter)
									{
										if (errorCallback)
										{
											errorCallback();
										}
										// console.log('no value.counter');
										registeringUser = false;
										return;
									}
									else if(value && value.counter)
									{
										registerUser({firebaseKeyId: userId, uid: firebaseData.user.uid, fiId: value.counter, cash: window.initialUserCash, bonusCash: window.initialUserCash, historyMigrated: true}).then(function(value)
										{
											registeringUser = false;
											if(value.token)
											{
												if(!window.localStorage.mongoUserExists)
												{
													window.localStorage.mongoUserExists = [];
												}
												window.localStorage.mongoUserExists[userId] = userId;
												mongoToken = value.token;
												// 1 hour token time atm
												mongoTokenViableUntil = new Date().getTime() + (1000 * 60 * 60 * 1);
												mongoTokenForUser = userId;
											}
											return;
										});
									}
								});
							}

						}, function(err)
						{
							console.log(err);

							if(err.code == 'auth/quota-exceeded')
							{
								console.log('firebase ip quote exceeded, retry after 5seconds.');
								$timeout(function()
								{
									checkingUserExists = false;
									checkingUser = false;
									checkUserAndRegister(callback);
								}, 5000);

								return;
							}

							$timeout(function()
							{
								// console.log('userId: ' + userId);
								firebase.auth().createUserWithEmailAndPassword(userId + "@goforexapp.com", userId).then(function(fbUserData)
								{
									authInProgress = false;
									auth(userId, function()
									{
										checkUserAndRegister(callback)
										authInProgress = false;
									});
								}, function(err)
								{
									console.log('firebase createUserWithEmailAndPassword error?');
									authInProgress = false;
								});
							}, 5000);
						});
					}
					else
					{
						registeringUser = false;
						checkingUser = false;
						if(callback)
						{
							callback();
						}
					}
				});
			}
		}
	}

	function getAssocPositions(positionArray) {
		if (!_.isArray(positionArray)) {
			return positionArray;
		}

		var processedPositions = {};
		_.each(positionArray, function(pos)
		{
			processedPositions[pos.pair] = pos;
		});

		function posForceCloseTrigger()
		{
			window.setTimeout(function() {
				if (window.tradeController && window.tradeController.positionUpdateTrigger) {
					window.tradeController.positionUpdateTrigger();
				}
				else
				{
					window.setTimeout(function()
					{
						posForceCloseTrigger();
					}, 500);
				}
			});
		}

		posForceCloseTrigger();

		return processedPositions;
	}

	var ws = null;
	var socketErrorCount = 0;

	function wsConnect(id) {
		// if(window.isPaused)
		// {
		// 	return;
		// }

		if (ws) {
			try {
				ws.onclose = function() {};
				ws.close();
			} catch (e) {
				console.error('Error closing websocket', e);
			}
		}

		ws = new WebSocket('ws://' + baseUrl[currentBaseUrlIndex]);

		ws.onopen = function() {
			var userChange = function()
			{
				socketErrorCount = 0;
				if (ws.readyState === WebSocket.OPEN) {
					// console.warn('DB Socket connected');

					// might help with battle data updating after opening from background as ws gives data when lastOnlineTime gets updated??
					// var userSettings = user.settings;
					// userSettings.lastOnlineTime = new Date().getTime();
					// update(userSettings);

					ws.send(JSON.stringify({
						"event": "userChange", "data": id
					}));
				} else {
					console.warn("websocket is not connected", ws.readyState);

					window.setTimeout(function()
					{
						userChange();
					}, 1000);
				}
			}

			userChange();
		};

		ws.onmessage = function(msg) {
			var e = JSON.parse(msg.data);

			if (e.event === 'ping') {
				return;
			}

			if (e.event === 'userData' && e.data) {
				e.data = {updatedFields: e.data}
			}

			if(e.data)
			{
				_.each(e.data.removedFields, function(key) {
					_.unset(user, key);
				});

				_.each(e.data.updatedFields, function(value, key) {
					_.set(user, key, value);
				});
			}

			if (user && user.positions) {
				user.positions = getAssocPositions(user.positions);
			}

			$timeout(function() {
				$rootScope.$applyAsync();

				if(e.data && e.data.updatedFields)
				{
					if (e.data.updatedFields.positions) {
						$rootScope.$broadcast('$$rebind::positions');
					}

					if(e.data.updatedFields.alerts && window.location.hash == '#/tab/dash')	{
						$rootScope.$broadcast("newAlert");
					}
				}
			});
		};

		ws.onclose = function(e) {
			if (1000 === e.code) {
				console.log('Closing websocket connection due to user ID change');
				return;
			}

			console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.code, e.reason);
			setTimeout(function() {
				wsConnect(id);
			}, 1000);
		};

		ws.onerror = function(err) {
			// console.error('Socket encountered error: ', err, 'Closing socket');
			console.error('Socket encountered error. Closing socket');

			socketErrorCount++;

			if(socketErrorCount >= 3)
			{
				socketErrorCount = 0;
				changeBaseUrl();
			}

			if(ws.readyState == 1)
			{
				ws.close();
			}
		};
	}

	$rootScope.$watch(function() { return user ? user._id : null }, function(n) {
		if (!n) {
			return;
		}

		if (ws && ws.readyState == 1) {
			ws.close(1000);
		}

		window.setTimeout(function()
		{
			wsConnect(n);
		}, 1000);
	});

	// Not sure why, but lossLimit profitLimit does not get updated for positions after app has been in background for a minute or so.
	// ws.close() also does not work on resume after app has been in background for a minute or so. Changing user._id and back seems to work
	// reset socket on app resume.
	// document.addEventListener("resume", () => {window.reconnectUserWs();}, false);

	window.reconnectUserWs = function()
	{
		if(user)
		{
			var savedUserId = user._id;
			user._id = null;
			window.setTimeout(function()
			{
				user._id = savedUserId;

				$timeout(function()
				{
					if(ws && ws.readyState == 1)
					{
						ws.close();
						window.setTimeout(function()
						{
							wsConnect(user._id);
						}, 100);
					}
				});
			}, 250);
		}
	}

	// function update(obj, callback)
	// {
	// 	var postData = obj;

	// 	getTokenPromise().then((success) =>
	// 	{
	// 		var cParams = {
	// 			method: "PATCH",
	// 			data: postData
	// 		};

	// 		requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
	// 		{
	// 			if(callback)
	// 			{
	// 				callback(response);
	// 			}
	// 		}, function(error)
	// 		{
	// 			console.log('update error', error);
	// 		});
	// 	});
	// }

	var fetchingUser = {};
	var rawUserData = {};
	var userCallbackQueue = {};

	function getUserByID(id, callback) {
		if (rawUserData[id]) {
			callback(rawUserData[id]);
			return;
		}

		if (!userCallbackQueue[id]) {
			userCallbackQueue[id] = [];
		}

		if (callback) {
			userCallbackQueue[id].push(callback);
		}

		if (fetchingUser[id]) {
			return;
		}

		getTokenPromise().then((success) =>
		{
			fetchingUser[id] = true;

			requestMongo('/user/' + id, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
			{
				if(response.data.positions)
				{
					response.data.positions = getAssocPositions(response.data.positions);
				}

				rawUserData[id] = response;
				if (userCallbackQueue[id] && userCallbackQueue[id].length) {
					while (callback = userCallbackQueue[id].pop()) {
						callback(response);
					}
				}

				delete userCallbackQueue[id];
				fetchingUser[id] = false;
			}, function(error) {
				fetchingUser[id] = false;
				console.log('axios error, retrying in 2 seconds', error);
				window.setTimeout(function()
				{
					getUserByID(id, callback);
				}, 2000);
			});
		});
	}

	var positionsCache = [];
	var cashCache = [];

	return {

		updateBaseUrls: function()
		{
			if(window.device && !window.device.platform)
			{
				return;
			}

			baseUrl = window.appConfig.apiUrl;
			baseUrlCount = baseUrl.length;
		},

		updateAuthProgress: function(inProgress)
		{
			authInProgress = inProgress;
		},

		getAuthCredentials: function(id)
		{
			return getAuthCredentials(id);
		},

		checkToken: function(id)
		{
			getTokenPromise().then((success) =>
			{
				// console.log('token good');
			});
		},

		getCached: function(callback, errorCallback)
		{
			if (user) {
				callback(user);
			} else if (errorCallback) {
				errorCallback();
			}
		},

		get: function(callback, errorCallback)
		{
			var self = this;
			FireStorage.injectUser(this);

			if(!window.localStorage.registerDate)
			{
				window.localStorage.registerDate = UsageStats.firstUseDate ? UsageStats.firstUseDate() : Date.now();

				if(window.isGoforex)
				{
					// freshAccount used for alert logic. If Account is fresh it shouldn't automatically show alerts
					window.localStorage.freshAccount = true;
				}
			}

			function getByUUID()
			{
				self.checkUserAndRegister(callback);

				//try to get user

				self.getByUuid(userId).then(function(value)
				{
					self.getBatchData();
					if(value && value.data)
					{
						var tempuser = value.data;

						function createUser(callback, fbUserData)
						{
							var userData = angular.copy(initial);
							userData.uid = fbUserData.uid;
							needNewMongoUser = false;

							self.userCounterAdd().then(function(value)
							{
								if(!value || !value.counter)
								{
									if (errorCallback)
									{
										errorCallback();
									}
									//setError(err);
								}
								else if(value && value.counter)
								{
									userData.fiId = value.counter;
									userData.firebaseKeyId = tempuser.firebaseKeyId;
									tempuser = userData;

									self.save(tempuser).then(function()
									{
										userBatch.uid = fbUserData.uid + "";
										userBatch.portfolio = userData.cash;
										userBatch.breakdown = {cash: 100, forex: 0, oil: 0};
										userBatch.growth = {1: 0, 7: 0};
										userBatch.rank = {1: userData.id, 7: userData.id, portfolio: userData.id};
										userBatch.rankChange = {1: 0, 7: 0, portfolio: 0};

										self.batchPatch(userBatch);

										// ios only issue maybe: this for some reason messed with the websocket update.
										// this sets the user variable after websocket updates the user variable, so
										// it was being used for everything after user creation on Dash Screen unless some action
										// updated the lastChanged variable on server

										// so far commenting it out does not break other things.

										// user = tempuser;

										if (callback)
										{
											callback(tempuser);
										}
									})
								}
							});
						}

						//trying to authorize
						auth(userId, function(uid)
						{
							if(tempuser.fiId !== null)
							{
								user = tempuser;

								if(callback)
								{
									callback(user);
								}

								authInProgress = false;
							}
							else
							{
								authInProgress = false;
							}
						}, function(err)
						{
							var cred = getAuthCredentials(userId);
							// console.log('userId: ' + userId);
							firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function(fbUserData) {
								authInProgress = false;
								auth(userId, function()
								{
									createUser(callback, fbUserData.user);
									authInProgress = false;
								});
							}, function(err)
							{
								console.log('firebase createUserWithEmailAndPassword error?');
								console.log(err);
								authInProgress = false;
							});
						});
					}
					else
					{
						// no data from Mongo.getByUuid
					}
				});
			}

			function getByOauth()
			{
				if (Date.now() - window.authStart < 2000)
				{
					window.getTimeout1 = window.setTimeout(function()
					{
						window.clearTimeout(window.getTimeout1);
						self.get(callback, errorCallback);
					}, 2000);

					return;
				}

				window.authStart = Date.now();

				auth(self.getOauthHash(), function(uid)
				{
					// This might have been the main problem with facebook login.
					// /facebookid/ returns userId/uuid by facebook given id.
					// /facebook/ returns userId/uuid by facebook given uId - the thing we save as facebookUid
					// might need to look into this on goforex as well or maybe it's correct there, because of the new oauth system there
					oauthUserIdField = oauthField.toLowerCase();

					(firebase.database().ref(oauthUserIdField).child(fb)).once('value', function(snap)
					{
						var oauthidval = snap.val();
						if(oauthidval === null || oauthidval === 'null')
						{
							console.log('oauthid points to null user, resetting');
							FireStorage.clearOauth();
							var val = userId;
						}
						else
						{
							if(oauthidval != userId)
							{
								self.setUserId(oauthidval);
								window.location.reload();
							}

							var val = oauthidval || userId;
						}

						if(val)
						{
							userId = val;

							self.getByUuid(userId).then(function(value)
							{
								user = value.data;

								if(!user || !user.fiId)
								{
									// self.resetAccount();

									getByUUID();

									return;
								}

								// todo - needed for t g?
								if(user.fbauth)
								{
									self.save({fbauth: false});
								}

								if(callback)
								{
									callback(user);
								}
								authInProgress = false;
							}).catch(function(error)
							{
								console.log('self.getByUuid catch error, resetting account');
								// self.resetAccount();

								getByUUID();
								return;
							});
						}
						else
						{
							console.log('!val? catch error');
							var cred = getAuthCredentials(self.getOauthHash());
							FireStorage.clearOauth();
                            fb = null;
                            var save = {};
                            save[oauthField] = null;
							this.save(save).then(function()
							{
								firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).then(function()
								{
									firebase.auth().currentUser.delete();
									getByUUID();
								}, function(err)
								{
									console.log(err);
									getByUUID();
								});
							});
						}
					}, function(a, b) { });
				}, function(err)
				{
					// seems like the Firebase user is no longer valid
					$http.get('http://www.geoplugin.net/json.gp').then(function(res)
					{
						OnlineStatus.markOnline();
						authInProgress = false;
						FireStorage.clearOauth();
						self.get(callback, errorCallback);
					});
				});
			}

			if(!window.device || window.device.isReady)
			{
				// user is gone, need to reload
				if (!user || !user.currency)
				{
					user = null;
				}

				if(!user || (user[oauthField.toLowerCase()]))
				{
					if (!$rootScope.uuid || !OnlineStatus.is())
					{
						if(typeof getTimeout != undefined)
						{
							$timeout.cancel(getTimeout);
						}

						var getTimeout = $timeout(function()
						{
							self.get(callback, errorCallback);
						}, 250);

						return;
					}

					if(!userId)
					{
						userId = $rootScope.uuid;
					}

					//check if user has logged in via Oauth
					var fb = FireStorage.get(oauthField);
					if(fb == 'null')
					{
						fb = null;
					}

					if(fb)
					{
						//if oauth ID exists get the user from that id?
						getByOauth();
						return;
					}
					else
					{
						//get by uuid
						getByUUID();
					}
				}
				else
				{
					//maybe check if the user existed in firebase db
					//if it did, copy the old data over

					this.processBonusQueue();

					getTokenPromise().then((success) =>
					{
						getUserByID(userId, function(response)
						{
							response.data.positions = getAssocPositions(response.data.positions);
							user = response.data;

							if(callback)
							{
								callback(user);
							}
							else
							{
								return user;
							}
						});
					});
				}
			}
			else
			{
				document.addEventListener('deviceready', function()
				{
					self.get(callback, errorCallback);
				});
			}
		},

		checkUserAndRegister: function(callback)
		{
			var self = this;
			if(!checkingUser)
			{
				checkingUser = true;

				if(!userId)
				{
					userId = $rootScope.uuid;
				}

				if(!checkingUserExists)
				{
					userExists({id: userId}).then(function(value)
					{
						$timeout(function()
						{
							checkingUserExists = false;
							checkingUser = false;
						}, 2000);

						if(!value.userExists)
						{
							firebase.auth().signInWithEmailAndPassword(userId + "@goforexapp.com", userId).then(function(firebaseData)
							{
								if(!registeringUser)
								{
									//user does not exist, add it to mongo
									registeringUser = true;

									self.userCounterAdd().then(function(value)
									{
										if(!value || !value.counter)
										{
											if (errorCallback)
											{
												errorCallback();
											}
											console.log('no value.counter');
											registeringUser = false;
											return;
										}
										else if(value && value.counter)
										{
											registerUser({firebaseKeyId: userId, uid: firebaseData.user.uid, fiId: value.counter, cash: window.initialUserCash, bonusCash: window.initialUserCash}).then(function(value)
											{
												registeringUser = false;
												if(value.token)
												{
													if(!window.localStorage.mongoUserExists)
													{
														window.localStorage.mongoUserExists = [];
													}
													window.localStorage.mongoUserExists[userId] = userId;
													mongoToken = value.token;
													// 1 hour token time atm
													mongoTokenViableUntil = new Date().getTime() + (1000 * 60 * 60 * 1);
													mongoTokenForUser = userId;

													self.get(callback);
												}

												return;
											}).catch(function(err)
											{
												registeringUser = false;
											});
										}
									});
								}

							}, function(err)
							{
								console.log(err);
								// console.log('userId: ' + userId);
								firebase.auth().createUserWithEmailAndPassword(userId + "@goforexapp.com", userId).then(function(fbUserData) {
									auth(userId, function()
									{
										// console.log('fb authorized? now go back and register to Mongo');
										self.checkUserAndRegister(callback)
										authInProgress = false;
									});
								}, function(err)
								{
									console.log('firebase createUserWithEmailAndPassword error?', err);
									$timeout(function()
									{
										authInProgress = false;
									}, 2000);
								});
							});
						}
						else
						{
							registeringUser = false;
							checkingUser = false;
							if(callback)
							{
								callback();
							}
						}
					});
				}
			}
		},

		registerNewUser: function(obj)
		{
			return new Promise((resolve, reject) =>
			{
				var postData = obj;

				var cParams = {
					method: "POST",
					data: postData
				};

				requestMongo('/register', false, cParams, function(response)
				{
					resolve({
						message: 'registerUser() successful',
						token: response.data.token
					});

					if(callback)
					{
						callback();
					}

					registeringUser = false;
				}, function(error)
				{
					resolve({
						message: 'registerUser error'
					});

					registeringUser = false;
				});
			});
		},

		setUserId: function(id)
		{
			if(id === null || id === 'null' || typeof id === 'undefined')
			{
				console.log('something sets userId as null - return');
				return;
			}

			userId = id;
			window.localStorage.userId = id;
		},

		getUserId: function()
		{
			return userId;
		},

		processBonusQueue: function()
	    {
	    	var self = this;
			updateBonusQueue();
			if (!isBonusSaving && bonusQueue && bonusQueue.length && user)
			{
				var amount = bonusQueue[0];
				isBonusSaving = true;
				this.addLessonBonus({amount: amount}, function(response)
				{
					// user.cash = Math.max(0, (user.cash || 0) + amount);
					// user.bonusCash = Math.max(0, (user.bonusCash || 0) + amount);
					isBonusSaving = false;
					bonusQueue.shift();
					updateBonusQueue();
					self.processBonusQueue();
				});
			}
		},

		addLessonBonus: function(obj, callback)
		{
			return new Promise((resolve, reject) =>
			{
				var postData = obj;

				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "POST",
						data: postData
					};

					requestMongo('/lessonreward/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'addLessonBonus successful',
							user: response.data
						});

						if(callback)
						{
							callback();
						}
					}, function(error)
					{
						console.log('Mongo.addLessonBonus() error');
						console.log(error, cParams);
						reject({
							message: 'no addLessonBonus, error?'
						});
					});
				});
			});
		},

		getUserData: function(callback)
		{
			if(user)
			{
				return user;
			}
		},

		getByUuid: function(uuid)
		{
			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					getUserByID(uuid, function(response)
					{
						user = response.data;

						resolve({
							message: 'token goog',
							data: user
						});

						return user;
					});
				});
			});
		},

		loaded: function()
		{
			return new Promise((resolve, reject) =>
			{
				function checkData()
				{
					if(user != null)
					{
						resolve({
							message: 'token goog',
							token: mongoToken
						});

						return true;
					}
					else
					{
						// console.log('Mongo.loaded no data yet');
						return false;
					}
				}

				window.clearInterval(window.checkTokenLoadedDataTimeout);
				window.checkTokenLoadedDataTimeout = window.setInterval(function()
				{
					if(checkData())
					{
						window.clearInterval(window.checkTokenLoadedDataTimeout);
					}
				}, 500);
			});
		},

		save: function(obj)
		{
			return new Promise((resolve, reject) =>
			{
				var postData = obj;

				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "PATCH",
						data: postData
					};

					requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'save successful',
							user: response.data
						});
					}, function(error)
					{
						console.log('Mongo.save() error');
						console.log(error, cParams);
						reject({
							message: 'no save, error?'
						});
					});
				});
			});
		},

		update: function(obj, callback)
		{
			var postData = obj;

			getTokenPromise().then((success) =>
			{
				var cParams = {
					method: "PATCH",
					data: postData
				};

				requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
				{
					if(callback)
					{
						callback(response);
					}
				}, function(error)
				{
					console.log('update error', error);
				});
			});
		},

		updatePosition: function(pair, obj)
		{
			if(window.isGoforex && user.positions && user.positions[pair])
			{
				if(obj.lossLimit)
				{
					user.positions[pair].lossLimit = obj.lossLimit;
				}
				if(obj.profitLimit)
				{
					user.positions[pair].profitLimit = obj.profitLimit;
				}
			}

			return new Promise((resolve, reject) =>
			{
				var postData = obj;

				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "PATCH",
						data: postData
					};

					requestMongo('/positions/' + userId + '/' + pair, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'updatePositionManual successful',
							user: response.data
						});
					}, function(error)
					{
						reject({
							message: 'updatePositionManual error',
							error: error
						});
						console.log('updatePosition error', error);
					});
				});
			});
		},

		openPosition: function(pair, obj)
		{
			return new Promise((resolve, reject) =>
			{
				if(!user)
				{
					console.log('openPosition: no user, return');
					return;
				}

				var postData = obj;

				// preemptively adding position data to scope without saving to server to "reduce the lag"
				// could be glitchy if internet loses connection just before sending request to server
				var previousPositions = JSON.parse(JSON.stringify(user.positions));
				var previousCash = user.cash;

				positionsCache.push(JSON.parse(JSON.stringify(user.positions)));
				cashCache.push(user.cash);

				user.positions[pair] = postData;
				$rootScope.$broadcast('$$rebind::positions');
				user.cash = Math.max(0, user.cash - postData.amount);

				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "POST",
						data: postData
					};

					requestMongo('/positions/' + userId + '/' + pair, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						if(response.data)
						{
							response.data = getAssocPositions(response.data);
						}

						user.positions = response.data;

						positionsCache.pop();
						cashCache.pop();

						resolve({
							message: 'openPosition successful',
							data: response.data.positions
						});
					}, function(error)
					{
						console.log(error);

						// can happen if resetting user data
						if(!user)
						{
							reject({
								message: 'openPosition error 0.5',
								error: error
							});
							console.log('openPosition: no user, return');
							return;
						}

						user.positions = positionsCache.pop();
						user.cash = cashCache.pop();

						reject({
							message: 'openPosition error 1',
							error: error,
							data: user
						});
					});
				}).catch((err) => {;
					user.positions = positionsCache.pop();
					user.cash = cashCache.pop();

					reject({
						message: 'openPosition error 2',
						error: error,
						data: user
					});
				});
			});
		},

		deletePosition: function(pair, tradeValue)
		{
			var data = {};
			if (typeof tradeValue !== 'undefined') {
				data.tradeValue = tradeValue;
				data.handleClosing = true;
			}

			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "DELETE",
						data: data
					};

					requestMongo('/positions/' + userId + '/' + pair, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'deletePosition successful',
							data: getAssocPositions(response.data)
						});
					}, function(error)
					{
							reject({
							message: 'deletePosition error',
							error: error
						});
					});
				}).catch((err) => {
					reject(err);
				});
			});
		},

		batchPatch: function(obj)
		{
			getTokenPromise().then((success) =>
			{
				var postData = Object.assign({}, userBatch, obj);

				// do not overwrite data that's being set server side?
				if(postData.portfolioDay)
				{
					delete postData.portfolioDay;
				}

				if(postData.portfolioWeek)
				{
					delete postData.portfolioWeek;
				}

				if(postData.growth)
				{
					delete postData.growth;
				}

				if(postData.rank)
				{
					delete postData.rank;
				}

				var cParams = {
					method: "PATCH",
					data: postData
				};

				requestMongo('/batch/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(success)
				{
					// console.log('succ save batchPatch', success);
				}, function(err)
				{
					console.log('err save batchpatch', err.response);
				});
			});
		},

		lessonCompleted: function(obj)
		{
			getTokenPromise().then((success) =>
			{
				var postData = obj;

				var cParams = {
					method: "POST",
					data: postData
				};

				requestMongo('/lessons/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams);
			});
		},

		getPositionPrice: function(currency, stopLossRate)
		{
			if (stopLossRate)
			{
				return stopLossRate;
			}

			var symbol = SymbolData.getSymbol(currency);

			if (!symbol)
			{
				return 0;
			}

			var pos = this.getPosition(currency);
			if (!pos)
			{
				return 0;
			}

			var price = symbol[pos.type == 'sell' ? 'ask' : 'bid'];

			if (!window.isGoBinary && (currency.substr(0, 3) == 'USD'))
			{
				var price = symbol[pos.type != 'sell' ? 'ask' : 'bid'];
			}

			if(window.isCryptoWeb)
			{
				var price = symbol['mid'];
			}

			return price;
		},

		positionValue: function(currency, stopLossRate)
		{
			if (!user)
			{
				return 0;
			}

			if(!currency)
			{
				return;
			}

			if (user && !user.positions)
			{
				// !user.positions, making empty array
				user.positions = {};
				this.update({positions: []});
			}

			var price = 0;

			var pos = this.getPosition(currency);
			if (pos)
			{
				if(pos.forceClose)
				{
					price = pos.forceClose;
				}
				else
				{
					price = this.getPositionPrice(currency, stopLossRate);
				}

				if (!price)
				{
					price = pos.price;
				}

				// !!! @todo - temporary USD/JPY fix for Go Binary
				if (!window.isGoBinary && (currency.substr(0, 3) == 'USD'))
				{
					var total = pos.quant / price;
				}
				else
				{
					var total = pos.quant * price;
				}

				var diff = total - (pos.amount * pos.leverage);

				if ('sell' == pos.type)
				{
					diff = diff * -1;
				}

				if (!diff)
				{
					diff = 0;
				}

				return Math.round(diff * 100) / 100;
			}
			else
			{
				return 0;
			}
		},

		positionCashValue: function(currency, stopLossRate)
		{
			if (!user.positions)
			{
				return 0;
			}

			var value = this.positionValue(currency, stopLossRate);
			var pos = this.getPosition(currency);
			return (pos.amount + value) || 0;
		},

		portfolioValue: function()
		{
			if (!user)
			{
				return 0;
			}

			var value = user.cash;

			var self = this;

			if (user.positions && Object.keys(user.positions).length != 0)
			{
				_.each(user.positions, function(pos)
				{
					if (pos)
					{
						value += self.positionCashValue(pos.pair);
					}
				});
			}

			if (!value)
			{
				return null;
			}

			var str = Math.round(value * 100).toString();;
			return str.substr(0, str.length - 2) + '.' + str.substr(str.length - 2, 2);
		},

		positionPctValue: function(currency)
		{
			if (!user || !user.positions)
			{
				return 0;
			}

			var pos = this.getPosition(currency);
			if (pos)
			{
				return Math.round(this.positionValue(currency) / pos.amount * 10000) / 100;
			}
			else
			{
				return 0;
			}
		},

		getPosition: function(symbol)
		{
			if (user && user.positions && user.positions[symbol])
			{
				return user.positions[symbol];
			}
		},

		getPositionIndex: function(currency)
		{
			if (user && user.positions)
			{
				var posIndex = user.positions.findIndex(item => item.pair === currency);
				return posIndex;
			}
		},

		getActivePairs: function()
		{
			if(user && user.activePairs)
			{
				return user.activePairs;
			}
			else
			{
				this.get(function(user)
				{
					return user.activePairs;
				})
			}
		},

		setActivePairs: function(pairs)
		{
			if(user)
			{
				this.update({activePairs: pairs});
			}
		},

		setBattleDisabled: function(value)
		{
			if(user)
			{
				this.update({battleDisabled: value});
			}
		},

		markCompleteLesson: function(id)
		{
			if (window.rewards[id])
			{
				this.addBonus(window.rewards[id]);
			}
		},

		addBonus: function(amount, callback)
		{
			if (!amount)
			{
				return;
			}

			bonusQueue.push(amount);
			this.processBonusQueue();

			if (user)
			{
				this.update({correctAnswers: (user.correctAnswers || 0) + 1});
			}

			if (callback)
			{
				callback(amount);
			}
		},

		canReduceBonus: function(user, force)
		{
			return (!user || force || (user.correctAnswers >= 20));
		},

		reduceBonus: function(amount, callback, force)
		{
			if (!amount)
			{
				return;
			}

			var d = new Date();
			var answerDate = d.getDate() + '-' + d.getMonth();
			if (user && (user.answerDate != answerDate))
			{
				if (user.answerDate)
				{
					user.correctAnswers = 0;
				}

				this.update({answerDate: answerDate, correctAnswers: user.correctAnswers || 0});
			}

			if (this.canReduceBonus(user, force))
			{
				if (!user || (user.cash - amount > 0))
				{
					if (callback)
					{
						callback(amount * -1);
					}

					bonusQueue.push(amount * -1);
					this.processBonusQueue();
				}
			}

		},

	    getConfig: function()
	    {
			return new Promise((resolve, reject) =>
			{
				requestMongo('/config', null, null, function(success)
				{
					if(success && success.data)
					{
						resolve({
							success: true,
							data: success.data
						});
					}
					else
					{
						reject({
							success: false,
							message: 'no data in success response'
						});
					}
				}, function(err)
				{
					reject({
						success: false,
						message: 'get config error',
						error: err
					});
				});
			});
	    },

	    searchBatchesByName: function(name)
	    {
			return new Promise((resolve, reject) =>
			{
				if(!name)
				{
					console.log('no name provided');
					reject({
						success: false,
						message: 'no name provided for searchBatchesByName'
					});

					return;
				}

				getTokenPromise().then((success) =>
				{
					requestMongo('/findbatch/' + name, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
					{
						var batches = response.data.batches;
						var usersData = response.data.userData;

						for(var i = 0; i < batches.length; i++)
						{
							var findUser = usersData.find(item => item.uid === batches[i].uid);
							if(findUser.avatar)
							{
								batches[i].avatar = findUser ? findUser.avatar : '';
							}

							if(findUser.picture)
							{
								batches[i].picture = findUser ? findUser.picture : '';
							}

							batches[i].userId = findUser ? findUser._id : '';
						}

						resolve({
							success: true,
							data: batches
						});
					}, function(error)
					{
						console.log('searchBatchesByName error', error);

						reject({
							success: false,
							message: error
						});
					});
				});
			});
	    },

	    getBatchData: function()
	    {
			getTokenPromise().then((success) =>
			{
				requestMongo('/batch/' + userId, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
				{
					userBatch = response.data;
				});
			});
	    },

		batchLoaded: function()
		{
			var self = this;

			return new Promise((resolve, reject) =>
			{
				var checkBatchLoadedDataTimeout = null;

				function checkData()
				{
					if (userBatch != null)
					{
						resolve({
							message: 'userbatch goog'
						});

						return true;
					}
					else if (!checkBatchLoadedDataTimeout)
					{
						self.getBatchData();
						return false;
					}
				}

				if (!checkData()) {
					checkBatchLoadedDataTimeout = window.setInterval(function()
					{
						if(checkData())
						{
							window.clearInterval(checkBatchLoadedDataTimeout);
						}
					}, 500);
				}
			});
		},

	    getInfo: function(callback)
	    {
			if (!user || !user.firebaseKeyId)
			{
				return;
			}

			this.batchLoaded().then(function() {
				if (callback)
				{
					callback(userBatch);
				}

				// todo - needed for t g?
				else
				{
					return userBatch;
				}
			});
	    },

	    saveBatch: function(obj)
	    {
	    	var postData = Object.assign({}, userBatch, obj);

	    	if(!user)
	    	{
	    		return;
	    	}

			// do not overwrite data that's being set server side?
			if(postData.portfolioDay)
			{
				delete postData.portfolioDay;
			}

			if(postData.portfolioWeek)
			{
				delete postData.portfolioWeek;
			}

			if(postData.growth)
			{
				delete postData.growth;
			}

			if(postData.rank)
			{
				delete postData.rank;
			}

			if(postData.rankChange)
			{
				delete postData.rankChange;
			}

			if(!postData.fb)
			{
				if(user[oauthField])
				{
					postData.fb = user[oauthField];
				}
				else
				{
					postData.fb = "";
				}
			}

			if(!postData.country)
			{
				if(user.country)
				{
					postData.country = user.country;
				}
				else
				{
					postData.country = "EU";
				}
			}

			if(!postData.uid)
			{
				if(user.uid)
				{
					postData.uid = user.uid;
				}
				else
				{
					postData.uid = "tempSaveBatch";
				}
			}

			if(user.isUserPro)
			{
				postData.isUserPro = user.isUserPro;
			}
			else
			{
				postData.isUserPro = false;
			}

			if(user.wins)
			{
				postData.wins = user.wins;
			}
			else
			{
				postData.wins = 0;
			}

			if(user.losses)
			{
				postData.losses = user.losses;
			}
			else
			{
				postData.losses = 0;
			}

			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "PATCH",
						data: postData
					};

					requestMongo('/batch/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						// console.log('updateBatch success', response);
						resolve({
							message: 'saveBatch successful'
						});
					}, function(error)
					{
						console.log('updateBatch error'/*, error*/);
						reject({
							message: error
						});
					});
				});
			});
	    },

	    getOauthHash: function()
	    {
            var oauthID = FireStorage.get(oauthField);

			return oauthID ? oauthID + '-' + FireStorage.get('oauthMethod') : null;
		},

	    setOauthID: function(callback)
	    {
			var self = this;
			var cred = getAuthCredentials(this.getOauthHash());
			// console.log('userId: ' + userId);
			// console.log('this.getOauthHash()', this.getOauthHash());
			// console.log('getAuthCredentials(this.getOauthHash())', getAuthCredentials(this.getOauthHash()));
			firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function(userData) {
				firebase.database().ref('oauth').child(userData.user.uid).set(userId);
				if(callback)
				{
					callback(userData.user.uid);
				}
			}, function(error)
			{
				console.log('createUserWithEmail firebase error', error);

				if(error && error.code == 'auth/email-already-in-use')
				{
					firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).then(function(userData)
					{
						firebase.database().ref('oauth').child(userData.user.uid).set(userId);
						if(callback)
						{
							console.log('callback with userData.user.uid');
							callback(userData.user.uid);
						}
					}, function(err)
					{
						console.log('signInWithEmailAndPassword error', err);
					});
				}

				auth(self.getOauthHash(), callback, function(err)
				{
					console.log(err);
				});
			});
		},

		getFriend: function(fbAppScopedId, callback)
		{
			var ref = firebase.database().ref('friends/' + fbAppScopedId);
			ref.once('value', function(snap)
			{
				callback(snap.val());
			});
		},

		updateBreakdown: function()
		{
			var self = this;

			this.getCached(function(user)
			{
				var totalValue = user.cash;
				var breakdown = {cash: user.cash, oil: 0, forex: 0};

				_.each(user.positions, function(position)
				{
					var value = self.positionCashValue(position.pair);
					if ('OILUSD' == position.pair)
					{
						breakdown.oil = value;
					}
					else
					{
						breakdown.forex += value;
					}

					totalValue += value;
				});

				totalValue = Math.round(totalValue * 100) / 100;

				_.each(breakdown, function(value, pos)
				{
					breakdown[pos] = Math.round(value / totalValue * 100);
				});

				self.getInfo(function(info)
				{
					info.portfolio = totalValue;
					info.breakdown = breakdown;
					info.uid = userBatch.uid;
					if(user.isUserPro)
					{
						self.isUserPro = true;
					}
					self.saveBatch(info);
				});
			});
		},

		getTop: function(callback)
		{
			getTokenPromise().then((success) =>
			{
				requestMongo('/top', {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
				{
					if(callback)
					{
						callback(response.data);
					}
					else
					{
						return response.data;
					}
				});
			});
		},

		getTopBy: function(type, callback)
		{
			getTokenPromise().then((success) =>
			{
				requestMongo('/top/by/' + type, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
				{
					if(callback)
					{
						callback(response.data);
					}
					else
					{
						return response.data;
					}
				});
			});
		},

		getUserStats: function(id, callback, errorCallback)
		{
			requestMongo('/user/stats/' + id, {}, false, function(response)
			{
				// console.log('resp for id ' + id, response.data);
				if(callback)
				{
					callback(response.data);
				}
			}, errorCallback);
		},

		userCounterGet: function()
		{
			return new Promise((resolve, reject) =>
			{
				var cParams = {
					method: "GET"
				};

				requestMongo('/counter', false, cParams, function(response)
				{
					resolve({
						message: 'user counter retrieved',
						data: response.data,
						success: true
					});
				}, function(error)
				{
					reject({
						message: 'could not read user counter',
						success: false
					});
				});
			});
		},

		userCounterAdd: function()
		{
			return new Promise((resolve, reject) =>
			{
				var cParams = {
					method: "POST"
				};

				requestMongo('/counter', false, cParams, function(response)
				{
					resolve({
						message: 'user counter updated',
						counter: response.data
					});
				}, function(error)
				{
					reject({
						message: 'could not update user counter'
					});
				});
			});
		},

	    deleteUser: function()
	    {
			getTokenPromise().then((success) =>
			{
				var cParams = {
					method: "DELETE"
				};

				requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
				{
					user = null;
				});
			});
	    },

	    realDelete: function()
	    {
			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "DELETE"
					};

					requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						user = null;

						firebase.auth().signInWithEmailAndPassword(userId + "@goforexapp.com", userId).then(function()
						{
							firebase.auth().currentUser.delete();
						}, function(err)
						{
							console.log(err);
						});

						resolve({
							message: 'mongo user deleted',
							counter: response.data
						});
					}, function(error)
					{
						console.log('realDelete error', error);
						reject({
							message: 'could not delete mongo user',
							success: false
						});
					});
				});
			});
	    },

	    deleteUserBatch: function()
	    {
	    	var freshBatch = {"assetGrowths":[],"firebaseKeyId":userId,"uid":"temp","portfolio":0,"breakdown":{"cash":100,"forex":0,"oil":0},"growth":{"day":0,"week":0},"rank":{"day":0,"week":0,"portfolio":0},"rankChange":{"day":0,"week":0,"portfolio":0}};

	    	this.saveBatch(freshBatch).then(function()
	    	{
	    		console.log('batch deleted?');
	    	});
	    },

		reset: function()
		{
			user = null;
			userBatch = null;
		},

		reloadUser: function()
		{
			this.reset();
			this.get(function() {});
			this.getInfo(function() {});
		},

		resetAccount: function(cash)
	    {
			// console.error('resetting acc', cash);
	    	return new Promise((resolve, reject) =>
			{
		    	getTokenPromise().then((success) =>
		    	{
					var cParams = {
						method: "PUT",
						data: {cash: cash}
					};

		    		requestMongo('/user/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							// message: 'got tradehistory',
							data: response.data,
							success: true
						});
					}, function(error)
					{
						reject({
							// message: 'tradehistory error',
							success: false
						});
						console.log(error);
						throw(error);
					});
		    	});
			});
	    },

		addTradeHistoryRecord: function(position, value, closePrice, custom)
	    {
			if (!position.pair)
			{
				return;
			}

			var item = {
				type: position.type,
				value: value || 0,
				instrument: position.pair,
				openDate: position.date || new Date().getTime(),
				closeDate: new Date().getTime(),
				openPrice: position.openPrice || position.price || 0,
				closePrice: position.closePrice || closePrice || 0,
				quant: position.quant || 0,
				leverage: position.leverage || 0,
				amount: position.amount || 0,
				gain: position.gain || 0,
				length: position.length || 0,
				isStopLoss: position.isStopLoss || false
			};

			if ('USD' == position.pair.substr(0, 3))
			{
				item.type = ('sell' == item.type) ? 'buy' : 'sell';
			}

			if (value && item.quant && item.openPrice && item.leverage)
			{
				item.valuePct = (value / ((item.quant * item.openPrice) / item.leverage)) * 100;
			}

			if (custom)
			{
				item = _.merge(item, custom);
			}

			if (item.type)
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "POST",
						data: item
					};

					requestMongo('/tradehistory/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams);
				});
			}
	    },

	    getTradeHistory: function(skip, limit)
	    {
	    	if(!skip)
	    	{
	    		skip = 0;
	    	}

	    	if(!limit)
	    	{
	    		limit = 100;
	    	}

	    	return new Promise((resolve, reject) =>
			{
		    	getTokenPromise().then((success) =>
		    	{
					requestMongo('/tradehistory/' + userId + '?skip=' + skip + '&limit=' + limit, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
					{
						// other app did not have tradingSince variable set in the beginning
						if(window.isGoforex)
						{
							resolve({
								message: 'got tradehistory',
								data: response.data.filter(t => t.closeDate > user.tradingSince),
								success: true
							});
						}
						else
						{
							resolve({
								message: 'got tradehistory',
								data: response.data,
								success: true
							});
						}
					}, function(error)
					{
						reject({
							message: 'tradehistory error',
							success: false
						});
						console.log(error);
						throw(error);
					});
		    	});
			});
	    },

		// to get the last trade record from mongo db in case of a previous migration
	    getLastTradeRecord: function()
	    {
	    	return new Promise((resolve, reject) =>
			{
		    	getTokenPromise().then((success) =>
		    	{
					requestMongo('/tradehistory/getlast/' + userId, {'Authorization': 'Bearer ' + mongoToken}, false, function(response)
					{
						resolve({
							message: 'got tradehistory',
							data: response.data,
							success: true
						});
					}, function(error)
					{
						reject({
							message: 'last trade record error',
							success: false
						});
						console.log(error);
						throw(error);
					});
		    	});
			});
	    },

	    deleteTradeHistory: function()
	    {
	    	return new Promise((resolve, reject) =>
			{
		    	getTokenPromise().then((success) =>
		    	{
					var cParams = {
						method: "DELETE",
						data: {id: 'string'} //should remove this requirement from backend at some point maybe
					};

		    		requestMongo('/tradehistory/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'got tradehistory',
							data: response.data,
							success: true
						});
					}, function(error)
					{
						reject({
							message: 'tradehistory error',
							success: false
						});
						console.log(error);
						throw(error);
					});
		    	});
			});
	    },

		addFriend: function(firebaseKeyId, body, httpMethod, apiMethod) {
			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: httpMethod || "POST"
					};

					if (body) {
						cParams.data = {};
						if(body.userId)
						{
							cParams.data.userId = body.userId;
						}

						if(body.firebaseKeyId)
						{
							cParams.data.firebaseKeyId = body.firebaseKeyId;
						}

						if(body.inviteVerification)
						{
							cParams.data.inviteVerification = body.inviteVerification;
						}
					}

					requestMongo('/friend/' + (apiMethod ? apiMethod + '/' : '') + firebaseKeyId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						console.log('addFriend success'/*, response*/);
						resolve({
							message: 'friend request success',
							data: response.data,
							success: true
						});
					}, function(error)
					{
						console.log('addFriend error'/*, error*/);
						reject({
							message: error,
							success: false
						});

						throw(error);
					});
				});
			});
		},

		getFriends: function(userId) {
			return this.addFriend(userId, null, 'GET');
		},

		deleteFriend: function(firebaseKeyId, userId) {
			return this.addFriend(firebaseKeyId, userId, 'DELETE');
		},

		deleteAllFriends: function(firebaseKeyId) {
			return this.addFriend(firebaseKeyId, null, 'DELETE', 'all');
		},

		addQuizAnswers: function(version, body) {
			var postData = {
				setupQuestionsVersion: version,
				answers: body
			};
			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "POST",
						data: postData
					};
					requestMongo('/setupquiz/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'added quiz answers success',
							success: true
						});
					}, function(error)
					{
						console.warn('setup quiz error', error);
						reject({
							message: error,
							success: false
						});
					});
				});
			});
		},

		getLastActive: function(userId) {
			return new Promise((resolve, reject) =>
			{
				getTokenPromise().then((success) =>
				{
					var cParams = {
						method: "GET"
					};

					requestMongo('/friend/active/' + userId, {'Authorization': 'Bearer ' + mongoToken}, cParams, function(response)
					{
						resolve({
							message: 'got last friend Active time',
							success: true,
							data: response.data
						});
					}, function(error)
					{
						reject({
							message: error,
							success: false
						});
					});
				});
			});
		}

	}
})