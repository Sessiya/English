angular.module('starter.trade')

.service('ChartSocialTrade', function(ChartHelper, Trading, VMin)
{
	var root = firebase.database().ref().child('lastTrades');

	var trades = {};

	var size = Math.floor(VMin(6) / 10) * 10;

	var preloadImage = function(fb)
	{
		ChartHelper.loadExternalImage('https://graph.facebook.com/' + fb + '/picture?height=' + size + '&width=' + size, fb);
	};

	var color = 'white';

	var font = "14px " + ChartHelper.getDefaultFont();

	var lastTrades = {};

	var drawImage = function(ctx, id, x, y)
	{
		var img = ChartHelper.getImage(id);

		if (img.hasError)
		{
			return;
		}

		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		try
		{
			ctx.drawImage(img, x - (size / 2), y - (size / 2), size, size);
		}
		catch (e)
		{
		}

		ctx.restore();
	}

	var isEnabled = false;

	var renderCallback = null;

	var overlapDistance = 0.8;

	var lineWidth = 2;

	return {
		enable: function()
		{
			isEnabled = true;
		},

		disable: function()
		{
			isEnabled = false;
		},

		isEnabled: function()
		{
			return isEnabled;
		},

		setColor: function(c)
		{
			color = c;
		},

		setFont: function(f)
		{
			font = f;
		},

		setSize: function(s)
		{
			size = Math.floor(s / 10) * 10;
		},

		init: function(symbol)
		{
			if (trades[symbol] || !isEnabled)
			{
				return;
			}

			lastTrades[symbol] = {};

			var addTrade = function(trade)
			{
				var l = _.get(lastTrades[symbol], [trade.facebook]);

				if (l && (Math.abs(trade.openX - l) < 300))
				{
					return;
				}

				trades[symbol].push(trade);
				lastTrades[symbol][trade.facebook] = trade.openX;

				preloadImage(trade.facebook);
			};

			var ref = root.child(symbol);
			ref.orderByKey().limitToLast(100).once('value', function(snap)
			{
				var values = _.values(snap.val());
				values.pop();

				trades[symbol] = [];

				_.each(values, function(trade)
				{
					addTrade(trade);
				});

				ref.orderByKey().limitToLast(1).on('value', function(snap)
				{
					var trade = _.values(snap.val()).pop();
					addTrade(trade);
				});
			});
		},

		setRenderCallback: function(callback)
		{
			renderCallback = callback;
		},

		setOverlapDistance: function(overlap)
		{
			overlapDistance = overlap;
		},

		setLineWidth: function(width)
		{
			lineWidth = width;
		},

		draw: function(symbol, ctx, chartData, xAxis, yAxis)
		{
			if (!trades[symbol] || !trades[symbol].length || !isEnabled)
			{
				return;
			}

			var first = chartData[0];

			if (_.isArray(first.y))
			{
				return;
			}

			first.realX = first.realX || first.x;
			var min = first.realX;

			var last = chartData[chartData.length - 1];
			last.realX = last.realX || last.x;
			var max = last.realX;

			var overlapCheck = [];

			var lastUserTime = {};

			_.each(trades[symbol], function(trade)
			{
				if ((trade.openX >= min) && (trade.openX <= max))
				{
					var x = xAxis.convertValueToPixel(trade.openX);
					if (x > 0 || true)
					{
						if (trade.amount > 1000000)
						{
							return;
						}

						if (!trade.minPoint)
						{
							var minDist = 99999;

							var minPoint = null;
							_.each(chartData, function(point)
							{
								var x = point.realX || point.x;
								var dist = Math.abs(x - trade.openX);
								if (dist < minDist)
								{
									minDist = dist;
									minPoint = point;
								}
							});

							trade.minPoint = minPoint;
						}

						var y = yAxis.convertValueToPixel(trade.minPoint.y);
						var x = xAxis.convertValueToPixel(trade.minPoint.x);

						if (_.filter(overlapCheck, function(i) { return (i > x - (size * overlapDistance)) && (i < x + (size * overlapDistance)); }).length)
						{
							return;
						}

						// show one user not more often than every 5 minutes
						//~ if (lastUserTime[trade.facebook] && Math.abs(lastUserTime[trade.facebook] - trade.openX) < 300)
						//~ {
							//~ return;
						//~ }

						lastUserTime[trade.facebook] = trade.openX;

						overlapCheck.push(x);

						drawImage(ctx, trade.facebook, x, y);

						ctx.save();
						ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
						ctx.lineWidth = lineWidth;
						ctx.strokeStyle = Trading[trade.type == "sell" ? 'getNegativeColor' : 'getPositiveColor']();
						ctx.stroke();

						ctx.textBaseline = "top";
						ctx.font = font;
						ctx.fillStyle = color == 'transaction' ? ctx.strokeStyle : color;
						var text = '$' + trade.amount.toString();
						var textSize = ctx.measureText(text);
						ctx.fillText(text, (x - (size / 2)) + ((size - textSize.width) / 2), y + (size / 1.5));

						ctx.restore();

						if (renderCallback)
						{
							renderCallback(ctx, x, y, trade);
						}
					}
				}
			});
		}
	}
})