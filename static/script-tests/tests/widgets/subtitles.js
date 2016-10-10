require(
    [
        'antie/application',
        'antie/widgets/subtitles',
        'antie/widgets/widget',
        'antie/devices/browserdevice',
        'antie/widgets/container',
        'antie/widgets/label',
        'antie/devices/mediaplayer/mediaplayer',
        'antie/subtitles/timedtext',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextelement'
    ],
    function(Application, Subtitles, Widget, BrowserDevice, Container, Label, MediaPlayer, TimedText, TimedTextHead, TimedTextElement) {
        'use strict';

        describe('antie.widgets.Subtitles', function() {
            var mockGetMediaTimeCallback;
            var mockBrowserDevice;
            var mockContainer;
            var mockApplication;
            var mockTimedText;
            var mockTimedTextHead;
            var mockLayout;
            var mockOutputElement;
            var mockLineBreakElement;
            var mockDivElement;
            var mockParagraphElement;
            var mockSpanElement;
            var mockTextElement;

            var mockHTMLElement;
            var mockRegion;

            var mockRegionElement1, mockRegionElement2;
            var mockPElement1, mockPElement2;
            var mockDivElement1, mockDivElement2;
            var mockTextElement1, mockTextElement2, mockTextElement3;
            var mockActiveElements;

            beforeEach(function () {
                mockGetMediaTimeCallback = function(){
                    return 100.1;
                };
                mockTimedText = Object.create(TimedText.prototype);
                mockTimedTextHead = Object.create(TimedTextHead.prototype);
                mockLayout = Object.create(TimedTextElement.prototype);
                mockBrowserDevice = Object.create(BrowserDevice.prototype);
                mockApplication = Object.create(Application.prototype);
                mockContainer = Object.create(Container.prototype);
                mockOutputElement = Object.create(Container.prototype);

                mockHTMLElement = Object.create(HTMLElement.prototype);
                mockHTMLElement.style = {};
                mockHTMLElement.id = 'mockHtmlElement';
                spyOn(mockHTMLElement, 'appendChild');

                mockRegion = Object.create(HTMLElement.prototype);
                mockRegion.style = {};
                mockRegion.id = 'mockRegion';
                spyOn(mockRegion, 'appendChild');

                // set up the mock timedtext elements
                mockLineBreakElement = Object.create(TimedTextElement.prototype);
                spyOn(mockLineBreakElement, 'getAttribute').andReturn(null);
                spyOn(mockLineBreakElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.br);
                mockDivElement = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement, 'getAttribute').andReturn(null);
                spyOn(mockDivElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                mockParagraphElement = Object.create(TimedTextElement.prototype);
                spyOn(mockParagraphElement, 'getAttribute').andReturn(null);
                spyOn(mockParagraphElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.p);
                mockSpanElement = Object.create(TimedTextElement.prototype);
                spyOn(mockSpanElement, 'getAttribute').andReturn(null);
                spyOn(mockSpanElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.span);

                mockTextElement = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement, 'getAttribute').andReturn(null);
                spyOn(mockTextElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                spyOn(mockTextElement, 'getText').andReturn('I see dead people');

                mockTextElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement1, 'getAttribute').andReturn(null);
                spyOn(mockTextElement1, 'getText').andReturn('textContent1');
                spyOn(mockTextElement1, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                mockTextElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement2, 'getAttribute').andReturn(null);
                spyOn(mockTextElement2, 'getText').andReturn('textContent2');
                spyOn(mockTextElement2, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                mockTextElement3 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement3, 'getAttribute').andReturn(null);
                spyOn(mockTextElement3, 'getText').andReturn('textContent3');
                spyOn(mockTextElement3, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);

                mockDivElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement1, 'getAttribute').andReturn(null);
                spyOn(mockDivElement1, 'getText');
                spyOn(mockDivElement1, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                spyOn(mockDivElement1, 'getChildren').andReturn([]);

                mockDivElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement2, 'getAttribute').andReturn(null);
                spyOn(mockDivElement2, 'getText');
                spyOn(mockDivElement2, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                spyOn(mockDivElement2, 'getChildren').andReturn([]);

                mockPElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockPElement1, 'getChildren').andReturn([mockTextElement1]);
                spyOn(mockPElement1, 'getAttribute');
                mockPElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockPElement2, 'getChildren').andReturn([mockTextElement2, mockTextElement3]);
                spyOn(mockPElement2, 'getAttribute');

                mockRegionElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockRegionElement1, 'getAttribute');
                mockRegionElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockRegionElement2, 'getAttribute');


                spyOn(mockBrowserDevice, 'createContainer').andReturn(mockHTMLElement);
                spyOn(mockBrowserDevice, 'createLineBreak').andReturn(mockHTMLElement);
                spyOn(mockBrowserDevice, 'createParagraph').andReturn(mockHTMLElement);
                spyOn(mockBrowserDevice, 'createSpan').andReturn(mockHTMLElement);
                spyOn(mockBrowserDevice, 'createTextNode').andReturn(mockHTMLElement);

                spyOn(mockBrowserDevice, 'showElement');
                spyOn(mockBrowserDevice, 'hideElement');
                spyOn(mockBrowserDevice, 'clearElement');
                spyOn(mockBrowserDevice, 'appendChildElement');

                mockActiveElements = [mockPElement1, mockPElement2];

                spyOn(mockTimedText, 'getActiveElements').andReturn(mockActiveElements);
                spyOn(mockTimedText, 'getHead').andReturn(mockTimedTextHead);
                spyOn(mockTimedTextHead, 'getLayout').andReturn(mockLayout);
                spyOn(mockLayout, 'getChildren').andReturn([]);
                spyOn(mockApplication, 'getDevice').andReturn(mockBrowserDevice);

                spyOn(Widget.prototype, 'addClass');
                spyOn(Widget.prototype, 'getCurrentApplication').andReturn(mockApplication);
            });

            it('can be constructed', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                expect(subtitles._getMediaTimeCallback).toBe(mockGetMediaTimeCallback);
                expect(subtitles._timedText).toBe(mockTimedText);
            });

            it('uses a default media time update interval if none specified', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                expect(subtitles._mediaPollMilliseconds).toBe(200);
            });

            it('uses a media time update interval if specified', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback, 1000);
                expect(subtitles._mediaPollMilliseconds).toBe(1000);
            });

            it('chokes on an invalid media time update interval', function() {
                var errorDisposition = 'error not thrown';
                try {
                    new Subtitles('id', mockTimedText, mockGetMediaTimeCallback, -1);
                } catch (e) {
                    expect(e.message).toBe('mediaPollMilliseconds should be a non negative number, but was number: -1');
                    errorDisposition = 'error thrown';
                }
                expect(errorDisposition).toBe('error thrown');
            });

            it('will render a new outputDevice if one doesnt exist', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                var outputElement = subtitles.render(mockBrowserDevice);

                expect(mockBrowserDevice.createContainer).toHaveBeenCalledWith('id', ['subtitlesContainer']);
                expect(outputElement).toBe(mockHTMLElement);
            });

            it('wont render a new outputDevice if one exists already', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                subtitles.outputElement = mockContainer;

                var outputElement = subtitles.render(mockBrowserDevice);

                expect(mockBrowserDevice.createContainer).not.toHaveBeenCalled();
                expect(outputElement).toBe(mockContainer);
            });

            it('will set an interval to call the update function once start is called', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(window, 'setInterval').andReturn(1);
                spyOn(subtitles, 'update');

                subtitles.start();

                expect(subtitles._updateInterval).toBe(1);
                expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 200);

                // check the timeout is set to call the update function
                expect(subtitles.update).toHaveBeenCalled();

                subtitles.update.reset();

                //call it
                window.setInterval.calls[0].args[0]();

                expect(subtitles.update).toHaveBeenCalled();
            });

            it('will not set a new interval if there is one already in place', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(window, 'setInterval').andReturn(1);
                spyOn(subtitles, '_createRegions');
                spyOn(subtitles, 'update');
                subtitles._updateInterval = 2;

                subtitles.start();

                expect(subtitles._updateInterval).toBe(2);
                expect(window.setInterval).not.toHaveBeenCalled();
            });

            it('will clear the update timeout if it is set', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles._updateInterval = 10;
                subtitles._activeElements = mockActiveElements;
                subtitles._regions = {'regionId': 'region'};
                spyOn(subtitles, '_removeCaptions');

                spyOn(window, 'clearInterval');

                subtitles.stop();

                expect(subtitles._regions).toEqual({});
                expect(subtitles._updateInterval).toEqual(null);
                expect(subtitles._activeElements).toEqual([]);
                expect(subtitles._removeCaptions).toHaveBeenCalled();
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


            it('_removeCaptions will clear the outputElement and remove references to regions', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;
                subtitles._regions = {'regionId': 'region'};

                subtitles._removeCaptions();

                expect(mockBrowserDevice.clearElement).toHaveBeenCalledWith(mockOutputElement);
                expect(subtitles._regions).toEqual({});
            });

            it('_addCaptions do nothing if called with an empty array', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [];

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(0);
                expect(mockBrowserDevice.appendChildElement).not.toHaveBeenCalled();
            });

            it('_addCaptions will add create and add a single active element to the widget, with no region specified', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1];

                subtitles._addCaptions(mockActiveElements);

                expect(subtitles._createElementTree).toHaveBeenCalledWith(mockPElement1);
                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(1);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockHTMLElement);

            });

            it('_addCaptions will loop through more than one active element and create their HTML representations', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1, mockPElement2];

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(2);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockHTMLElement);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockHTMLElement);

                expect(subtitles._createElementTree).toHaveBeenCalledWith(mockPElement1);
                expect(subtitles._createElementTree).toHaveBeenCalledWith(mockPElement2);
            });

            it('_addCaptions will do nothing if passed an empty array', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [];

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(0);
                expect(mockBrowserDevice.appendChildElement).not.toHaveBeenCalled();

                expect(subtitles._createElementTree).not.toHaveBeenCalled();
            });


            it('_addCaptions will append a new element to an existing region if it is specified as an attribute', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1];
                mockPElement1.getAttribute.andReturn(mockRegionElement1);
                mockRegionElement1.getAttribute.andReturn('regionId');

                spyOn(subtitles, '_getRegionById').andReturn(mockRegion);

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(1);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockRegion, mockHTMLElement);
            });

            it('_addCaptions will append a new element to the default root region if the region cannot be found', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1];
                mockPElement1.getAttribute.andReturn(mockRegionElement1);
                mockRegionElement1.getAttribute.andReturn('regionId');

                spyOn(subtitles, '_getRegionById').andReturn(null);

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(1);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockHTMLElement);
            });

            it('_createRegions will do nothing if no regions are specified in the header', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                mockLayout.getChildren.andReturn([]);

                //call the function under test
                subtitles._createRegions();

                //expect references to the region elements not to have been set
                expect(subtitles._regions).toEqual({});
                expect(mockBrowserDevice.appendChildElement).not.toHaveBeenCalled();
            });

            it('_createRegions will create the regions described in the timedText instance, append them to the DOM and add a reference to each so they can be retrieved later', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                var mockRegion1 = Object.create(TimedTextElement.prototype);
                var mockRegion1HTML = Object.create(HTMLElement.prototype);
                spyOn(mockRegion1, 'getAttribute').andCallFake(function(attribute){
                    if(attribute === 'id'){
                        return 'mockRegion1Id';
                    }
                    return null;
                });

                var mockRegion2 = Object.create(TimedTextElement.prototype);
                var mockRegion2HTML = Object.create(HTMLElement.prototype);
                spyOn(mockRegion2, 'getAttribute').andCallFake(function(attribute){
                    if(attribute === 'id'){
                        return 'mockRegion2Id';
                    }
                    return null;
                });

                mockLayout.getChildren.andReturn([mockRegion1, mockRegion2]);

                spyOn(subtitles, '_createElementTree').andCallFake(function(region){
                    if(region === mockRegion1){
                        return mockRegion1HTML;
                    }
                    if(region === mockRegion2){
                        return mockRegion2HTML;
                    }
                    return null;
                });

                //call the function under test
                subtitles._createRegions();

                //expect references to the region elements have been set
                expect(subtitles._regions).toEqual({'mockRegion1Id': mockRegion1HTML, 'mockRegion2Id': mockRegion2HTML});
                // expect the two region elements to have been added to the widget
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockRegion1HTML);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockRegion2HTML);
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

            it('arraysEqual function can verify if two arrays have the same elements', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                var array1 = [];
                var array2 = [mockDivElement1];
                var array3 = [mockDivElement1, mockDivElement2];
                var array4 = [mockDivElement1, mockDivElement2];

                expect(subtitles._arraysEqual(array1, array1)).toEqual(true);
                expect(subtitles._arraysEqual(array2, array2)).toEqual(true);
                expect(subtitles._arraysEqual(null, null)).toEqual(true);
                expect(subtitles._arraysEqual(null, array2)).toEqual(false);
                expect(subtitles._arraysEqual(array2, null)).toEqual(false);
                expect(subtitles._arraysEqual(array1, array2)).toEqual(false);
                expect(subtitles._arraysEqual(array2, array3)).toEqual(false);

                // this is the important one, where two different arraysEqual
                // contain the same elements
                expect(subtitles._arraysEqual(array3, array4)).toEqual(true);
            });

            it('createElement function will call through to the device to create the correct elements, without any styling or region', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');

                expect(mockBrowserDevice.createLineBreak).not.toHaveBeenCalled();
                expect(mockBrowserDevice.createContainer).not.toHaveBeenCalled();
                expect(mockBrowserDevice.createParagraph).not.toHaveBeenCalled();
                expect(mockBrowserDevice.createSpan).not.toHaveBeenCalled();
                expect(mockBrowserDevice.createTextNode).not.toHaveBeenCalled();

                expect(subtitles._createElement(mockLineBreakElement)).toEqual(mockHTMLElement);
                expect(mockBrowserDevice.createLineBreak).toHaveBeenCalled();
                expect(subtitles._setStyleAttributeOnElement).not.toHaveBeenCalled();

                expect(subtitles._createElement(mockDivElement)).toEqual(mockHTMLElement);
                expect(mockBrowserDevice.createContainer).toHaveBeenCalled();
                expect(subtitles._setStyleAttributeOnElement).not.toHaveBeenCalled();

                expect(subtitles._createElement(mockParagraphElement)).toEqual(mockHTMLElement);
                expect(mockBrowserDevice.createParagraph).toHaveBeenCalledWith(null, ['subtitlesParagraphElement']);
                expect(subtitles._setStyleAttributeOnElement).not.toHaveBeenCalled();

                expect(subtitles._createElement(mockSpanElement)).toEqual(mockHTMLElement);
                expect(mockBrowserDevice.createSpan).toHaveBeenCalledWith(null, ['subtitlesSpanElement']);
                expect(subtitles._setStyleAttributeOnElement).not.toHaveBeenCalled();

                expect(subtitles._createElement(mockTextElement)).toEqual(mockHTMLElement);
                expect(mockBrowserDevice.createTextNode).toHaveBeenCalledWith('I see dead people');
                expect(subtitles._setStyleAttributeOnElement).not.toHaveBeenCalled();
            });

            it('createElement function will call through to the device to create the correct elements, without any styling', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');

                expect(subtitles._createElement(null)).toEqual(null);
            });

            it('createElement function will call through to the device to create the correct elements, without any styling', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                subtitles.outputElement = mockOutputElement;

                mockLineBreakElement.getAttribute.andReturn('styleValue');
                subtitles._createElement(mockLineBreakElement);
                expect(mockBrowserDevice.createLineBreak).toHaveBeenCalled();
                subtitles._setStyleAttributeOnElement.reset();
                mockLineBreakElement.getAttribute.reset();

                mockDivElement.getAttribute.andReturn('styleValue');
                subtitles._createElement(mockDivElement);
                expect(mockBrowserDevice.createContainer).toHaveBeenCalled();
                subtitles._setStyleAttributeOnElement.reset();
                mockLineBreakElement.getAttribute.reset();

                mockParagraphElement.getAttribute.andReturn('styleValue');
                subtitles._createElement(mockParagraphElement);
                expect(mockBrowserDevice.createParagraph).toHaveBeenCalledWith(null, ['subtitlesParagraphElement']);
                subtitles._setStyleAttributeOnElement.reset();
                mockLineBreakElement.getAttribute.reset();

                mockSpanElement.getAttribute.andReturn('styleValue');
                subtitles._createElement(mockSpanElement);
                expect(mockBrowserDevice.createSpan).toHaveBeenCalledWith(null, ['subtitlesSpanElement']);
                subtitles._setStyleAttributeOnElement.reset();
                mockLineBreakElement.getAttribute.reset();

                mockTextElement.getAttribute.andReturn('styleValue');
                subtitles._createElement(mockTextElement);
                expect(mockBrowserDevice.createTextNode).toHaveBeenCalledWith('I see dead people');
                subtitles._setStyleAttributeOnElement.reset();
                mockLineBreakElement.getAttribute.reset();
            });

            it('can set the style on an element', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                var mockElement = {
                    style: {}
                };

                subtitles._setStyleAttributeOnElement(mockElement, 'AttributeName', 'AttributeValue');

                expect(mockElement.style['AttributeName']).toEqual('AttributeValue');
            });

            it('will not set the style on an element if it has no style', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                var mockElement = {
                    style: undefined
                };

                subtitles._setStyleAttributeOnElement(mockElement, 'AttributeName', 'AttributeValue');

                expect(mockElement.style).toEqual(undefined);
            });

            it('will not set the style on an element if it has no AttributeValue', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                var mockElement = {
                    style: {}
                };

                subtitles._setStyleAttributeOnElement(mockElement, 'AttributeName', null);

                expect(mockElement.style).toEqual({});
                expect(mockElement.style.AttributeName).toEqual(undefined);
            });

            it('createElementTree function will recurse through the active elements children and create the nodes with 4 levels', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andCallThrough();
                spyOn(subtitles, '_setStylingOnElement');

                // set up the TimedTextElements and the corresponding HTML representation objects
                var mockElementGreatgrandchild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGreatgrandchild1, 'appendChild');
                var mockTimedTextElementGreatgrandchild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGreatgrandchild1, 'getChildren').andReturn([]);

                var mockElementGreatgrandchild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGreatgrandchild2, 'appendChild');
                var mockTimedTextElementGreatgrandchild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGreatgrandchild2, 'getChildren').andReturn([]);

                var mockElementGrandchild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild1, 'appendChild');
                var mockTimedTextElementGrandchild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild1, 'getChildren').andReturn([]);

                var mockElementGrandchild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild2, 'appendChild');
                var mockTimedTextElementGrandchild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild2, 'getChildren').andReturn([mockTimedTextElementGreatgrandchild1, mockTimedTextElementGreatgrandchild2]);

                var mockElementChild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild1, 'appendChild');
                var mockTimedTextElementChild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild1, 'getChildren').andReturn([mockTimedTextElementGrandchild1, mockTimedTextElementGrandchild2]);

                var mockElementChild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild2, 'appendChild');
                var mockTimedTextElementChild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild2, 'getChildren').andReturn([]);

                var mockElementRoot = Object.create(HTMLElement.prototype);
                spyOn(mockElementRoot, 'appendChild');
                var mockTimedTextElementRoot = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementRoot, 'getChildren').andReturn([mockTimedTextElementChild1, mockTimedTextElementChild2]);

                // By spying on getChildren and returning the child nodes as above,
                // the following structure is modelled:
                //
                //  <mockElementRoot>
                //      <mockElementChild1>
                //          <mockElementGrandchild1>
                //          </mockElementGrandchild1>
                //          <mockElementGrandchild2>
                //              <mockElementGreatgrandchild1>
                //              </mockElementGreatgrandchild1>
                //              <mockElementGreatgrandchild2>
                //              </mockElementGreatgrandchild2>
                //          </mockElementGrandchild2>
                //      </mockElementChild1>
                //      <mockElementChild2>
                //      </mockElementChild2>
                //  </mockElementRoot>

                // fake out the _createElement function to map the TimedTextElements
                // to HTMLElements
                spyOn(subtitles, '_createElement').andCallFake(
                    function(element){
                        switch(element){
                        case mockTimedTextElementRoot:
                            return mockElementRoot;
                        case mockTimedTextElementChild1:
                            return mockElementChild1;
                        case mockTimedTextElementChild2:
                            return mockElementChild2;
                        case mockTimedTextElementGrandchild1:
                            return mockElementGrandchild1;
                        case mockTimedTextElementGrandchild2:
                            return mockElementGrandchild2;
                        case mockTimedTextElementGreatgrandchild1:
                            return mockElementGreatgrandchild1;
                        case mockTimedTextElementGreatgrandchild2:
                            return mockElementGreatgrandchild2;
                        default:
                            return null;
                        }
                    }
                );

                // Call the function under test with the root node
                subtitles._createElementTree(mockTimedTextElementRoot);

                // all the new nodes should have their style set on them
                expect(subtitles._setStylingOnElement.calls.length).toBe(7);

                //expect it to have recursed through each node
                expect(subtitles._createElementTree.calls.length).toBe(7);

                // expect the append child functions to join up the HTMLNodes correctly
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild1);
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild2);

                expect(mockElementChild1.appendChild).toHaveBeenCalledWith(mockElementGrandchild1);
                expect(mockElementChild1.appendChild).toHaveBeenCalledWith(mockElementGrandchild2);

                expect(mockElementChild2.appendChild).not.toHaveBeenCalled();

                expect(mockElementGrandchild1.appendChild).not.toHaveBeenCalled();

                expect(mockElementGrandchild2.appendChild).toHaveBeenCalledWith(mockElementGreatgrandchild1);
                expect(mockElementGrandchild2.appendChild).toHaveBeenCalledWith(mockElementGreatgrandchild2);
            });

            it('createElementTree function will recurse through the active elements children and create the nodes with 3 levels', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andCallThrough();
                spyOn(subtitles, '_setStylingOnElement');

                // set up the TimedTextElements and the corresponding HTML representation objects
                var mockElementGrandchild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild1, 'appendChild');
                var mockTimedTextElementGrandchild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild1, 'getChildren').andReturn([]);

                var mockElementGrandchild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild2, 'appendChild');
                var mockTimedTextElementGrandchild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild2, 'getChildren').andReturn([]);

                var mockElementChild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild1, 'appendChild');
                var mockTimedTextElementChild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild1, 'getChildren').andReturn([mockTimedTextElementGrandchild1, mockTimedTextElementGrandchild2]);

                var mockElementChild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild2, 'appendChild');
                var mockTimedTextElementChild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild2, 'getChildren').andReturn([]);

                var mockElementRoot = Object.create(HTMLElement.prototype);
                spyOn(mockElementRoot, 'appendChild');
                var mockTimedTextElementRoot = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementRoot, 'getChildren').andReturn([mockTimedTextElementChild1, mockTimedTextElementChild2]);

                // By spying on getChildren and returning the child nodes as above,
                // the following structure is modelled:
                //
                //  <mockElementRoot>
                //      <mockElementChild1>
                //          <mockElementGrandchild1>
                //          </mockElementGrandchild1>
                //          <mockElementGrandchild2>
                //          </mockElementGrandchild2>
                //      </mockElementChild1>
                //      <mockElementChild2>
                //      </mockElementChild2>
                //  </mockElementRoot>

                // fake out the _createElement function to map the TimedTextElements
                // to HTMLElements
                spyOn(subtitles, '_createElement').andCallFake(
                    function(element){
                        switch(element){
                        case mockTimedTextElementRoot:
                            return mockElementRoot;
                        case mockTimedTextElementChild1:
                            return mockElementChild1;
                        case mockTimedTextElementChild2:
                            return mockElementChild2;
                        case mockTimedTextElementGrandchild1:
                            return mockElementGrandchild1;
                        case mockTimedTextElementGrandchild2:
                            return mockElementGrandchild2;
                        default:
                            return null;
                        }
                    }
                );

                // Call the function under test with the root node
                subtitles._createElementTree(mockTimedTextElementRoot);

                //expect it to have recursed through each node
                expect(subtitles._createElementTree.calls.length).toBe(5);

                // all the new nodes should have their style set on them
                expect(subtitles._setStylingOnElement.calls.length).toBe(5);

                // expect the append child functions to join up the HTMLNodes correctly
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild1);
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild2);

                expect(mockElementChild1.appendChild).toHaveBeenCalledWith(mockElementGrandchild1);
                expect(mockElementChild1.appendChild).toHaveBeenCalledWith(mockElementGrandchild2);

                expect(mockElementChild2.appendChild).not.toHaveBeenCalled();

                expect(mockElementGrandchild1.appendChild).not.toHaveBeenCalled();
                expect(mockElementGrandchild2.appendChild).not.toHaveBeenCalled();
            });

            it('createElementTree function will recurse through the active elements children and create the nodes with 3 levels', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andCallThrough();
                spyOn(subtitles, '_setStylingOnElement');

                // set up the TimedTextElements and the corresponding HTML representation objects
                var mockElementGrandchild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild1, 'appendChild');
                var mockTimedTextElementGrandchild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild1, 'getChildren').andReturn([]);

                var mockElementGrandchild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementGrandchild2, 'appendChild');
                var mockTimedTextElementGrandchild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementGrandchild2, 'getChildren').andReturn([]);

                var mockElementChild1 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild1, 'appendChild');
                var mockTimedTextElementChild1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild1, 'getChildren').andReturn([mockTimedTextElementGrandchild1]);

                var mockElementChild2 = Object.create(HTMLElement.prototype);
                spyOn(mockElementChild2, 'appendChild');
                var mockTimedTextElementChild2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementChild2, 'getChildren').andReturn([mockTimedTextElementGrandchild2]);

                var mockElementRoot = Object.create(HTMLElement.prototype);
                spyOn(mockElementRoot, 'appendChild');
                var mockTimedTextElementRoot = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementRoot, 'getChildren').andReturn([mockTimedTextElementChild1, mockTimedTextElementChild2]);

                // By spying on getChildren and returning the child nodes as above,
                // the following structure is modelled:
                //
                //  <mockElementRoot>
                //      <mockElementChild1>
                //          <mockElementGrandchild1>
                //          </mockElementGrandchild1>
                //      </mockElementChild1>
                //      <mockElementChild2>
                //          <mockElementGrandchild2>
                //          </mockElementGrandchild2>
                //      </mockElementChild2>
                //  </mockElementRoot>

                // fake out the _createElement function to map the TimedTextElements
                // to HTMLElements
                spyOn(subtitles, '_createElement').andCallFake(
                    function(element){
                        switch(element){
                        case mockTimedTextElementRoot:
                            return mockElementRoot;
                        case mockTimedTextElementChild1:
                            return mockElementChild1;
                        case mockTimedTextElementChild2:
                            return mockElementChild2;
                        case mockTimedTextElementGrandchild1:
                            return mockElementGrandchild1;
                        case mockTimedTextElementGrandchild2:
                            return mockElementGrandchild2;
                        default:
                            return null;
                        }
                    }
                );

                // Call the function under test with the root node
                subtitles._createElementTree(mockTimedTextElementRoot);

                //expect it to have recursed through each node
                expect(subtitles._createElementTree.calls.length).toBe(5);

                // all the new nodes should have their style set on them
                expect(subtitles._setStylingOnElement.calls.length).toBe(5);

                // expect the append child functions to join up the HTMLNodes correctly
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild1);
                expect(mockElementRoot.appendChild).toHaveBeenCalledWith(mockElementChild2);

                expect(mockElementChild1.appendChild).toHaveBeenCalledWith(mockElementGrandchild1);
                expect(mockElementChild1.appendChild).not.toHaveBeenCalledWith(mockElementGrandchild2);

                expect(mockElementChild2.appendChild).not.toHaveBeenCalledWith(mockElementGrandchild1);
                expect(mockElementChild2.appendChild).toHaveBeenCalledWith(mockElementGrandchild2);

                expect(mockElementGrandchild1.appendChild).not.toHaveBeenCalled();
                expect(mockElementGrandchild2.appendChild).not.toHaveBeenCalled();
            });

            it('createElementTree will return a single new node for an element without children', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andCallThrough();
                spyOn(subtitles, '_setStylingOnElement');

                // set up the TimedTextElements and the corresponding HTML representation objects
                var mockElementRoot = Object.create(HTMLElement.prototype);
                spyOn(mockElementRoot, 'appendChild');
                var mockTimedTextElementRoot = Object.create(TimedTextElement.prototype);
                spyOn(mockTimedTextElementRoot, 'getChildren').andReturn([]);

                // By spying on getChildren and returning the child nodes as above,
                // the following structure is modelled:
                //  <mockElementRoot>
                //  </mockElementRoot>

                spyOn(subtitles, '_createElement').andCallFake(
                    function(element){
                        switch(element){
                        case mockTimedTextElementRoot:
                            return mockElementRoot;
                        default:
                            return null;
                        }
                    }
                );

                // Call the function under test with the root node
                subtitles._createElementTree(mockTimedTextElementRoot);

                //expect it not to have recursed as there is only one node
                expect(subtitles._createElementTree.calls.length).toBe(1);


                // all the new nodes should have their style set on them
                expect(subtitles._setStylingOnElement.calls.length).toBe(1);
                expect(mockElementRoot.appendChild).not.toHaveBeenCalled();
            });

            it('will set the fontSize styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'fontSize'){
                        return {height: '10px', width: '11px'};
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'fontSize', '10px');
            });

            it('will set the padding styling on an element correctly when 1 padding value is specified', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'padding'){
                        return ['30px'];
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'padding', '30px');
            });

            it('will set the padding styling on an element correctly when vertical and horizontal padding is specified', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'padding'){
                        return ['30px', '40px'];
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'padding', '30px 40px');
            });

            it('will set the extent styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'extent'){
                        return {width: '100px', height: '200px'};
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'width', '100px');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'height', '200px');
            });

            it('will set the origin styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'origin'){
                        return {top: '100px', left: '200px'};
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'position', 'absolute');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'top', '100px');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'left', '200px');
            });

            it('will set the displayAlign before styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'displayAlign'){
                        return 'before';
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'display', '-webkit-flex');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, '-webkit-align-items', 'flex-start');
            });

            it('will set the displayAlign after styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'displayAlign'){
                        return 'after';
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'display', '-webkit-flex');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, '-webkit-align-items', 'flex-end');
            });

            it('will set the displayAlign after styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'displayAlign'){
                        return 'center';
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'display', '-webkit-flex');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, '-webkit-align-items', 'center');
            });

            it('will set the textOutline styling on an element correctly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'textOutline'){
                        return {outlineThickness: '3px', color: 'red'};
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, '-webkit-text-stroke', '3px red');
            });

            it('will set other unmapped styling on an element directly', function(){
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_setStyleAttributeOnElement');
                var mockTimedTextElement = Object.create(TimedTextElement.prototype);

                spyOn(mockTimedTextElement, 'getAttribute').andCallFake(function(style){
                    if(style === 'color'){
                        return 'colorValue';
                    } else if(style === 'direction'){
                        return 'directionValue';
                    } else if(style === 'display'){
                        return 'displayValue';
                    } else if(style === 'fontStyle'){
                        return 'fontStyleValue';
                    } else if(style === 'fontWeight'){
                        return 'fontWeightValue';
                    } else if(style === 'lineHeight'){
                        return 'lineHeightValue';
                    } else if(style === 'opacity'){
                        return 'opacityValue';
                    } else if(style === 'overflow'){
                        return 'overflowValue';
                    } else if(style === 'showBackground'){
                        return 'showBackgroundValue';
                    } else if(style === 'textAlign'){
                        return 'textAlignValue';
                    } else if(style === 'textDecoration'){
                        return 'textDecorationValue';
                    } else if(style === 'unicodeBidi'){
                        return 'unicodeBidiValue';
                    } else if(style === 'visibility'){
                        return 'visibilityValue';
                    } else if(style === 'wrapOption'){
                        return 'wrapOptionValue';
                    } else if(style === 'writingMode'){
                        return 'writingModeValue';
                    } else if(style === 'zIndex'){
                        return 'zIndexValue';
                    }
                });

                subtitles._setStylingOnElement(mockHTMLElement, mockTimedTextElement);

                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'color', 'colorValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'direction', 'directionValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'display', 'displayValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'fontStyle', 'fontStyleValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'fontWeight', 'fontWeightValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'lineHeight', 'lineHeightValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'opacity', 'opacityValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'overflow', 'overflowValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'showBackground', 'showBackgroundValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'textAlign', 'textAlignValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'textDecoration', 'textDecorationValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'unicodeBidi', 'unicodeBidiValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'visibility', 'visibilityValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'wrapOption', 'wrapOptionValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'writingMode', 'writingModeValue');
                expect(subtitles._setStyleAttributeOnElement).toHaveBeenCalledWith(mockHTMLElement, 'zIndex', 'zIndexValue');
            });
        });
    }
);
