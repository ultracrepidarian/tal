require(
    [
        'antie/application',
        'antie/widgets/subtitles',
        'antie/widgets/widget',
        'antie/devices/browserdevice',
        'antie/widgets/container',
        'antie/widgets/label',
        'antie/devices/mediaplayer/mediaplayer',
        'antie/subtitles/timedtext'
    ],
    function(Application, Subtitles, Widget, BrowserDevice, Container, Label, MediaPlayer, TimedText) {
        'use strict';

        describe('antie.widgets.Subtitles', function() {
            var mockGetMediaTimeCallback;
            var mockBrowserDevice;
            var mockContainer;
            var mockApplication;
            var mockTimedText;
            var mockOutputElement;
            var mockLabel;

            var mockTimedTextElement1, mockTimedTextElement2, mockTimedTextElement3;
            var mockActiveElements;

            beforeEach(function () {
                mockGetMediaTimeCallback = function(){
                    return 100.1;
                };
                mockTimedText = Object.create(TimedText.prototype);
                mockTimedText.getActiveElements = function(){};
                mockBrowserDevice = Object.create(BrowserDevice.prototype);
                mockApplication = Object.create(Application.prototype);
                mockContainer = Object.create(Container.prototype);
                mockOutputElement = Object.create(Container.prototype);
                mockLabel = Object.create(Label.prototype);

                mockTimedTextElement1 = Object.create(TimedText.prototype);
                mockTimedTextElement1.getTextContent = function(){}; //TODO use the proper function here
                spyOn(mockTimedTextElement1, 'getTextContent').andReturn('textContent1');
                mockTimedTextElement2 = Object.create(TimedText.prototype);
                mockTimedTextElement2.getTextContent = function(){}; //TODO use the proper function here
                spyOn(mockTimedTextElement2, 'getTextContent').andReturn('textContent2');
                mockTimedTextElement3 = Object.create(TimedText.prototype);
                mockTimedTextElement3.getTextContent = function(){}; //TODO use the proper function here
                spyOn(mockTimedTextElement3, 'getTextContent').andReturn('textContent3');

                spyOn(mockBrowserDevice, 'createContainer').andReturn(mockContainer);
                spyOn(mockBrowserDevice, 'createLabel').andReturn(mockLabel);
                spyOn(mockBrowserDevice, 'showElement');
                spyOn(mockBrowserDevice, 'hideElement');
                spyOn(mockBrowserDevice, 'clearElement');
                spyOn(mockBrowserDevice, 'appendChildElement');

                mockActiveElements = [mockTimedTextElement1, mockTimedTextElement2, mockTimedTextElement3];

                spyOn(mockTimedText, 'getActiveElements').andReturn(mockActiveElements);
                spyOn(mockApplication, 'getDevice').andReturn(mockBrowserDevice);

                spyOn(Widget.prototype, 'addClass');
                spyOn(Widget.prototype, 'getCurrentApplication').andReturn(mockApplication);
            });

            afterEach(function() {
            });

            it('can be constructed', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                expect(subtitles._getMediaTimeCallback).toBe(mockGetMediaTimeCallback);
                expect(subtitles._timedText).toBe(mockTimedText);

                expect(Widget.prototype.addClass).toHaveBeenCalledWith('subtitles');
            });

            it('will render a new outputDevice if one doesnt exist', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                var outputElement = subtitles.render(mockBrowserDevice);

                expect(mockBrowserDevice.createContainer).toHaveBeenCalledWith('id');
                expect(outputElement).toBe(mockContainer);
            });

            it('wont render a new outputDevice if one exists already', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                var secondMockContainer = Object.create(Container.prototype);
                subtitles.outputElement = secondMockContainer;

                var outputElement = subtitles.render(mockBrowserDevice);

                expect(mockBrowserDevice.createContainer).not.toHaveBeenCalled();
                expect(outputElement).toBe(secondMockContainer);
            });

            it('can display subtitles if the widget is rendered', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                var outputElement = subtitles.render(mockBrowserDevice);

                subtitles.start();

                expect(mockBrowserDevice.showElement).toHaveBeenCalledWith(
                    {
                        el: outputElement,
                        skipAnim: true
                    }
                );
            });

            it('wont show subtitles if the widget is not rendered', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                subtitles.start();

                expect(mockBrowserDevice.showElement).not.toHaveBeenCalled();
            });

            it('will set an interval to call the update function once start is called', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(window, 'setInterval').andReturn(1);
                spyOn(subtitles, 'update');

                subtitles.start();

                expect(subtitles._updateInterval).toBe(1);
                expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 750);

                // check the timeout is set to call the update function
                expect(subtitles.update).not.toHaveBeenCalled();

                //call it
                window.setInterval.calls[0].args[0]();

                expect(subtitles.update).toHaveBeenCalled();
            });

            it('will not set a new interval if there is one already in place', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(window, 'setInterval').andReturn(1);
                spyOn(subtitles, 'update');
                subtitles._updateInterval = 2;

                subtitles.start();

                expect(subtitles._updateInterval).toBe(2);
                expect(window.setInterval).not.toHaveBeenCalled();
            });

            it('can stop displaying subtitles if the widget is rendered', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                var outputElement = subtitles.render(mockBrowserDevice);

                subtitles.stop();

                expect(mockBrowserDevice.hideElement).toHaveBeenCalledWith(
                    {
                        el: outputElement,
                        skipAnim: true
                    }
                );
            });

            it('wont hide subtitles if the widget is not rendered', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                subtitles.stop();

                expect(mockBrowserDevice.hideElement).not.toHaveBeenCalled();
            });

            it('will clear the update timeout if it is set', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles._updateInterval = 10;
                spyOn(window, 'clearInterval');

                subtitles.stop();

                expect(subtitles._updateInterval).toEqual(null);
                expect(window.clearInterval).toHaveBeenCalled();
            });

            it('update function will stop the subtitles widget if there is no media player set', function() {
                var subtitles = new Subtitles('id', mockTimedText, null);
                spyOn(subtitles, 'stop');

                subtitles.update();

                expect(subtitles.stop).toHaveBeenCalled();
            });

            it('update function will call updateCaptions with the time from the _getMediaTimeCallback', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, 'stop');
                spyOn(subtitles, '_updateCaptions');

                subtitles.update();

                expect(subtitles.stop).not.toHaveBeenCalled();
                expect(subtitles._updateCaptions).toHaveBeenCalledWith(100.1);
            });


            it('_updateCaptions will update the activeElements if they are different and redraw the widget contents', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_removeCaptions');
                spyOn(subtitles, '_addCaptions');

                expect(subtitles._activeElements).toEqual([]);

                subtitles._updateCaptions(300);

                expect(mockTimedText.getActiveElements).toHaveBeenCalledWith(300);
                expect(subtitles._activeElements).toEqual(mockActiveElements);
                expect(subtitles._addCaptions).toHaveBeenCalledWith(mockActiveElements);
                expect(subtitles._removeCaptions).toHaveBeenCalled();
            });

            it('_updateCaptions will NOT update the activeElements if they are NOT different and redraw the widget contents', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_removeCaptions');
                spyOn(subtitles, '_addCaptions');

                subtitles._activeElements = mockActiveElements;

                expect(subtitles._activeElements).toEqual(mockActiveElements);

                subtitles._updateCaptions(300);

                expect(mockTimedText.getActiveElements).toHaveBeenCalledWith(300);
                expect(subtitles._activeElements).toEqual(mockActiveElements);
                expect(subtitles._addCaptions).not.toHaveBeenCalled();
                expect(subtitles._removeCaptions).not.toHaveBeenCalled();
            });


            it('_removeCaptions will clear the outputElement', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                subtitles._removeCaptions();

                expect(mockBrowserDevice.clearElement).toHaveBeenCalledWith(mockOutputElement);
            });

            it('_addCaptions will add create a label for each active element and append it to the outputElement', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(3);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockLabel);

                expect(mockBrowserDevice.createLabel).toHaveBeenCalledWith('id', ['subtitlesLabel'], 'textContent1');
                expect(mockBrowserDevice.createLabel).toHaveBeenCalledWith('id', ['subtitlesLabel'], 'textContent2');
                expect(mockBrowserDevice.createLabel).toHaveBeenCalledWith('id', ['subtitlesLabel'], 'textContent3');
            });

            it('destroy function will clear the timer and set the references to null', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;
                subtitles._updateInterval = 1234;

                spyOn(window, 'clearInterval');

                subtitles.destroy();

                expect(window.clearInterval).toHaveBeenCalled();
                expect(subtitles._updateInterval).toEqual(null);
                expect(subtitles._timedText).toEqual(null);
                expect(subtitles._getMediaTimeCallback).toEqual(null);
                expect(subtitles._activeElements).toEqual(null);
            });
        });
    }
);
