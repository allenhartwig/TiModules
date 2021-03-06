/*
 * Written by Marco Cancellieri (Applaud GmbH)
 *
 * A truly cross-platform "TabbedBar" for Titanium
 * Tested on Android 4 & iOS
 *
 *
 * Instructions:
 *
 * Simply use this like the native Ti.UI.iOS.TabbedBar (The Module also works with iOS!)
 * Additional available options for android:
 * - barBorderWidth
 * - selectedColor (selected Text Color)
 * - color (text color)
 * - font (font for the buttons)
 */
module.exports = (function () {

    //since the options are compatible with the native iOS tabbed bar, only use the custom bar when the platform isn't iOS
    switch (Ti.Platform.name) {
    case "iPhone OS":
        return {
            createTabbedBar: function (options) {
                return Ti.UI.iOS.createTabbedBar(options);
            }
        };
        break;
    default: //e.g. android
        return {
            createTabbedBar: function (options) {
                return createBar(options);
            }
        };
        break;
    }


    function createBar(options) {
        var barBorderWidth,
            barTextColor,
            barSelectedTextColor,
            barTextFont,
            barTintColor,
            barBackgroundColor,
            barWidth,
            barHeight;
        //setting options/default values
        options.barBorderWidth ? barBorderWidth = options.barBorderWidth : barBorderWidth = _toDp(1);
        options.selectedColor ? barSelectedTextColor = options.selectedColor : barSelectedTextColor = "#ffffff";
        options.tintColor ? barTintColor = options.tintColor : barTintColor = "#007AFF";
        options.color ? barTextColor = options.color : barTextColor = barTintColor;
        options.backgroundColor ? barBackgroundColor = options.backgroundColor : barBackgroundColor = "transparent";
        options.font ? barTextFont = options.font : barTextFont = {
            fontSize: _toDp(9)
        };
        options.width ? barWidth = options.width : barWidth = _toDp(200);
        options.height ? barHeight = options.height : barHeight = _toDp(18);

        //Errors & Warnings
        if (!options.labels || options.labels.length < 2) Ti.API.error("Tabbed Bar needs at least two labels");
        if (barBorderWidth < 1) Ti.API.warn("Borders between buttons may not be visible on devices with <= 160 dpi. Consider using a value >= 1");

        //Bar construction

        var bar = Ti.UI.createView({
            touchEnabled: false,
            height: barHeight,
            width: barWidth,
            borderRadius: _toDp(2.5),
            borderWidth: barBorderWidth,
            borderColor: barTintColor,
            layout: "horizontal",
            index: -1,

            //--------functions--------
            setIndex: function (ind) {
                selectTab(ind);
            },
            getIndex: function () {
                return this.index;
            },
        });

        //passing positioning data to the view
        if (typeof options.top !== "undefined") bar.top = options.top;
        if (typeof options.bottom !== "undefined") bar.bottom = options.bottom;
        if (typeof options.left !== "undefined") bar.left = options.left;
        if (typeof options.right !== "undefined") bar.right = options.right;


        //create Buttons and add behavior
        for (var i = 0; i < options.labels.length; i++) {
            var button = Ti.UI.createButton({
                bubbleParent: false,
                title: (typeof options.labels[i] == 'string') ? options.labels[i] : options.labels[i].title,
                height: "100%",
                width: 100 / options.labels.length + "%",
                backgroundColor: barBackgroundColor,
                color: barTextColor,
                font: barTextFont,
                borderWidth: barBorderWidth / 2,
                borderColor: barTintColor,
                index: i,
                //--------functions--------
                setTabSelected: function () {
                    this.color = barSelectedTextColor;
                    this.backgroundColor = barTintColor;
                },
                setTabDeselected: function () {
                    this.backgroundColor = barBackgroundColor;
                    this.color = barTextColor;
                }
            });

            if (typeof options.index !== "undefined") {
                if (options.index > -1 && options.index == i) {
                    button.setTabSelected();
                    bar.index = options.index;
                }
            }

            button.addEventListener("click", function (e) {
                selectTab(e.source.index);
            });

            bar.add(button);
        }

        return bar;


        function selectTab(index) {

            for (var c = 0; c < bar.children.length; c++) {
                if (bar.children[c].index !== index) {
                    bar.children[c].setTabDeselected();
                } else {
                    bar.children[c].setTabSelected();

                    bar.index = index;
                    //simulate same behavior of the iOS tabbedBar
                    bar.fireEvent("click", {
                        index: index
                    });
                }
            }
        }


    }

    //create density independent pixels
    function _toDp(pixels) {
        return (pixels * (Titanium.Platform.displayCaps.dpi / 160));
    }

})();