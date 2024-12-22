#!/bin/bash
git checkout *.svg

function optless()
{
	git checkout $1
	svgo $1 --disable=convertStyleToAttrs
}

svgo -f . --disable=convertStyleToAttrs

#~ optless 7-social-trading.svg
#~ optless 1-what-is-forex.svg
#~ optless 9-leverage.svg
#~ optless 1-social-trading.svg
#~ optless ani_13_forex_tongue.svg
#~ optless ani_53_walking.svg
#~ optless ani_49_debates.svg
#~ optless ani_36_mine.svg
#~ optless ani_56_australia.svg
#~ optless ani_58_switzerland.svg
#~ optless ani_37_happy_guy.svg
#~ optless ani_55_canada.svg
#~ optless ani_57_japan.svg
#~ optless ani_52_two_houses.svg
#~ optless ani_54_become_mad.svg

git checkout 3-work-while-in-hammock.svg
git checkout ani_41_moneyprint.svg
git checkout ani_40_stretching.svg

#~ git checkout 1Forex-heading.svg # uzkarās
#~ git checkout 1trading-examples.svg # roka nepareizajā vietā
#~ git checkout 2-follow-top-traders.svg # nerādās karodziņš
#~ git checkout 2-forex-raining-man.svg # uzkarās
#~ git checkout 3-work-while-in-hammock.svg # uzkarās
#~ git checkout 4-when-NOT-trade-forex.svg # roka raustās
#~ git checkout 9-leverage.svg # uzkarās
#~ git checkout University.svg # uzkarās
#~ git checkout ani_36_mine.svg # uzkarās
