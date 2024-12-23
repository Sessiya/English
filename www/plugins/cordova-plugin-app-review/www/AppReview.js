cordova.define("cordova-plugin-app-review.AppReview", function(require, exports, module) {
var PLUGIN_NAME = "AppReview";
// @ts-ignore
var exec = require("cordova/exec");

exports.requestReview =
/**
 * Launches in-app review dialog.
 *
 * @returns {Promise<void>} Callback when operation is completed
 *
 * @example
 * cordova.plugins.AppReview.requestReview();
 * // request dialog and provide fallback
 * cordova.plugins.AppReview.requestReview().catch(function() {
 *     return cordova.plugins.AppReview.openStoreScreen();
 * });
 */
function() {
    return new Promise(function(resolve, reject) {
        exec(resolve, reject, PLUGIN_NAME, "requestReview", []);
    });
};

exports.openStoreScreen =
/**
 * Launches App/Play store page with a review form. By default current app screen
 * is displayed but you can pass a package name string to show another app details.
 *
 * @param {string} [packageName] Package name to show instead of the current app.
 * @returns {Promise<void>} Callback when operation is completed
 *
 * @example
 * cordova.plugins.AppReview.openStoreScreen();
 * cordova.plugins.AppReview.openStoreScreen("com.app.example");
 */
function(packageName) {
    return new Promise(function(resolve, reject) {
        exec(resolve, reject, PLUGIN_NAME, "openStoreScreen", [packageName || null]);
    });
};

});
