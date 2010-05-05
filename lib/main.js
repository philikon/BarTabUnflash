exports.main = function(options, callbacks) {

    // Install TrackPreviousTab below
    var tb = require("tab-browser");
    var tbtracker = new tb.Tracker({
        onTrack: function (tabbrowser) {
            var window = tabbrowser.ownerDocument.defaultView;
            if (window.BarTap === undefined) {
                return;
            }
            tabbrowser._tabtracker = new TrackPreviousTab(tabbrowser);
        },
        onUntrack: function (tabbrowser) {
            if (tabbrowser._tabtracker) {
                tabbrowser._tabtracker.unload();
            }
        }
    });

    // Track which tab was previously selected
    function TrackPreviousTab (browser) {
        var previousTab = null;
        var selectedTab = browser.selectedTab;

        function onTabClose (event) {
            if (event.originalTarget === selectedTab) {
                selectedTab = null;
            };
            if (event.originalTarget === previousTab) {
                previousTab = null;
            };
        };

        function onTabSelect (event) {
            previousTab = selectedTab;
            selectedTab = event.originalTarget;
            if (previousTab) {
                maybeUnload(previousTab, browser);
            }
        };

        browser.tabContainer.addEventListener('TabSelect', onTabSelect, false);
        browser.tabContainer.addEventListener('TabClose', onTabClose, false);

        this.unload = function () {
            browser.tabContainer.removeEventListener('TabSelect', this, false);
            browser.tabContainer.removeEventListener('TabClose', this, false);
            previousTab = selectedTab = null;
        };
    }

    var flashSelectors = [
        'object[classid*=":D27CDB6E-AE6D-11cf-96B8-444553540000"]',
        'object[codebase*="swflash.cab"]',
        'object[data*=".swf"]',
        'object[type="application/x-shockwave-flash"]',
        'object[src*=".swf"]',
        'embed[type="application/x-shockwave-flash"]',
        'embed[src*=".swf"]',
        'embed[allowscriptaccess]',
        'embed[flashvars]',
        'embed[wmode]'].join(', ');

    function maybeUnload (tab, browser) {
        var document = tab.linkedBrowser.contentDocument;
        var elements = document.querySelectorAll(flashSelectors);
        if (elements.length) {
            var BarTap = browser.ownerDocument.defaultView.BarTap;
            BarTap.putOnTap(tab, browser);
        }
    }
};
