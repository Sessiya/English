angular.module('starter.trade')

.service('TradeHistory', function(Mongo) {

    var ret = firebase.database().ref('tradeHistory');

    return {
        migrateHistory: function(callback)
        {
            var self = this;
            Mongo.getCached(function(user)
            {
                // TODO: add user.historyMigrated = true on new user creation
                if(user.historyMigrated)
                {
                    console.log('history already migrated');
                    return;
                }

                // get last tradeHistory record
                // migrate all records after that
                Mongo.getLastTradeRecord().then(function(resp)
                {
                    var lastTrade = resp.data[0];

                    var userId = user.firebaseKeyId;
                    ret.child(userId).once('value', function(snap)
                    {
                        var fbTradeHistory = snap.val();
                        if(fbTradeHistory)
                        {
                            var fbTradeHistoryArray = Object.values(fbTradeHistory);
                            if(lastTrade)
                            {
                                fbTradeHistoryArray = fbTradeHistoryArray.filter(function(t)
                                {
                                    console.log(t.closeDate, lastTrade.closeDate, t.closeDate > lastTrade.closeDate);
                                    return t.closeDate > lastTrade.closeDate;
                                });
                            }
    
                            _.each(fbTradeHistoryArray, function(v, k)
                            {
                                v.pair = v.instrument;
                                Mongo.addTradeHistoryRecord(v, v.value, v.closePrice, v);
                            });
                        }

                        Mongo.update({historyMigrated: true});
    
                        if(callback)
                        {
                            callback();
                        }
                    });
                });
            }, function()
            {
                window.setTimeout(function()
                {
                    self.migrateHistory(callback);
                }, 1000);
            });
        }
    }
  })
