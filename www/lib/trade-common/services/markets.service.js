angular.module('starter.trade')

.service('MarketTimeCache', function(DateNow) {

    var cache = {};
    var resetCache = function()
    {
      cache = {open: {}, close: {}, change: {}};
    };
    resetCache();

    // seconds until the next half-hour
    var d = new Date(DateNow());
    var secs = 1800 - ((d.getMinutes() * 60) + d.getSeconds() % 1800);
    window.setTimeout(function()
    {
      resetCache();
      window.setInterval(resetCache, 1800 * 1000);
    }, secs * 1000);

    return {
        setOpenTime: function(id, ms)
        {
          cache.open[id] = DateNow() + ms;
        },

        setCloseTime: function(id, ms)
        {
          cache.close[id] = DateNow() + ms;
        },

        setChangeTime: function(id, ms)
        {
          cache.change[id] = DateNow() + ms;
        },

        untilOpen: function(id)
        {
          var open = cache.open[id];

          if (open)
          {
              return Math.max(0, open - DateNow());
          }
          else
          {
              return null;
          }
        },

        untilClose: function(id)
        {
          var close = cache.close[id];

          if (close)
          {
              return Math.max(0, close - DateNow());
          }
          else
          {
              return null;
          }
        },

        untilChange: function(id)
        {
          var change = cache.change[id];

          if (change)
          {
              return Math.max(0, change - DateNow());
          }
          else
          {
              return null;
          }
        }
      };
  })

  .service('BestTimeMarket', function(MarketTimeCache, DateNow) {

    return {
      untilOpen: function()
      {
          var tz = 'Best time';

          var cached = MarketTimeCache.untilOpen(tz);
          if (cached !== null)
          {
              return cached;
          }

          var nyDate = moment.tz(new Date(), "America/New_York");
          var hrs = nyDate.hours();
          var day = nyDate.isoWeekday();

          if (hrs < 12)
          {
              var nextDay = day < 6 ? day : 8;
          }
          else
          {
              var nextDay = day < 5 ? day + 1 : 8;
          }

          var nextDate = moment.tz(new Date(), "America/New_York");
          nextDate.isoWeekday(nextDay).hours(8).minutes(0).seconds(0);

          var ms = nextDate.diff(nyDate);
          ms = Math.round(ms / 1000) * 1000;

          if (ms < 0)
          {
              ms = 0;
          }

          MarketTimeCache.setOpenTime(tz, ms);

          return ms;
      },

      untilClose: function()
      {
          var tz = 'Best time';

          var cached = MarketTimeCache.untilClose(tz);
          if (cached !== null)
          {
              return cached;
          }

          var nyDate = moment.tz(new Date(), "America/New_York");
          var hrs = nyDate.hours();
          var day = nyDate.isoWeekday();

          var nextDate = moment.tz(new Date(), "America/New_York");
          nextDate.isoWeekday(day).hours(12).minutes(0).seconds(0);

          var ms = nextDate.diff(nyDate);
          var ms = Math.round(ms / 1000) * 1000;

          if (ms < 0)
          {
              ms = 0;
          }

          MarketTimeCache.setCloseTime(tz, ms);

          return ms;
      },

      timezones: ['Europe/London', 'America/New_York', 'Australia/Sydney', 'Asia/Tokyo'],

      isOpen: function()
      {
          var isOpen = false;
          var self = this;
          _.each(self.timezones, function(tz)
          {
              if (!self.untilOpen(tz) && self.untilClose(tz))
              {
                  isOpen = true;
              }
          });

          return isOpen;
      },

      isForexInstrument: function(symbol)
      {
          var curr = symbol.substr(0, 3);
          return ['EUR', 'USD', 'GBP', 'AUD', 'NZD'].indexOf(curr) > -1;
      }
    }
  })

  .service('MarketStatus', function(DateNow, ChartRef, MarketTimeCache, SymbolData, $rootScope) {

    window.marketStatusData = {};

    var statusUpdateDelay = null;

    return {
        getMarketStatus: function()
        {
            return window.marketStatusData;
        },

    updateMarketStatus: function(id, value)
    {
        window.marketStatusData[id] = value;

        window.clearTimeout(statusUpdateDelay);
        statusUpdateDelay = window.setTimeout(function() {
            $rootScope.$broadcast('$$rebind::marketStatus');
        }, 500);
    },

      isOpen: function(instrument)
      {
          if(window.marketStatusData && instrument && SymbolData.getMarket && SymbolData.getMarket(instrument) && window.marketStatusData[SymbolData.getMarket(instrument)])
          {
              var askedMarketData = window.marketStatusData[SymbolData.getMarket(instrument)];
              return askedMarketData.isOpen;
          }
      },

      untilOpen: function(market, unix)
      {
          if(marketStatusData && marketStatusData[market])
          {
              var untilChange = marketStatusData[market].change;
          }
          else
          {
              return;
          }

          if(marketStatusData && marketStatusData[market])
          {
              var delta = untilChange - DateNow();
              if(delta < 0)
              {
                  return '00:00:00';
              }

              if(unix)
              {
                  return delta;
              }
              else
              {
                  var s = Math.floor(delta / 1000 % 60);
                  var m = Math.floor(delta / 1000 / 60 % 60);
                  var h = Math.floor(delta / 1000 / 60 / 60);
                  return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
              }
          }
      },

      untilForexOpen: function(tz)
      {
          if ('Australia/Sydney' == tz)
          {
              tz = 'Pacific/Efate';
          }

          if (!tz)
          {
              tz = 'Asia/Tokyo';
          }

          var cached = MarketTimeCache.untilOpen(tz);
          if (cached !== null)
          {
              return cached;
          }

          var nyDate = moment.tz(new Date(DateNow()), tz);

          //nyDate.hours(10);

          var hrs = nyDate.hours();
          var day = nyDate.isoWeekday();

          if(tz == 'Pacific/Efate' || tz == 'Asia/Tokyo')
          {
              if (hrs < 9)
              {
                  var nextDay = day < 6 ? day : 8;
              }
              else if (hrs > 17)
              {
                  var nextDay = day < 5 ? day + 1 : 8;
              }
              else
              {
                  var nextDay = day <= 5 ? day: 8;
              }
          }
          else
          {
              if (hrs < 8)
              {
                  var nextDay = day < 6 ? day : 8;
              }
              else if (hrs > 16)
              {
                  var nextDay = day < 5 ? day + 1 : 8;
              }
              else
              {
                  var nextDay = day <= 5 ? day: 8;
              }
          }

          var nextDate = moment.tz(new Date(DateNow()), tz);
          nextDate.isoWeekday(nextDay).hours(8).minutes(0).seconds(0);

          var ms = nextDate.diff(nyDate);
          ms = Math.round(ms / 1000) * 1000;

          if (ms < 0)
          {
              ms = 0;
          }

          MarketTimeCache.setOpenTime(tz, ms);

          return ms;
      },

      untilForexClose: function(tz)
      {
          if ('Australia/Sydney' == tz)
          {
              tz = 'Pacific/Efate';
          }

          var cached = MarketTimeCache.untilClose(tz);
          if (cached !== null)
          {
              return cached;
          }

          var nyDate = moment.tz(new Date(DateNow()), tz);

          //nyDate.hours(10);

          var hrs = nyDate.hours();
          var day = nyDate.isoWeekday();

          if(tz == 'Pacific/Efate' || tz == 'Asia/Tokyo')
          {
              if ((hrs >= 9) && (hrs <= 17))
              {
                  var nextDate = moment.tz(new Date(DateNow()), tz);
                  nextDate.isoWeekday(day).hours(18).minutes(0).seconds(0);
                  var ms = nextDate.diff(nyDate);
              }
              else
              {
                  var ms = 0;
              }
          }
          else
          {
              if ((hrs >= 8) && (hrs <= 16))
              {
                  var nextDate = moment.tz(new Date(DateNow()), tz);
                  nextDate.isoWeekday(day).hours(17).minutes(0).seconds(0);
                  var ms = nextDate.diff(nyDate);
              }
              else
              {
                  var ms = 0;
              }
          }

          ms = Math.round(ms / 1000) * 1000;

          if (ms < 0)
          {
              ms = 0;
          }

          MarketTimeCache.setCloseTime(tz, ms);

          return ms;
      },

      formatTime: function(ms)
      {
          ms = Math.floor(ms / 1000);
          var parts = [Math.floor(ms / 3600), Math.floor((ms % 3600) / 60), ms % 60];

          _.each(parts, function(part, i) {if (i > 0) { parts[i] = ('0' + part).substr(-2); } });
          return parts.join(':');
      },

      timezones: ['Europe/London', 'America/New_York', 'Australia/Sydney', 'Asia/Tokyo'],

      isForexOpen: function()
      {
          var isOpen = false;
          var self = this;
          _.each(self.timezones, function(tz)
          {
              if (!self.untilForexOpen(tz) && self.untilForexClose(tz))
              {
                  isOpen = true;
              }
          });

          return isOpen;
      },

      isForexInstrument: function(symbol)
      {
          var curr = symbol.substr(0, 3);
          return ['EUR', 'USD', 'GBP', 'AUD', 'NZD'].indexOf(curr) > -1;
      }
    }
});
