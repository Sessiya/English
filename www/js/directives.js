angular.module('ionic').config(['$provide', $ionicScrollDelegateDecorator]);

function $ionicScrollDelegateDecorator($provide) {
	$provide.decorator('$ionicScrollDelegate', ['$delegate', decorateService]);

	function decorateService($delegate) {
		$delegate.$getByRealHandle = function $getByRealHandle(name) {
			var instances = this._instances;
			return instances.filter(function (instance) {
				return (angular.element(instance.element).attr('delegate-handle') == name);
			}).shift();
		};

		return $delegate;
	}
};

angular.module('starter.directives', [])

.directive('lessonHeadImage', function($compile)
{
	return {
		restrict: "E",
		scope: false,
		link: function(scope, element, attrs)
		{
			var width = document.body.offsetWidth;
			var size = window.imageSizes[attrs.src];
			var coef = size[0] / width;
			var newElem = angular.element('<delayed-svg sync="true" start="true" src="' + attrs.src + '" style="width: ' + Math.min(Math.round(size[0] / coef), size[0]) + 'px; height: ' + Math.min(Math.round(size[1] / coef), size[1]) + 'px;"></delayed-svg>');
			newElem = $compile(newElem)(scope);
			element.replaceWith(newElem);
		}
	};
})

.directive('renderedLesson', function(RenderedLessons, $timeout)
{
	return {
		restrict: "E",
		scope: true,
		link: function(scope, element, attrs)
		{
			var unwatch = scope.$watch(function() { return RenderedLessons.get(attrs.id); }, function(v)
			{
				var newElem = RenderedLessons.get(attrs.id);
				if (newElem)
				{
					unwatch();

					element.replaceWith(newElem);
					$timeout.cancel(destroyT);
					var destroyT = $timeout(function()
					{
						scope.$destroy();
					});
				}
			});
		}
	}
})

.directive('tradingtimes', function($interval, $timeout, MarketStatus){
	return {
		template:
/*
		'<div class="trading-times-block">' +
		'<img class="trading-times" src="img/lessons/trading-times-bg.png" alt="">' +
		'<div class="container-trading">' +
		'<div class="row1">' +
		'<div class="c21 r1">24</div>' +
		'<div class="c22 r1">1</div>' +
		'<div class="c23 r1">2</div>' +
		'<div class="c24 r1">3</div>' +
		'<div class="c1 r1">4</div>' +
		'<div class="c2 r1">5</div>' +
		'<div class="c3 r1">6</div>' +
		'<div class="c4 r1">7</div>' +
		'<div class="c5 r1">8</div>' +
		'<div class="c6 r1">9</div>' +
		'<div class="c7 r1">10</div>' +
		'<div class="c8 r1">11</div>' +
		'<div class="c9 r1">12</div>' +
		'<div class="c10 r1">13</div>' +
		'<div class="c11 r1">14</div>' +
		'<div class="c12 r1">15</div>' +
		'<div class="c13 r1">16</div>' +
		'<div class="c14 r1">17</div>' +
		'<div class="c15 r1">18</div>' +
		'<div class="c16 r1">19</div>' +
		'<div class="c17 r1">20</div>' +
		'<div class="c18 r1">21</div>' +
		'<div class="c19 r1">22</div>' +
		'<div class="c20 r1">23</div>' +
		'</div>' +
		'<div style="clear: both"></div>' +
		'<div class="row2">' +
		'<div class="city sydney">SYDNEY</div>' +
		'<div class="c6"></div>' +
		'<div class="c7"></div>' +
		'<div class="c8"></div>' +
		'<div class="c9"></div>' +
		'<div class="c10"></div>' +
		'<div class="c11"></div>' +
		'<div class="c12"></div>' +
		'<div class="c13"></div>' +
		'<div class="c14"></div>' +
		'<div class="c15"></div>' +
		'<div class="c16"></div>' +
		'<div class="c17"></div>' +
		'<div class="c18"></div>' +
		'<div class="c19"></div>' +
		'<div class="c20"></div>' +
		'</div>' +
		'<div style="clear: both"></div>' +
		'<div class="row3">' +
		'<div class="c21"></div>' +
		'<div class="c22"></div>' +
		'<div class="19 city tokyo">TOKYO</div>' +
		'<div class="c8"></div>' +
		'<div class="c9"></div>' +
		'<div class="c10"></div>' +
		'<div class="c11"></div>' +
		'<div class="c12"></div>' +
		'<div class="c13"></div>' +
		'<div class="c14"></div>' +
		'<div class="c15"></div>' +
		'<div class="c16"></div>' +
		'<div class="c17"></div>' +
		'<div class="c18"></div>' +
		'<div class="c19"></div>' +
		'<div class="c20"></div>' +
		'</div>' +
		'<div style="clear: both"></div>' +
		'<div class="row4">' +
		'<div class="c21"></div>' +
		'<div class="c22"></div>' +
		'<div class="c23"></div>' +
		'<div class="c24"></div>' +
		'<div class="c1"></div>' +
		'<div class="c2"></div>' +
		'<div class="c3"></div>' +
		'<div class="c4"></div>' +
		'<div class="c5"></div>' +
		'<div class="c6"></div>' +
		'<div class="3 city london">LONDON</div>' +
		'<div class="c16"></div>' +
		'<div class="c17"></div>' +
		'<div class="c18"></div>' +
		'<div class="c19"></div>' +
		'<div class="c20"></div>' +
		'</div>' +
		'<div style="clear: both"></div>' +
		'<div class="row5">' +
		'<div class="c21"></div>' +
		'<div class="c22"></div>' +
		'<div class="c23"></div>' +
		'<div class="c24"></div>' +
		'<div class="c1"></div>' +
		'<div class="c2"></div>' +
		'<div class="c3"></div>' +
		'<div class="c4"></div>' +
		'<div class="c5"></div>' +
		'<div class="c6"></div>' +
		'<div class="c7"></div>' +
		'<div class="c8"></div>' +
		'<div class="c9"></div>' +
		'<div class="c10"></div>' +
		'<div class="c11"></div>' +
		'<div class="8 city newyork">NEWYORK</div>' +
		'</div>' +
		'<div style="clear: both"></div>' +
		'</div>' +
		'<span class="time-now-text">TIME NOW</span><span class="time-now-number">{{ timeNow }}</span>' +
		'<span>TIMEZONE </span><span>{{ getTimeZone }}</span>' +
		'</div>',
*/
		'<div class="trading-times-block"><img class="trading-times" src="img/time-table-bg-cropped.png" alt=""><table class="trading-times"><tr class="first-row"> <td class="c21"><!-- <span class="overlays"></span> --><span class=" r1">21</span></td><td class="c22"><span class=" r1">22</span></td><td class="c23"><span class=" r1">23</span></td><td class="c24"><span class=" r1">24</span></td><td class="c1"><span class=" r1">1</span></td><td class="c2"><span class=" r1">2</span></td><td class="c3"><span class=" r1">3</span></td><td class="c4"><span class=" r1">4</span></td><td class="c5"><span class=" r1">5</span></td><td class="c6"><span class=" r1">6</span></td><td class="c7"><span class=" r1">7</span></td><td class="c8"><span class=" r1">8</span></td><td class="c9"><span class=" r1">9</span></td><td class="c10"><span class=" r1">10</span></td><td class="c11"><span class=" r1">11</span></td><td class="c12"><span class=" r1">12</span></td><td class="c13"><span class=" r1">13</span></td><td class="c14"><span class=" r1">14</span></td><td class="c15"><span class=" r1">15</span></td><td class="c16"><span class=" r1">16</span></td><td class="c17"><span class=" r1">17</span></td><td class="c18"><span class=" r1">18</span></td><td class="c19"><span class=" r1">19</span></td><td class="c20"><span class=" r1">20</span></td></tr><tr class="sydney-row"> <td class="c21 sydney" colspan="9"><span><t>SYDNEY</t></span></td><td class="c6"></td><td class="c7"></td><td class="c8"></td><td class="c9"></td><td class="c10"></td><td class="c11"></td><td class="c12"></td><td class="c13"></td><td class="c14"></td><td class="c15"></td><td class="c16"></td><td class="c17"></td><td class="c18"></td><td class="c19"></td><td class="c20"></td></tr><tr class="tokyo-row"> <td class="c21"></td><td class="c22"></td><td class="19 tokyo" colspan="9"><span><t>TOKYO</t></span></td><td class="c8"></td><td class="c9"></td><td class="c10"></td><td class="c11"></td><td class="c12"></td><td class="c13"></td><td class="c14"></td><td class="c15"></td><td class="c16"></td><td class="c17"></td><td class="c18"></td><td class="c19"></td><td class="c20"></td></tr><tr class="london-row"> <td class="c21"></td><td class="c22"></td><td class="c23"></td><td class="c24"></td><td class="c1"></td><td class="c2"></td><td class="c3"></td><td class="c4"></td><td class="c5"></td><td class="c6"></td><td class="3 london" colspan="9"><span><t>LONDON</t></span></td><td class="c16"></td><td class="c17"></td><td class="c18"></td><td class="c19"></td><td class="c20"></td></tr><tr class="newyork-row"> <td class="c21"></td><td class="c22"></td><td class="c23"></td><td class="c24"></td><td class="c1"></td><td class="c2"></td><td class="c3"></td><td class="c4"></td><td class="c5"></td><td class="c6"></td><td class="c7"></td><td class="c8"></td><td class="c9"></td><td class="c10"></td><td class="c11"></td><td class="9 newyork" colspan="9"><span><t>NEW YORK</t></span></td></tr></table><div><span class="time-now-text"><t>TIME NOW</t></span><span class="time-now-number">{{timeNow}}</span></div></div>',
		replace: true,
		scope: true,
		link: function(scope, element, attrs)
		{
			function addZero(i) {
				if (i < 10) {
					i = "0" + i;
				}
				return i;
			}

			var timeText = "";

			var intv = $interval(function() {
				scope.timeNow = scope.dateNowFunction() + " " + scope.timeNowFunction();
				fixHours();
				check(returnHours());
				scope.getTimeZone = scope.timeZone();

				calculateTimes();
				colourExchanges();
			}, 1000);

			scope.$on('$destroy', function() {
				$interval.cancel(intv);
			});

			function returnHours() {
				var timeNow = new Date();
				var timeZone = scope.timeZone();
				var hours = timeNow.getUTCHours() + 0;
				// if(hours > 24) hours = hours % 24;
				return hours;
			}

			function isWorkDay() {
				var date = new Date();
				var hours = date.getHours() + 0;
				var day = date.getDay();
				if(hours == 24 && day == 0)
					day = 1;
				// console.log(day + ',' + hours);
				if((day == 0) || (day == 6 && hours > 8)){
					return false;
				}
				return true;
			}

			function check(x) {
				var hours = x;

				prevElements = document.getElementsByClassName('c'.concat(hours-1));
				elements = document.getElementsByClassName('c'.concat(hours));

				if (!elements.length)
				{
					$interval.cancel(intv);
					return;
				}

				elementsT = document.getElementsByClassName('r1');

				timeElement = document.getElementsByClassName('time-now-number');
				timeTextElement = document.getElementsByClassName('time-now-text');

				if (isWorkDay()){
					for (var i = 0; i < elements.length; i++) {
						elements[i].style.backgroundColor="#6cb476";
					}
					timeElement[0].style.backgroundColor="#6cb476";
					//~ timeElement[0].style.color="#13344f";
					timeTextElement[0].innerHTML=scope.t("TIME NOW");
				} else {
					for (var i = 0; i < elements.length; i++) {
						elements[i].style.backgroundColor="#c2363a";
					}
					timeElement[0].style.backgroundColor="#c2363a";
					timeElement[0].style.color="#fff";
					timeTextElement[0].innerHTML=scope.t("MARKETS CLOSED");
				}

				elements[0].style.border="none";
				elements[0].style.lineHeight="2.4vw";
				var timeDif = scope.timeZone();
				var hoursT = (hours+3)%24;
				elementsT[hoursT].style.color="#13334f";
				elementsT[hoursT-1].style.color="#fff";

				for (var i = 0; i < prevElements.length; i++) {
					prevElements[i].style.backgroundColor="#d7dbda";
				}
				if(prevElements && prevElements[0])
				{
					prevElements[0].style.backgroundColor="#333";
					prevElements[0].style.lineHeight="1.2vw";
					prevElements[0].style.borderTop="0.6vw solid #fff";
				}
			}

			function fixHours() {
				elements = document.getElementsByClassName('r1');

				if(elements.length == 0) return;

				var timeDif = scope.timeZone();
				var hour = 22 + timeDif - 1;
				if(hour > 24){
					hour = hour % 24;
				}
				for (var i = 0; i < elements.length; i++){
					// hour = hour + timeDif;
					// if(hour > 24) {
						// 	var x = hour % 24;
						// 	hour = 0 + x;
						// }
						elements[i].innerHTML = hour;
						hour++;
						if(hour > 24) hour = 1;
					}
				}

				scope.timeZone = function(){
					var time = new Date();
					var hoursNow = time.getHours();
					var hoursUTC = time.getUTCHours();
					var dif = hoursNow - hoursUTC;
					return dif;
				};

				scope.dateNowFunction = function(){
					var dateObj = new Date();
					var month = dateObj.getUTCMonth() + 1;
					var day = dateObj.getUTCDate();
					var year = dateObj.getUTCFullYear();
					var date = year + '.' + month + '.' + day;
					return date;
				}

				scope.timeNowFunction = function(){
					scope.currentDate = new Date();
					var timeNow = new Date();
					var hours = addZero(timeNow.getHours());
					var minutes = addZero(timeNow.getMinutes());
					var seconds = addZero(timeNow.getSeconds());
					var timeNowFormatted = hours + ':' + minutes + ':' + seconds;
					return timeNowFormatted;
				};


				var exchanges = ["Europe/London", "America/New_York", "Australia/Sydney", "Asia/Tokyo"];

				scope.isOpen = {};
				scope.untilOpenText = {};

				var _untilCloseCapt = scope.t('until closing');
				var _untilOpenCapt = scope.t('until opening');

				var calculateInterval = $interval(function()
				{
					if (!element[0].offsetTop || element[0].offsetTop > window.screen.height * 4)
					{
						return;
					}

					calculateTimes();

					$timeout.cancel(digestT);
					var digestT = $timeout(function() { scope.$digest(); });
				}, 1000, 0, false);

				scope.$on('$destroy', function() {
					$interval.cancel(calculateInterval);
				});

				var calculateTimes = function()
				{
					angular.forEach(exchanges, function(exchange)
					{
						var timeUntilOpen = untilOpen(exchange);
						scope.isOpen[exchange] = (timeUntilOpen == '0:00:00');

						if (scope.isOpen[exchange])
						{
							scope.untilOpenText[exchange] = untilClose(exchange) + ' ' + _untilCloseCapt;
						}
						else
						{
							scope.untilOpenText[exchange] = timeUntilOpen + ' ' + _untilOpenCapt;
						}
					});
				}

				var untilOpen = function(tz)
				{
					return MarketStatus.formatTime(MarketStatus.untilOpen('forex'));
				};

				var untilClose = function(tz)
				{
					return MarketStatus.formatTime(MarketStatus.untilClose('forex'));
				};

				colourExchanges = function()
				{
					var defaultColors = ['#ff5b4f', '#31aad6', '#9d7dbd', '#ff8e38'];
					var goldColor = '#6cb476';

					if(scope.isOpen["Australia/Sydney"])
					{
						_.each(document.querySelectorAll('.sydney'), function(el) { el.style.backgroundColor = goldColor; });
					}
					else
					{
						_.each(document.querySelectorAll('.sydney'), function(el) { el.style.backgroundColor = defaultColors[0]; });
					}

					if(scope.isOpen["Asia/Tokyo"])
					{
						_.each(document.querySelectorAll('.tokyo'), function(el) { el.style.backgroundColor = goldColor; });
					}
					else
					{
						_.each(document.querySelectorAll('.tokyo'), function(el) { el.style.backgroundColor = defaultColors[1]; });
					}

					if(scope.isOpen["Europe/London"])
					{
						_.each(document.querySelectorAll('.london'), function(el) { el.style.backgroundColor = goldColor; });
					}
					else
					{
						_.each(document.querySelectorAll('.london'), function(el) { el.style.backgroundColor = defaultColors[2]; });
					}

					if(scope.isOpen["America/New_York"])
					{
						_.each(document.querySelectorAll('.newyork'), function(el) { el.style.backgroundColor = goldColor; });
					}
					else
					{
						_.each(document.querySelectorAll('.newyork'), function(el) { el.style.backgroundColor = defaultColors[4]; });
					}
				}

				element.on('$destroy', function () { scope.$destroy(); });
			}
		}
	})

.directive('besttime', function($interval, $timeout, MarketStatus)
{
	return {
		template: '<div><table id="best-time">' +
		'<tr><td class="best-sydney"><t>SYDNEY</t><td></td><td ng-class="{\'isOpen\': isOpen[\'Pacific/Efate\'] }">{{ untilOpenText["Australia/Sydney"] }}</td></tr>' +
		'<tr><td class="best-tokyo"><t>TOKYO</t><td></td><td ng-class="{\'isOpen\': isOpen[\'Asia/Tokyo\'] }">{{ untilOpenText["Asia/Tokyo"] }}</td></tr>' +
		'<tr><td class="best-london"><t>LONDON</t><td></td><td ng-class="{\'isOpen\': isOpen[\'Europe/London\'] }">{{ untilOpenText["Europe/London"] }}</td></tr>' +
		'<tr><td class="best-newyork"><t>NEW YORK</t><td></td><td ng-class="{\'isOpen\': isOpen[\'America/New_York\'] }">{{ untilOpenText["America/New_York"] }}</td></tr>' +
		'</table><div id="besttime-sub">* <t>Market times auto-calculated by current location.</t></div>',
		replace: true,
		scope: true,
		link: function(scope, element, attrs)
		{
			var exchanges = ["Europe/London", "America/New_York", "Australia/Sydney", "Asia/Tokyo", "Pacific/Efate"];

			scope.isOpen = {};
			scope.untilOpenText = {};

			var _untilCloseCapt = scope.t('until closing');
			var _untilOpenCapt = scope.t('until opening');

			var calculateInterval = $interval(function()
			{
				if (!element[0].offsetTop || element[0].offsetTop > window.screen.height * 4)
				{
					return;
				}

				calculateTimes();

				$timeout.cancel(digestT);
				var digestT = $timeout(function() { scope.$digest(); });
			}, 1000, 0, false);

			scope.$on('$destroy', function() {
				$interval.cancel(calculateInterval);
			});

			var calculateTimes = function()
			{
				angular.forEach(exchanges, function(exchange)
				{
					var timeUntilOpen = untilOpen(exchange);

					scope.isOpen[exchange] = (timeUntilOpen == '0:00:00');

					if (scope.isOpen[exchange])
					{
						scope.untilOpenText[exchange] = untilClose(exchange) + ' ' + _untilCloseCapt;
					}
					else
					{
						scope.untilOpenText[exchange] = timeUntilOpen + ' ' + _untilOpenCapt;
					}
				});
			}

			var untilOpen = function(tz)
			{
				return MarketStatus.formatTime(MarketStatus.untilForexOpen(tz));
			};

			var untilClose = function(tz)
			{
				return MarketStatus.formatTime(MarketStatus.untilForexClose(tz));
			};

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.directive('bestPlatforms', function()
{
	return {
		template: '<div class="top-platforms-container"><ol class="bigsquare top-platforms"> \
		<li ng-click="openLink(\'https://financeillustrated.com/etoro\', \'etoro_lesson_social\')"><div class="row"><div class="col-70"><span class="platf-name">eToro<span class="platform-comment"> - <t>20+ million users</t></span></span></div><div class="col-30 visit"><a href=""><t>Visit</t></a></div></div></li> \
		<li ng-click="openLink(\'https://financeillustrated.com/avatrade\', \'ava_lesson_social\')"><div class="row"><div class="col-70"><span class="platf-name">AvAtrade<span class="platform-comment"> - <t>can copy robots</t></span></span></div><div class="col-30 visit"><a href=""><t>Visit</t></a></div></div></li> \
		</ol></div>',
		replace: true
	}
})

.directive('lottie', function()
{
	return {
		restrict: "E",
		scope: {path: '@', autoplay: '@', loop: '@', lottieid: '@'},
		link: function(scope, element, attrs)
		{
			const conf = {
				container: element[0], // the dom element that will contain the animation
				// renderer: 'html',
				loop: scope.loop === undefined ? true : (scope.loop != 'false' ? ~~scope.loop : false),
				autoplay: scope.autoplay != 'false',
				path: scope.path // the path to the animation json
			};

			if (!scope.lottieid) {
				scope.lottieid = scope.path;
			}

			var inst = lottie.loadAnimation(conf);

			if (scope.lottieid) {
				if (!window.lottieInstances) {
					window.lottieInstances = {};
				}

				if (window.lottieInstances[scope.lottieid]) {
					console.log('lottie instance already exists', scope.lottieid);
					window.lottieInstances[scope.lottieid].destroy();
				}

				window.lottieInstances[scope.lottieid] = inst;
			}

			if (!window.lottieInterval) {
				window.lottieInterval = window.setInterval(function() {
					if (window.lottieInstances) {
						for (var k in window.lottieInstances) {
							var instance = window.lottieInstances[k];
							if (!instance.wrapper || !instance.wrapper.parentNode) {
								window.setTimeout(function() {
									instance.destroy();
									delete window.lottieInstances[k];
									console.log('destroyed lottie', k);
								}, 1000);
							} else if (!instance.wrapper.parentNode.offsetWidth && !instance.isPaused) {
								instance.pause();
								console.log('paused lottie', k);
							} else if (instance.wrapper.parentNode.offsetWidth && instance.isPaused) {
								// only auto-play if the instance does not have an id
								if (k.includes('/')) {
									instance.play();
									console.log('restarted lottie', k);
								}
							}
						}
					}
				}, 1000);

				document.addEventListener('pause', function() {
					var inst = window.lottieInstances[scope.lottieid];
					if (inst && !inst.isPaused) {
						inst.pause();

						var resume = function() {
							inst.play();
							document.removeEventListener('resume', resume);
						};

						document.addEventListener('resume', resume);
					}
				})
			}
		}
	}
})

.directive('countDownTimer', function($interval, QuizCountdown)
{
	var image = new Image();
	var imgRoot = window.location.href.split('#').shift().split('/').slice(0, -1).join('/') + '/img/';
	image.src = imgRoot + 'flame.png';

	var drawSolidLine = function(ctx, x, y, toX, toY, color)
	{
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(toX, toY);
		ctx.setLineDash([]);
		ctx.strokeStyle = color;
		ctx.lineWidth = 4;
		ctx.globalAlpha = 1;
		ctx.stroke();
		ctx.restore();
	};

	var drawIcon = function(ctx, x, size)
	{
		ctx.drawImage(image, x - (size / 2), 2, size, size * image.height / image.width);
	};

	return {
		template: '<div class="countdown"><canvas style="width: 100%; height: 100%;"></canvas></div>',
		replace: true,
		scope: true,
		link: function($scope, elem, attr) {
			var progress = angular.element(elem).find('canvas')[0];
			progress.width = progress.clientWidth;
			progress.height = progress.clientHeight;
			var width = progress.clientWidth / 102;
			var ctx = progress.getContext("2d");

			var interval = $interval(function()
			{
				ctx.clearRect(0, 0, progress.width, progress.height * 4);
				var len = (100 - QuizCountdown.getPct()) * width;

				var y = (progress.clientHeight - 4) / 2;

				drawSolidLine(ctx, 0, y, len, y, '#d27e90');
				drawIcon(ctx, len, progress.height);
			}, 50, 0, false);

			$scope.$on('$destroy', function() {
				$interval.cancel(interval);
			});

			elem.on('$destroy', function () { $scope.$destroy(); });
		}
	}
})

.directive('quizChart', function(VMin, $interval)
{
	return {
		restrict: "E",
		scope: {data: '='},
		template: '<div class="quiz-chart-container"><div class="chart-inner-container"></div>' +
		'<div ng-if="isQuestion" class="chartTooltipContainer" style="left: {{ tooltipLeft }}px; top: {{ tooltipTop }}px;"><span class="chartTooltip">{{ breakRate }}</span></div>' +
		'</div>',
		replace: true,
		link: function(scope, element, attrs)
		{
			scope.$watch('data', function()
			{
				// move label from the first/last data points to fit in the chart better
				var dataSet = scope.data.dataPoints;
				if (dataSet[0][1])
				{
					dataSet[1][1] = dataSet[0][1];
					dataSet[0][1] = '';
				}

				if (dataSet[dataSet.length - 1][1])
				{
					dataSet[dataSet.length - 2][1] = dataSet[dataSet.length - 1][1];
					dataSet[dataSet.length - 1][1] = '';
				}

				scope.isQuestion = attrs.question;

				scope.tooltipLeft = -9999;

				window.quizChartCount = (window.quizChartCount || 0) + 1;
				var chartID = 'quizchart-' + window.quizChartCount;
				var getData = function()
				{
					var data = {main: [], hidden: [], up: [], down: []};
					var stop = false;
					_.each(scope.data.dataPoints, function(item, i)
					{
						if (!item[1])
						{
							item[1] = '';
						}

						if (i == scope.data.breakIndex + 1)
						{
							stop = true;

							// next point up or down?
							var main = data.main;
							var l = main.length - 1;
							var diff = Math.abs(scope.data.dataPoints[i + 1][2] - scope.data.dataPoints[i][2]);
							data.up.push({y: main[l].y, x: main[l].x, label: item[1]});
							data.up.push({y: main[l].y + diff, x: main[l].x + 1, label: '', markerType: 'circle', markerSize: VMin(2.2), markerColor: '#7dbc86'});
							data.down.push({y: main[l].y, x: main[l].x, label: item[1]});
							data.down.push({y: main[l].y - diff, x: main[l].x + 1, label: '', markerType: 'circle', markerSize: VMin(2.2), markerColor: '#db4d53'});

							scope.breakRate = main[l].y;
						}

						if (!item.length)
						{
							return;
						}

						item[2] = parseFloat(item[2]);

						var dataPoint = {x: item[0], y: item[2], label: item[1]};
						if (i == scope.data.breakIndex)
						{
							if (!attrs.question)
							{
								data.hidden.push(dataPoint);
							}

							dataPoint.markerType = 'circle';
							dataPoint.markerSize = VMin(attrs.question ? 3 : 5);
							dataPoint.markerColor = '#369ddf';
						}

						if (i > scope.data.breakIndex)
						{
							if (!attrs.question)
							{
								data.hidden.push(dataPoint);
							}
						}
						else
						{
							data.main.push(dataPoint);
						}
					});

					return data;
				};

				var dataPoints = getData();

				var data =
				[
					{
						name: 'Rates',
						dataPoints: dataPoints.main,
						color: '#666666',
						lineThickness: VMin(0.8),
						type: 'line',
						axisYType: "secondary",
						markerType: 'none',
						risingColor: "green",
					}
				];

				if (attrs.question)
				{
					data.push({
						name: 'Up?',
						dataPoints: dataPoints.up,
						color: '#d8d8d8',
						lineThickness: VMin(0.8),
						type: 'line',
						axisYType: "secondary",
						markerType: 'none',
					});

					data.push({
						name: 'Down?',
						dataPoints: dataPoints.down,
						color: '#d8d8d8',
						lineThickness: VMin(0.8),
						type: 'line',
						axisYType: "secondary",
						markerType: 'none',
					});
				}

				if (!attrs.question)
				{
					data.push({
						name: 'Hidden',
						dataPoints: dataPoints.hidden,
						color: '#ff0000',
						lineThickness: VMin(0.8),
						type: 'line',
						axisYType: "secondary",
						markerType: 'none',
					});
				}

				angular.element(element[0].querySelector('.chart-inner-container')).attr('id', chartID);

				var chartOpts = {
					theme: 'theme1',
					toolTip: {enabled: false},
					zoomEnabled: false,
					axisY2: {
						includeZero: false,
						tickThickness: 0,
						lineThickness: 0,
						gridThickness: 0,
						labelFontFamily: window.appConfig.chartFontFamily || "BebasRegular",
						labelFontColor: "#ffffff",
						labelFontSize: 0,
						labelMaxWidth: 0,
						labelFormatter: function(e) {
							return '';
						}
					},

					axisX: {
						margin: VMin(-3),
						labelFontSize: VMin(attrs.question ? 4 : 6),
						lineThickness: 0,
						tickThickness: 0,
						labelFontFamily: window.appConfig.chartFontFamily || "BebasRegular",
						labelFontColor: "#000000",
						labelWrap: false,
						labelAutoFit: true,
						labelMaxWidth: 300,
						interval: 1,
						labelFormatter: function(e)
						{
							if (e.label)
							{
								return '';
								return scope.isQuestion ? e.label : ' ';
							}
							else
							{
								return '';
							}
						}
					},

					axisYType: "secondary",
					data: data,
					creditHref: '',
					creditText: '',
					backgroundColor: "#ffffff"
				};


				var waitForHeight = $interval(function()
				{
					var height = element[0].clientHeight;
					var width = element[0].clientWidth;

					if (!height)
					{
						return;
					}

					chartOpts.height = height;
					chartOpts.width = width;

					var chart = new CanvasJS.Chart(chartID, chartOpts);
					var marked = false;

					chart.setMarkerCallback(function(x, y)
					{
						if (!marked)
						{
							updateMarkerPosition(x, y);
							marked = true;
						}
					});

					var updateMarkerPosition = function(x, y)
					{
						scope.tooltipLeft = x - 100;
						scope.tooltipTop = y - VMin(8);
						//~ chartDot.attr('style', 'left: ' + (x - 100) + 'px; top: ' + (y - 10) + 'px;');
					};

					chart.render();

					$interval.cancel(waitForHeight);
				}, 50, 0, false);
			});

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.directive('battleHistoryNode', function()
{
	return {
		restrict: "E",
		scope: {user: '=', pos: '=', opponentid: '=', playerid: '=', getsymbolname: '=', formattedbattleresult: '=', battle: '=', opponent: '='},
		templateUrl: 'battle-history-node',
		replace: true,
		link: function(scope, element, attrs)
		{
			element.on('$destroy', function () { scope.$destroy(); });
			window.clearTimeout(hideT);
			var hideT = window.setTimeout(function()
			{
				element[0].parentNode.style = '';
			}, 700);
		}
	}
})

.directive('delayedSvg', function($interval, $rootScope, $timeout, $ImageCacheFactory, LoaderOverlay)
{
	return {
		restrict: "E",
		scope: {src: '@'},
		template: '<div class="xsvg-container"></div>',
		replace: true,
		link: function(scope, element, attrs)
		{
			if (attrs.sync)
			{
				// hide lesson loading popup
				$timeout.cancel(hideT);
				var hideT = $timeout(function()
				{
					LoaderOverlay.hide();
				}, 100, false);
			}

			var top = element[0].offsetTop;
			var containerHeight = 0;
			var isVisible = false;
			var elementHeight = 0;
			var isLoaded = false;
			var isAnimated = false;
			var svgElement = false;
			var lastScrollStarted = 0;
			var isTouching = false;
			var isForceStop = false;

			function asyncInnerHTML(HTML, callback) {
				var temp = document.createElement('div'),
					frag = document.createDocumentFragment();
				temp.innerHTML = HTML;
				(function(){
					if(temp.firstChild){
						frag.appendChild(temp.firstChild);
						clearTimeout(somethingT);
						var somethingT = setTimeout(arguments.callee, 0);
					} else {
						callback(frag);
					}
				})();
			};

			function syncInnerHTML(HTML, callback) {
				var temp = document.createElement('div');
				temp.innerHTML = HTML;
				callback(temp.firstChild);
			};

			var findScroll = $interval(function()
			{
				var scroll = element[0];
				while (!angular.element(scroll).hasClass('scroll'))
				{
					if (!scroll.parentNode)
					{
						return;
					}

					scroll = scroll.parentNode;
				}

				$interval.cancel(findScroll);

				containerHeight = scroll.offsetHeight;
				top = element[0].offsetTop;

				var handleScroll = function(e)
				{
					top = element[0].offsetTop;
					var scrollRangeFrom = top - containerHeight;
					var scrollRangeTo = top + elementHeight;

					if (svgElement)
					{
						svgElement.pauseAnimations();
					}

					if ((scroll.scrollTop >= scrollRangeFrom) && (scroll.scrollTop <= scrollRangeTo))
					{
						lastScrollStarted = Date.now();
					}
				};

				var size = window.imageSizes[attrs.src];
				var width = element[0].parentNode.clientWidth;
				var height = (width / size[0]) * size[1];
				elementHeight = height;
				element.attr('style', 'width: ' + Math.round(width) + 'px; height: ' + Math.round(height) + 'px;');

				angular.element(scroll).on('scroll', function() { handleScroll(); });
				angular.element(scroll).on('touchstart', function() { isTouching = true; handleScroll(); });
				angular.element(scroll).on('touchend', function() { isTouching = false; });
				angular.element(scroll).on('touchmove', function() { handleScroll(); });
				handleScroll();
			}, 100, 0, false);

			window.clearInterval(intv);
			var intv = window.setInterval(function()
			{
				if ((Date.now() - lastScrollStarted > 2000))
				{
					isTouching = false;
				}

				if (svgElement && !isTouching && !isForceStop && lastScrollStarted && (Date.now() - lastScrollStarted > 100))
				{
					window.clearTimeout(unpauseT);
					var unpauseT = window.setTimeout(function()
					{
						svgElement.unpauseAnimations();

						window.clearTimeout(pauseT);
						var pauseT = window.setTimeout(function()
						{
							svgElement.pauseAnimations();
						}, 5000);

					}, 100);
					lastScrollStarted = null;
				}
			}, 500);

			var stopsvg = $rootScope.$on('stopsvg', function()
			{
				isForceStop = true;
				if (svgElement)
				{
					svgElement.pauseAnimations();
				}
				stopsvg();
			});

			var deletesvg = $rootScope.$on('deletesvg', function()
			{
				isForceStop = true;
				if (svgElement)
				{
					svgElement.pauseAnimations();
				}
				// angular.element(scroll).remove();
				// angular.element(scroll).off('scroll', function() { handleScroll(); });
				// angular.element(scroll).off('touchstart', function() { isTouching = true; handleScroll(); });
				// angular.element(scroll).off('touchend', function() { isTouching = false; });
				// angular.element(scroll).off('touchmove', function() { handleScroll(); });

				// $interval.cancel(findScroll);
				// window.clearInterval(intv);

				// window.setTimeout(function()
				// {
				// 	var i = document.querySelectorAll('.xsvg-container').length;
				// 	while(i > 0)
				// 	{
				// 		var element = document.querySelectorAll('.xsvg-container')[i - 1];
				// 		element.parentNode.removeChild(element);
				// 		element.remove();
				// 		i--;
				// 	}

					deletesvg();
				// }, 500);
			});

			var startsvg = $rootScope.$on('startsvg', function()
			{
				$timeout.cancel(stopT);
				var stopT = $timeout(function()
				{
					isForceStop = false;
				}, 500, false);
				startsvg();
			});

			var showSvg = function()
			{
				var loadFullSvg = function()
				{
					var func = attrs.sync ? syncInnerHTML : asyncInnerHTML;
					func('<object data="' + attrs.src + '" />', function(c) {
						element[0].innerHTML = '';
						element[0].appendChild(c);

						$interval.cancel(waitForSvg);
						var waitForSvg = $interval(function()
						{
							if (!element[0].firstChild.contentDocument)
							{
								$interval.cancel(waitForSvg);
								scope.$destroy();
							}

							if(element && element[0] && element[0].firstChild && element[0].firstChild.contentDocument)
							{
								svgElement = element[0].firstChild.contentDocument.rootElement;
								if (svgElement)
								{
									$interval.cancel(waitForSvg);
									if (!attrs.start)
									{
										svgElement.pauseAnimations();
									}
								}
							}
						}, 500, 0, false);
					});
				}

				loadFullSvg();
			};

			showSvg();

			element.on('$destroy', function () {
				scope.$destroy();
				// deletesvg();
				window.clearInterval(intv);
			});
		}
	}
})

.directive('iosDblclick',
    function () {

        const DblClickInterval = 300; //milliseconds

        var firstClickTime;
        var waitingSecondClick = false;

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {

                    if (!waitingSecondClick) {
                        firstClickTime = (new Date()).getTime();
                        waitingSecondClick = true;

						clearTimeout(secondClickT);
                        var secondClickT = setTimeout(function () {
                            waitingSecondClick = false;
                        }, DblClickInterval);
                    }
                    else {
                        waitingSecondClick = false;

                        var time = (new Date()).getTime();
                        if (time - firstClickTime < DblClickInterval) {
                            scope.$apply(attrs.iosDblclick);
                        }
                    }
                });
            }
        };
    })

.directive('expand', function($compile, $rootScope)
{
	return {
		restrict: "E",
		scope: true,
		link: function(scope, element, attrs)
		{
			var head = element.find('expand-head');
			var content = element.find('expand-content');

			head.attr('ng-click', 'expand()');
			element.attr('ng-class', "{'expanded' : expanded}");

			scope.expanded = false;
			scope.expand = function()
			{
				scope.expanded = !scope.expanded;
				if (scope.expanded)
				{
					element.addClass('expanded');
				}
				else
				{
					element.removeClass('expanded');
				}
			}

			head = $compile(head)(scope);
			content = $compile(content)(scope);

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.directive('iosRangeFix', function()
{
	return {
		restrict: "A",
		link: function(scope, element, attrs)
		{
			element.addEventListener('touchstart', function(e)
			{
				if (window.device.platformManual == 'iOS')
				{
					var progress = (e.target.max / e.target.offsetWidth) * (e.gesture.touches[0].screenX - e.target.offsetLeft);
				}
			});

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.directive('xxxgoNative', ['$ionicGesture', '$ionicPlatform', function($ionicGesture, $ionicPlatform) {
  return {
    restrict: 'A',

    link: function(scope, element, attrs) {

      $ionicGesture.on('tap', function(e) {

        var direction = attrs.direction;
        var transitiontype = attrs.transitiontype;

        document.addEventListener('deviceready', function() {

		  if (!window.plugins || !window.plugins.nativepagetransitions)
		  {
			return;
		  }

          switch (transitiontype) {
            case "slide":
              window.plugins.nativepagetransitions.slide({
                  "direction": direction
                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
              break;
            case "flip":
              window.plugins.nativepagetransitions.flip({
                  "direction": direction
                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
              break;

            case "fade":
              window.plugins.nativepagetransitions.fade({

                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
              break;

            case "drawer":
              window.plugins.nativepagetransitions.drawer({
                  "origin"         : direction,
                  "action"         : "open"
                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
              break;

            case "curl":
              window.plugins.nativepagetransitions.curl({
                  "direction": direction
                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
              break;

            default:
              window.plugins.nativepagetransitions.slide({
                  "direction": direction
                },
                function(msg) {
                  console.log("success: " + msg)
                },
                function(msg) {
                  alert("error: " + msg)
                }
              );
          }


        });
      }, element);
    }
  };
}])

.directive('evenWidth', function()
{
	return {
		restrict: "A",
		link: function(scope, element, attrs)
		{
			var resize = function()
			{
				if (element[0].clientWidth % 2)
				{
					element[0].style.width = (element[0].clientWidth + 1) + 'px';
				}

				if (element[0].clientHeight % 2)
				{
					element[0].style.height = (element[0].clientHeight + 1) + 'px';
				}

				if (!element[0].clientWidth)
				{
					window.clearTimeout(resizeT);
					var resizeT = window.setTimeout(function()
					{
						resize();
					}, 100);
				}
			};

			resize();
			window.clearTimeout(resizeT);
			var resizeT = window.setTimeout(function()
			{
				resize();
			}, 500);

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.directive('battleCountdown', function()
{
	return {
		restrict: "E",
		template: '<span>3</span>',
		replace: true,
		link: function(scope, element, attrs)
		{
			var time = 3;
			window.clearInterval(countdownI);
			var countdownI = window.setInterval(function()
			{
				time--;
				time = Math.max(0, time);
				element[0].innerHTML = time.toString();
			}, 1000);
		}
	}
})

.directive('iosWashout', function()
{
	return {
		restrict: "A",
		link: function(scope, element, attrs)
		{
			if (!window.device || !window.device.platformManual == 'iOS')
			{
				return;
			}

			var prev = '';
			var el = element[0];
			window.clearInterval(intv);
			var intv = window.setInterval(function()
			{
				if (!el || !el.parentNode)
				{
					window.clearInterval(intv);
					return;
				}

				var html = el.innerHTML;
				if (html != prev)
				{
					prev = html;
					el.style.display = 'none';
					el.offsetHeight;
					el.style.display = '';
				}
			}, 1000);
		}
	}
})

.directive('simpleCharta', function($timeout)
{
	return {
		restrict: "E",
		scope: {data: '<', answer: '=', rendercallback: '=', answercorrect: '=', useranswer: '=', questionid: '=', currency: '='},
		template: '<div class="quiz-chart-container"><div class="chart-inner-container"></div></div>',
		replace: true,
		link: function(scope, element, attrs)
		{

			// var testOnce = scope.$watch('data', function()
			scope.$watch('currency', function()
			{

				if(!scope.data)
				{
					return;
				}

				var bonusData = {};
				bonusData.breakIndex = scope.data.breakIndex;

				var bonusChartData = scope.data;
				var completeData = scope.data["completeData"];
				var inCompleteData = scope.data["inCompleteData"];

				var lowest = 999999;
				var highest = 0;

				for(var i = 0; i < inCompleteData.length; i++)
				{
					if(inCompleteData[i]["y"] < lowest)
					{
						lowest = inCompleteData[i]["y"];
					}

					if(inCompleteData[i]["y"] > highest)
					{
						highest = inCompleteData[i]["y"];
					}
				}

				var delta = highest - lowest;

				bonusData["type"] = 'line';
				bonusData["color"] = '#666';
				bonusData["lineThickness"] = 2;
				bonusData["tickThickness"] = 0;
				bonusData["markerSize"] = 0;
				// inCompleteData[bonusData.breakIndex]["lineColor"] = 'transparent';

				inCompleteData[bonusData.breakIndex]["markerSize"] = 8;

				var dataInArray = [];
				dataInArray.push(bonusData);

				for(var i = 0; i < inCompleteData.length; i++)
				{
					if(i != bonusData.breakIndex)
					{
						inCompleteData[i]["markerSize"] = 0;
						inCompleteData[i]["markerColor"] = 'transparent';
					}
				}

				for(var i = bonusData.breakIndex; i < inCompleteData.length; i++)
				{
					inCompleteData[i]["lineColor"] = 'transparent';
				}

				dataInArray[0].dataPoints = inCompleteData;

				// taisīsim ar šādu hacku, nekā savādāk nesanāk saprast, kas par lietu
				for (var k = 0; k < dataInArray[0].dataPoints.length; k++)
				{
					dataInArray[0].dataPoints[k].x = new Date(2017, 0, k);
				}

				var chartOpts = {
					theme: 'theme1',
					toolTip: {enabled: false},
					zoomEnabled: false,
					axisX: {
						lineThickness: 0,
						tickThickness: 0,
						labelWrap: false,
						display: false,
						includeZero: false,
						labelFormatter: function(e) { return '';}
					},
					axisY: {
						lineThickness: 0,
						tickThickness: 0,
						labelWrap: false,
						gridThickness: 0,
						margin: -10,
						includeZero: false,
						maximum: (highest + delta),
						minimum: (lowest - delta),
						labelFormatter: function(e) { return '';}
					},
					data: dataInArray,
					creditHref: '',
					creditText: '',
					backgroundColor: 'transparent'
				};

				window.bonusChartCount = (window.bonusChartCount || 0) + 1;

				var chartID = 'bonuschart-' + window.bonusChartCount;

				var el = element[0].querySelector('.chart-inner-container');
				angular.element(el).attr('id', chartID);

				var chart = new CanvasJS.Chart(chartID, chartOpts);

				scope.getChart = function()
				{
					return chart;
				};

				var padding = 1;

				scope.getPadding = function()
				{
					return padding;
				};

				$timeout.cancel(chartT);
				var chartT = $timeout(function(){
					chart.render();
				});

				if (scope.rendercallback)
				{
					scope.rendercallback(scope);
				}

				scope.$watch('answer', function()
				{
					if(scope.answer)
					{
						for(var i = 0; i < completeData.length; i++)
						{
							completeData[i]["lineColor"] = '#666';
							completeData[i]["markerColor"] = 'transparent';
						}

						chart.options.data[0].dataPoints = completeData;
						for (var k = 0; k < dataInArray[0].dataPoints.length; k++)
						{
							dataInArray[0].dataPoints[k].x = new Date(2017, 0, k);
						}
						$timeout(function(){
							chart.render();
						});

						scope.getChart2 = function()
						{
							return chart;
						};

						if (scope.rendercallback)
						{
							scope.rendercallback(scope);
						}
					}
				});

				document.getElementsByClassName('canvasjs-chart-container')[0].style.height = "30vh";

			});

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

.filter('mathAbs', function() {
    return function(num)
    {
    	if(!isNaN(num))
    	{
    		if(num == '0')
    		{
    			return '0.00';
    		}

    		return Math.abs(num);
    	}
    	else
    	{
    		return num;
    	}
    }
})

.directive('dragDown', function($rootScope, $parse)
{
	// TODO: change other drag-down elements to translateY as well
	var startY, height, y = 0;

	function vh(v) {
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		return (v * h) / 100;
	}

	return {
		restrict: "A",
		scope: {close: '&'},
		link: function(scope, element, attrs)
		{
			var el = element;

		    el[0].addEventListener('touchstart', function(event) {

				if(event.touches.length)
		    	{
		    		// setting startY only if scrollTop == 0
			    	if((el[0].scrollTop > 0) ||
			    	(el[0].querySelectorAll('.text-full')[0] && el[0].querySelectorAll('.text-full')[0].scrollTop > 0))
			    	{
			    		startY = -1;
			    	}
			    	else
			    	{
						startY = event.touches[0].pageY - y;
			    	}
				}

				el[0].addEventListener('touchmove', mousemove);
				el[0].addEventListener('touchend', mouseup);
		    });

			var mousemove = function(event) {
				height = el[0].clientHeight;

				// asset-selector
				if(el[0].scrollTop > 0)
				{
					return;
				}

				// alert text
				if(el[0].querySelectorAll('.text-full')[0] && el[0].querySelectorAll('.text-full')[0].scrollTop > 0)
				{
					return;
				}

				if(el[0].scrollHeight > el[0].clientHeight && el[0].scrollTop + el[0].clientHeight >= el[0].scrollHeight)
				{
					return;
				}

				// setting startY here if element was being scrolled
				if(startY == -1)
				{
					if(event.touches.length)
					{
						startY = event.touches[0].pageY - y;
					}
				}

				if(event.touches.length)
				{
					y = event.touches[0].pageY - startY;
					if(y > 0)
					{
						// fixes transform lag on ios by removing scrolling feature while moving drag-down element
						event.preventDefault();
						var newY = height - y;
						el[0].style.transform = 'translateY(' + y + 'px)';
						el[0].style.transition = '0s';
					}
					else
					{
						y = 0;
					}
				}
			}

			var mouseup = function() {
				if(y == 0)
				{
					return;
				}

				el[0].style.transition = 'all 0.3s ease-in-out';

				if(y > 100)
				{
					y = 0;

					if(scope.close)
					{
						var appEl = document.querySelectorAll('#app.state-trans-started.opacity-transition .trading');
						if(appEl && appEl[0])
						{
							appEl[0].classList.add('closing-opacity');
						}

						el[0].classList.remove('open');
						el[0].style.removeProperty('transform');
						window.setTimeout(function()
						{
							el[0].removeEventListener('touchmove', mousemove);
							el[0].removeEventListener('touchend', mouseup);
							scope.close();

							el[0].style.removeProperty('transition');

							if(appEl && appEl[0])
							{
								appEl[0].classList.remove('closing-opacity');
							}
						}, 300);
					}
				}
				else
				{
					el[0].style.transform = 'translateY(0px)';
					el[0].style.transition = 'all 0.3s ease-in-out';

					y = 0;
				}
			}
		}
	}
})

.directive('goforexChartPeriods', function($rootScope, $compile)
{
	return {
		restrict: "E",
		replace: true,
		scope: {chart: '='},

		link: function(scope, element, attrs)
		{
			var el = null;

			var notifier = 'periodNotifier_' + attrs.symbol;

			scope.$watch('chart', function()
			{
				if (scope.chart)
				{
					scope.chart.periodScope = scope;

					var tpl =
					'<div class="chartPeriods"> \
					 	<div class="chartPeriodSelect"> \
					 		<span ng-if="chart.multipleTimeframes" class="icon-reset" ng-click="reset()"></span>\
						 	<span \
						 	ng-click="chart.periodSelection(i)" \
						 	ng-repeat="(i, cp) in chart.customPeriods" \
						 	ng-class="{\'single\': !chart.multipleTimeframes, \'active\': (chart.multipleTimeframes && (chart.customPeriodsArray[i] == chart.period)) || (!chart.multipleTimeframes && chart.timeFramesVisible)}"> \
						 		<div ng-bind-html="cp.label"></div> \
						 	</span> \
					 	</div> \
					 </div>';

					el = $compile(tpl)(scope);
					element.append(el);

					$rootScope.$broadcast('$$rebind::' + notifier);
				}
			});

			scope.reset = function() {
				$rootScope.trackEvent("Timeframes", "TraderStyles_Disabled");
				window.tradeController.setTimeFramesCategory(0);
				window.tradeController.setPeriod(~~window.localStorage.defaultLineChartPeriod || 0);
			}
		}
	};
})

.directive('growthChart', function($timeout)
{
	return {
		scope: {updateCallback: '='},
		template: '<div class="growth-chart-container"><canvas id="growthchart" width="400" height="200"></canvas></div>',
		replace: true,
		restrict: "E",
		link: function(scope, element)
		{
			var dayInitials = [];
			var today = new Date();
			var day = today.getDay();
			var dayNames = ['s', 'm', 't', 'w', 'th', 'f', 's'];
			for (var i = 0; i < 7; i++)
			{
				dayInitials.push(dayNames[day]);
				day--;
				if (day < 0)
				{
					day = 6;
				}
			}
			dayInitials.reverse();

			var data = {
				labels: dayInitials,
				datasets: [{
					backgroundColor: "rgba(255,255,255,1)",
					borderColor: "#3333FF",
					borderWidth: 1,
					data: [0, 0, 0, 0, 0, 0, 0],
				}]
			};

			var min = -4;
			var max = 4;

			var labelIndexArray = [0, 4, 8, 12, 16];

			var options = {
				// maintainAspectRatio: false,
				// responsive: true,
				scales: {
					y: {
						position: 'right',
						min: min,
						max: max,
						beginAtZero: true,
						clip: false,
						grid: {
							offset: false,
							// color: 'rgba(000,000,000,0.13)',
							color: function(context) {
								if(labelIndexArray.indexOf(context.index) > -1)
								{
									// context.tick.label = labelArray[labelIndexArray.indexOf(context.index)] + '%';
									// return 'rgba(000,000,000,0.13)';
								}
								else
								{
									context.tick.label = '';
									// return 'rgba(000,000,000,0.026)';
								}
							}
						},
						border: {
							display: false,
						},
						ticks: {
							beginAtZero: false,
							autoSkip: false,
							stepSize: 0.5,
							precision: 2,
							callback: function(value, index, ticks) {
								return (value == 500 ? '> ' : '') + value + '%';
							}
						}
					},
					x: {
						// stepSize: 1,
						// clip: false,

						// offset: false,
						grid: {
							display: false,
						},
						border: {
							display: true,
						},
						// ticks: {
						// 	padding: 0
						// }
					}
				},
				elements: {
					point: {
						radius: 0
					}
				},
				plugins: {
					legend: {
						display: false
					}
				},
				layout: {
					autoPadding: false,
					padding: {
						bottom: 6, // Adjust the top padding as needed
					},
				},
				animation: {
					duration: 1,
					onComplete: function(chart) {
						if(chart.initial){
							if(scope.updateCallback)
							{
								console.warn('updatecallback called');
								scope.updateCallback();
							}
						}
					}
				 },
			};

			window.growthchart = new Chart('growthchart', {
				type: 'line',
				options: options,
				data: data
			});

			window.growthchart.update();

			// $timeout(function()
			// {
			// 	window.growthchart.data.datasets[0].data = [0, 1, -1, 5, 3, 7, 2];
			// 	window.growthchart.update();
			// }, 5000);

			// var dataArray = [
			// 	{day: 19614, growth: 0},
			// 	{day: 19615, growth: 1},
			// 	{day: 19616, growth: -1},
			// 	{day: 19617, growth: 5},
			// 	{day: 19618, growth: 3},
			// 	{day: 19619, growth: 7},
			// 	{day: 19620, growth: 2}
			// ];

			// var dayNames = ['m', 't', 'w', 'th', 'f', 's', 's'];

			// var minDelta = dataArray[0].day;
			// var dps = [];
			// for (var i = 0; i < dataArray.length; i++)
			// {
			// 	let time = dataArray[i].day * 1000 * 3600 * 24;
			// 	let day = new Date(time).getDay();
			// 	dps.push({
			// 		x: dataArray[i].day - minDelta,
			// 		y: dataArray[i].growth,
			// 		label: i.toString(),
			// 		// label: dayNames[day],
			// 	});
			// };

			element.on('$destroy', function () { scope.$destroy(); });
		}
	}
})

;
