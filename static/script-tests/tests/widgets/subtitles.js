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
        'antie/subtitles/timedtextelement'
    ],
    function(Application, Subtitles, Widget, BrowserDevice, Container, Label, MediaPlayer, TimedText, TimedTextElement) {
        'use strict';

        describe('antie.widgets.Subtitles', function() {
            var mockGetMediaTimeCallback;
            var mockBrowserDevice;
            var mockContainer;
            var mockApplication;
            var mockTimedText;
            var mockOutputElement;
            var mockLineBreakElement;
            var mockDivElement;
            var mockParagraphElement;
            var mockSpanElement;
            var mockTextElement;

            var mockHTMLElement;

            var mockPElement1, mockPElement2;
            var mockDivElement1, mockDivElement2;
            var mockTextElement1, mockTextElement2, mockTextElement3;
            var mockActiveElements;

            beforeEach(function () {
                mockGetMediaTimeCallback = function(){
                    return 100.1;
                };
                mockTimedText = Object.create(TimedText.prototype);
                mockBrowserDevice = Object.create(BrowserDevice.prototype);
                mockApplication = Object.create(Application.prototype);
                mockContainer = Object.create(Container.prototype);
                mockOutputElement = Object.create(Container.prototype);

                mockHTMLElement = Object.create(HTMLElement.prototype);
                spyOn(mockHTMLElement, 'appendChild');

                // set up the mock timedtext elements
                mockLineBreakElement = Object.create(TimedTextElement.prototype);
                spyOn(mockLineBreakElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.br);
                mockDivElement = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                mockParagraphElement = Object.create(TimedTextElement.prototype);
                spyOn(mockParagraphElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.p);
                mockSpanElement = Object.create(TimedTextElement.prototype);
                spyOn(mockSpanElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.span);
                mockTextElement = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                spyOn(mockTextElement, 'getText').andReturn('I see dead people');

                mockTextElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement1, 'getText').andReturn('textContent1');
                spyOn(mockTextElement1, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                mockTextElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement2, 'getText').andReturn('textContent2');
                spyOn(mockTextElement2, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);
                mockTextElement3 = Object.create(TimedTextElement.prototype);
                spyOn(mockTextElement3, 'getText').andReturn('textContent3');
                spyOn(mockTextElement3, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.text);

                mockDivElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement1, 'getText');
                spyOn(mockDivElement1, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                spyOn(mockDivElement1, 'getChildren').andReturn([]);

                mockDivElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockDivElement2, 'getText');
                spyOn(mockDivElement2, 'getNodeName').andReturn(TimedTextElement.NODE_NAME.div);
                spyOn(mockDivElement2, 'getChildren').andReturn([]);

                mockPElement1 = Object.create(TimedTextElement.prototype);
                spyOn(mockPElement1, 'getChildren').andReturn([mockTextElement1]);
                mockPElement2 = Object.create(TimedTextElement.prototype);
                spyOn(mockPElement2, 'getChildren').andReturn([mockTextElement2, mockTextElement3]);

                spyOn(mockBrowserDevice, 'createContainer').andReturn(mockContainer);
                spyOn(mockBrowserDevice, 'createLineBreak');
                spyOn(mockBrowserDevice, 'createParagraph');
                spyOn(mockBrowserDevice, 'createLabel');
                spyOn(mockBrowserDevice, 'createSpan');
                spyOn(mockBrowserDevice, 'createTextNode');

                spyOn(mockBrowserDevice, 'showElement');
                spyOn(mockBrowserDevice, 'hideElement');
                spyOn(mockBrowserDevice, 'clearElement');
                spyOn(mockBrowserDevice, 'appendChildElement');

                mockActiveElements = [mockPElement1, mockPElement2];

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
            });

            it('will render a new outputDevice if one doesnt exist', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                var outputElement = subtitles.render(mockBrowserDevice);

                expect(mockBrowserDevice.createContainer).toHaveBeenCalledWith('id', ['subtitlesContainer']);
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

            it('will set an interval to call the update function once start is called', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(window, 'setInterval').andReturn(1);
                spyOn(subtitles, 'update');

                subtitles.start();

                expect(subtitles._updateInterval).toBe(1);
                expect(window.setInterval).toHaveBeenCalledWith(jasmine.any(Function), 750);

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
                spyOn(subtitles, 'update');
                subtitles._updateInterval = 2;

                subtitles.start();

                expect(subtitles._updateInterval).toBe(2);
                expect(window.setInterval).not.toHaveBeenCalled();
            });

            it('will clear the update timeout if it is set', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles._updateInterval = 10;
                spyOn(subtitles, '_removeCaptions');

                spyOn(window, 'clearInterval');

                subtitles.stop();

                expect(subtitles._updateInterval).toEqual(null);
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


            it('_removeCaptions will clear the outputElement', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                subtitles._removeCaptions();

                expect(mockBrowserDevice.clearElement).toHaveBeenCalledWith(mockOutputElement);
            });

            it('_addCaptions do nothing if called with an empty array', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [];

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(0);
                expect(mockBrowserDevice.appendChildElement).not.toHaveBeenCalled();

                expect(mockBrowserDevice.createLabel).not.toHaveBeenCalled();
            });

            it('_addCaptions will add create and add a single active element to the widget', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1];

                subtitles._addCaptions(mockActiveElements);

                expect(subtitles._createElementTree).toHaveBeenCalledWith(mockPElement1);
                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(2);
                expect(mockBrowserDevice.appendChildElement).toHaveBeenCalledWith(mockOutputElement, mockHTMLElement);

            });

            it('_addCaptions will loop through more than one active element and create their HTML representations', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andReturn(mockHTMLElement);
                subtitles.outputElement = mockOutputElement;

                mockActiveElements = [mockPElement1, mockPElement2];

                subtitles._addCaptions(mockActiveElements);

                expect(mockBrowserDevice.appendChildElement.calls.length).toBe(4);
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

            it('createElement function will call through to the device to create the correct elements', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);

                subtitles._createElement(mockLineBreakElement);
                expect(mockBrowserDevice.createLineBreak).toHaveBeenCalled();

                subtitles._createElement(mockDivElement);
                expect(mockBrowserDevice.createContainer).toHaveBeenCalled();

                subtitles._createElement(mockParagraphElement);
                expect(mockBrowserDevice.createParagraph).toHaveBeenCalledWith(null, ['subtitlesParagraphElement']);

                subtitles._createElement(mockSpanElement);
                expect(mockBrowserDevice.createSpan).toHaveBeenCalledWith(null, ['subtitlesSpanElement']);

                subtitles._createElement(mockTextElement);
                expect(mockBrowserDevice.createTextNode).toHaveBeenCalledWith('I see dead people');
            });


            it('createElementTree function will recurse through the active elements children and create the nodes with 4 levels', function() {
                var subtitles = new Subtitles('id', mockTimedText, mockGetMediaTimeCallback);
                spyOn(subtitles, '_createElementTree').andCallThrough();

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
                expect(mockElementRoot.appendChild).not.toHaveBeenCalled();
            });
        });
    }
);
