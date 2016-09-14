require(
    [
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/timedtext',
        'antie/subtitles/timedtextbody',
        'antie/subtitles/timedtextelement',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timestamp',
        'antie/subtitles/ttmlparser',
        'antie/subtitles/errors/ttmlparseerror',
        'mocks/mockloggerobject'
    ],
    function(Application, Device, RuntimeContext, TimedText, TimedTextBody, TimedTextElement, TimedTextHead, Timestamp, TtmlParser, TtmlParseError, mockLoggerObject) {
        'use strict';

        describe('antie.subtitles.TtmlParser', function() {
            var mockLogger;
            var mockDevice;
            var mockApplication;
            var ttmlDoc;
            var ttmlParser;

            beforeEach(function () {

                mockLogger = mockLoggerObject('mockLogger');

                mockDevice = Object.create(Device.prototype);
                spyOn(mockDevice, 'getLogger').andReturn(mockLogger);

                mockApplication = Object.create(Application.prototype);
                spyOn(mockApplication, 'getDevice').andReturn(mockDevice);

                RuntimeContext.setCurrentApplication(mockApplication);

                ttmlDoc = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<tt' +
                            ' xmlns="http://www.w3.org/ns/ttml"' +
                            ' xmlns:ttp="http://www.w3.org/ns/ttml#parameter"' +
                            ' xmlns:tts="http://www.w3.org/ns/ttml#styling"' +
                            ' xmlns:ttm="http://www.w3.org/ns/ttml#metadata"' +
                            ' xml:lang="eng"' +
                            ' ttp:profile="http://www.w3.org/ns/ttml#profile-dfxp"' +
                            ' ttp:timeBase="smpte"' +
                            ' ttp:frameRate="30"' +
                            ' ttp:frameRateMultiplier="1000 1001"' +
                            ' ttp:dropMode="dropNTSC"' +
                            ' ttp:markerMode="continuous"' +
                            ' ttp:clockMode="local"' +
                            ' ttp:cellResolution="80 24"' +
                        '>' +
                        '<head>' +
                            '<styling>' +
                                '<style xml:id="backgroundStyle"' +
                                    ' tts:backgroundColor="rgba(72,128,132,0.75)"' +
                                    ' tts:displayAlign="after"' +
                                    ' tts:extent="100% 48%"' +
                                    ' tts:origin="0% 50%"' +
                                    ' tts:fontFamily="Arial"' +
                                    ' tts:fontSize="18px"' +
                                    ' tts:fontStyle="normal"' +
                                    ' tts:textAlign="center"' +
                                ' />' +
                                ' <style xml:id="speakerStyle"' +
                                    ' tts:backgroundColor="transparent"' +
                                    ' tts:color="#FFFFFF"' +
                                    ' tts:textOutline="#000000 1px 1px"' +
                                    ' style="backgroundStyle"' +
                                ' />' +
                            '</styling>' +
                            '<layout>' +
                                '<region xml:id="speaker" style="speakerStyle" tts:zIndex="1"/>' +
                                '<region xml:id="background" style="backgroundStyle" tts:zIndex="0"/>' +
                            '</layout>' +
                        '</head>' +
                        '<body>' +
                            '<div >' +
                                '<p begin="00:00:02.000" end="00:00:05.760" region="speaker">' +
                                    '<span tts:color="white">Welcome to the beautiful Bisham</span><br/>' +
                                    '<span tts:color="white">Abbey. If you wander round the</span>' +
                                '</p>' +
                                '<p begin="00:00:05.800" end="00:00:07.720" region="speaker">grounds</p>' +
                            '</div>' +
                        '</body>' +
                    '</tt>',

                    'text/xml'
                );

                ttmlParser = new TtmlParser();
            });

            afterEach(function() {
                RuntimeContext.clearCurrentApplication();
            });

            it('parses <tt> into a TimedText', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText).toEqual(jasmine.any(TimedText));
            });

            it('parses <tt> attributes', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getAttribute('profile')).toBe('http://www.w3.org/ns/ttml#profile-dfxp');
                expect(timedText.getAttribute('timeBase')).toBe('smpte');
                expect(timedText.getAttribute('frameRate')).toBe(30);
                expect(timedText.getAttribute('frameRateMultiplier')).toEqual({numerator: 1000, denominator: 1001});
                expect(timedText.getAttribute('dropMode')).toBe('dropNTSC');
                expect(timedText.getAttribute('markerMode')).toBe('continuous');
                expect(timedText.getAttribute('clockMode')).toBe('local');
                expect(timedText.getAttribute('cellResolution')).toEqual({columns: 80, rows: 24});
            });

            it('parses <tt><head> into a TimedTextHead', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getHead()).toEqual(jasmine.any(TimedTextHead));
                expect(timedText.getHead().getNodeName()).toBe(TimedTextElement.NODE_NAME.head);
            });

            it('parses <tt><head><styling> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getHead().getChildren().length).toBe(2);  // The 2nd element is <layout>
                expect(timedText.getHead().getChildren()[0]).toEqual(jasmine.any(TimedTextElement));
                expect(timedText.getHead().getChildren()[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.styling);
            });

            it('parses <tt><head><styling><style> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var styles = timedText.getHead().getChildren()[0].getChildren();
                expect(styles.length).toBe(2);

                expect(styles[0]).toEqual(jasmine.any(TimedTextElement));
                expect(styles[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.style);

                expect(styles[1]).toEqual(jasmine.any(TimedTextElement));
                expect(styles[1].getNodeName()).toBe(TimedTextElement.NODE_NAME.style);
            });

            it('parses <tt><head><styling><style> attributes', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var styles = timedText.getHead().getChildren()[0].getChildren();

                expect(styles[0].getAttribute('id')).toBe('backgroundStyle');
                expect(styles[0].getAttribute('backgroundColor')).toBe('rgba(72,128,132,0.75)');
                expect(styles[0].getAttribute('color')).toBeNull();

                expect(styles[1].getAttribute('id')).toBe('speakerStyle');
                expect(styles[1].getAttribute('backgroundColor')).toBe('rgba(0,0,0,0)'); // 'transparent' mapped to CSS value
                expect(styles[1].getAttribute('color')).toBe('#FFFFFF');
            });

            it('parses <tt><head><layout> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getHead().getChildren().length).toBe(2);  // The 1st element is <styling>
                expect(timedText.getHead().getChildren()[1]).toEqual(jasmine.any(TimedTextElement));
                expect(timedText.getHead().getChildren()[1].getNodeName()).toBe(TimedTextElement.NODE_NAME.layout);
            });

            it('parses <tt><head><layout><region> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var styles = timedText.getHead().getChildren()[0].getChildren();
                var regions = timedText.getHead().getChildren()[1].getChildren();

                expect(regions.length).toBe(2);
                expect(regions[0].getAttribute('id')).toBe('speaker');
                expect(regions[0].getAttribute('style').length).toBe(1);  // Only references 1 style
                expect(regions[0].getAttribute('style')[0]).toBe(styles[1]);
                expect(regions[0].getAttribute('style')[0].getAttribute('id')).toBe('speakerStyle');

                expect(regions[1].getAttribute('id')).toBe('background');
                expect(regions[1].getAttribute('style').length).toBe(1); // Only references 1 style
                expect(regions[1].getAttribute('style')[0]).toBe(styles[0]);
                expect(regions[1].getAttribute('style')[0].getAttribute('id')).toBe('backgroundStyle');
            });

            it('parses <tt><body> into a TimedTextBody', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getBody()).toEqual(jasmine.any(TimedTextBody));
                expect(timedText.getBody().getNodeName()).toBe(TimedTextElement.NODE_NAME.body);
            });

            it('parses <tt><body><div> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getBody().getChildren().length).toBe(1);
                expect(timedText.getBody().getChildren()[0]).toEqual(jasmine.any(TimedTextElement));
                expect(timedText.getBody().getChildren()[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.div);
            });

            it('parses <tt><body><div><p> into a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var regions = timedText.getHead().getChildren()[1].getChildren();
                var paragraphs = timedText.getBody().getChildren()[0].getChildren();
                expect(paragraphs.length).toBe(2);

                expect(paragraphs[0]).toEqual(jasmine.any(TimedTextElement));
                expect(paragraphs[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(paragraphs[0].getAttributes().getAttribute('begin')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[0].getAttributes().getAttribute('begin').getMilliseconds()).toBe(2000);
                expect(paragraphs[0].getAttributes().getAttribute('end')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[0].getAttributes().getAttribute('end').getMilliseconds()).toBe(5760);
                expect(paragraphs[0].getAttributes().getAttribute('dur')).toBeNull();

                expect(paragraphs[0].getAttribute('region').length).toBe(1);  // Only references 1 region
                expect(paragraphs[0].getAttribute('region')[0]).toBe(regions[0]);
                expect(paragraphs[0].getAttribute('region')[0].getAttribute('id')).toBe('speaker');

                expect(paragraphs[1]).toEqual(jasmine.any(TimedTextElement));
                expect(paragraphs[1].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(paragraphs[1].getAttributes().getAttribute('begin')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[1].getAttributes().getAttribute('begin').getMilliseconds()).toBe(5800);
                expect(paragraphs[1].getAttributes().getAttribute('end')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[1].getAttributes().getAttribute('end').getMilliseconds()).toBe(7720);
                expect(paragraphs[1].getAttributes().getAttribute('dur')).toBeNull();
            });

            it('parses <tt><body><div><p>text</p> into text on a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var paragraphs = timedText.getBody().getChildren()[0].getChildren();
                var textElements = paragraphs[1].getChildren();

                expect(textElements.length).toBe(1);
                expect(textElements[0]).toEqual(jasmine.any(TimedTextElement));
                expect(textElements[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.text);
                expect(textElements[0].getText()).toBe('grounds');
            });

            it('parses <tt><body><div><p><span> and <br> into TimedTextElements', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var paragraphs = timedText.getBody().getChildren()[0].getChildren();
                var spansAndBr = paragraphs[0].getChildren();
                expect(spansAndBr.length).toBe(3);

                expect(spansAndBr[0]).toEqual(jasmine.any(TimedTextElement));
                expect(spansAndBr[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.span);

                expect(spansAndBr[1]).toEqual(jasmine.any(TimedTextElement));
                expect(spansAndBr[1].getNodeName()).toBe(TimedTextElement.NODE_NAME.br);

                expect(spansAndBr[2]).toEqual(jasmine.any(TimedTextElement));
                expect(spansAndBr[2].getNodeName()).toBe(TimedTextElement.NODE_NAME.span);
            });

            it('parses <tt><body><div><p><span>text</span> into text on a TimedTextElement', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var paragraphs = timedText.getBody().getChildren()[0].getChildren();
                var spansAndBr = paragraphs[0].getChildren();
                var textElements = spansAndBr[0].getChildren();

                expect(textElements.length).toBe(1);
                expect(textElements[0]).toEqual(jasmine.any(TimedTextElement));
                expect(textElements[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.text);
                expect(textElements[0].getText()).toBe('Welcome to the beautiful Bisham');
            });

            it('finds all timing points', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText.getTimingPoints().length).toBe(2);
            });

            it('finds all ordered timing points', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                expect(timedText._timePoints.length).toBe(4);
                expect(timedText._timePoints[0].milliseconds).toBe(2000);
                expect(timedText._timePoints[0].seconds).toBe(2);
                expect(timedText._timePoints[1].milliseconds).toBe(5760);
                expect(timedText._timePoints[1].seconds).toBeCloseTo(5.760, 3);
                expect(timedText._timePoints[2].milliseconds).toBe(5800);
                expect(timedText._timePoints[2].seconds).toBeCloseTo(5.800, 3);
                expect(timedText._timePoints[3].milliseconds).toBe(7720);
                expect(timedText._timePoints[3].seconds).toBeCloseTo(7.720, 3);

                expect(timedText._timePoints[0].active._elements.length).toBe(1);
                expect(timedText._timePoints[1].active._elements.length).toBe(0);
                expect(timedText._timePoints[2].active._elements.length).toBe(1);
                expect(timedText._timePoints[3].active._elements.length).toBe(0);
                expect(timedText._timePoints[2].active._elements[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(timedText._timePoints[2].active._elements[0].getChildren()[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.text);
                expect(timedText._timePoints[2].active._elements[0].getChildren()[0].getText()).toBe('grounds');
            });

            it('gets the correct active subtitles for a given time', function() {
                var timedText = ttmlParser.parse(ttmlDoc);
                var elementsAt0 = timedText.getActiveElements(0);
                expect(elementsAt0.length).toBe(0);

                var elementsAt2 = timedText.getActiveElements(2);
                expect(elementsAt2.length).toBe(1);

                var elementsAt577 = timedText.getActiveElements(5.77);
                expect(elementsAt577.length).toBe(0);

                var elementsAt6 = timedText.getActiveElements(6);
                expect(elementsAt6.length).toBe(1);
                expect(elementsAt6[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(elementsAt6[0].getChildren()[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.text);
                expect(elementsAt6[0].getChildren()[0].getText()).toBe('grounds');

                var elementsAt8 = timedText.getActiveElements(8);
                expect(elementsAt8.length).toBe(0);
            });

            it('throws TtmlParseError if TTML document is missing', function() {
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    ttmlParser.parse();
//                }).toThrowError(TtmlParseError, 'TTML document is missing');   // Jasmine 2.0

                try {
                    ttmlParser.parse();
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document is missing');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('throws TtmlParseError if TTML document is the wrong datatype', function() {
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    ttmlParser.parse(function(){});
//                }).toThrowError(TtmlParseError, 'TTML document is not a valid XML document (type=function)');   // Jasmine 2.0

                try {
                    ttmlParser.parse(function(){});
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document is not a valid XML document (type=function)');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('throws TtmlParseError if document (top level) element is missing', function() {
                var noRoot = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<gibberish in=val=id />',  // Invalid attribute syntax will leave root documentElement empty
                    'text/xml'
                );
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    ttmlParser.parse(noRoot);
//                }).toThrowError(TtmlParseError, 'TTML document root element is not <tt> - it was: null');   // Jasmine 2.0

                try {
                    ttmlParser.parse(noRoot);
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document root element is not <tt> - it was: null');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('throws TtmlParseError if document (top level) element is not <tt>', function() {
                var notTt = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<gibberish/>',
                    'text/xml'
                );
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    ttmlParser.parse(notTt);
//                }).toThrowError(TtmlParseError, 'TTML document root element is not <tt> - it was: <gibberish>');   // Jasmine 2.0

                try {
                    ttmlParser.parse(notTt);
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document root element is not <tt> - it was: <gibberish>');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('will not instantiate a new timedTextHead if<head> tag is missing from the top level document', function() {
                var ttmlDocNoHead = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<tt' +
                            ' xmlns="http://www.w3.org/ns/ttml"' +
                            ' xmlns:ttp="http://www.w3.org/ns/ttml#parameter"' +
                            ' xmlns:tts="http://www.w3.org/ns/ttml#styling"' +
                            ' xmlns:ttm="http://www.w3.org/ns/ttml#metadata"' +
                            ' xml:lang="eng"' +
                        '>' +
                        '<body>' +
                            '<div >' +
                                '<p begin="00:00:02.000" end="00:00:05.760">' +
                                    '<span tts:color="white">Welcome to the beautiful Bisham</span><br/>' +
                                    '<span tts:color="white">Abbey. If you wander round the</span>' +
                                '</p>' +
                            '</div>' +
                        '</body>' +
                    '</tt>',

                    'text/xml'
                );

                var timedText = ttmlParser.parse(ttmlDocNoHead);

                expect(timedText.getHead()).toBeNull();
            });

            it('will not instantiate a new timedTextBody if <body> tag is missing from the top level document', function() {
                var ttmlDocNoBody = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<tt' +
                            ' xmlns="http://www.w3.org/ns/ttml"' +
                            ' xmlns:ttp="http://www.w3.org/ns/ttml#parameter"' +
                            ' xmlns:tts="http://www.w3.org/ns/ttml#styling"' +
                            ' xmlns:ttm="http://www.w3.org/ns/ttml#metadata"' +
                            ' xml:lang="eng"' +
                        '>' +
                        '<head>' +
                        '</head>' +
                    '</tt>',

                    'text/xml'
                );

                var timedText = ttmlParser.parse(ttmlDocNoBody);

                expect(timedText.getBody()).toBeNull();
            });

            it('calculates milliseconds from frame number: round(1000 * frame / (framRate * frameRateMultiplier))', function() {
                var ttmlDocSmpte = new DOMParser().parseFromString(
                    '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<tt' +
                            ' xmlns="http://www.w3.org/ns/ttml"' +
                            ' xmlns:ttp="http://www.w3.org/ns/ttml#parameter"' +
                            ' xmlns:tts="http://www.w3.org/ns/ttml#styling"' +
                            ' xmlns:ttm="http://www.w3.org/ns/ttml#metadata"' +
                            ' xml:lang="eng"' +
                            ' ttp:profile="http://www.w3.org/ns/ttml#profile-dfxp"' +
                            ' ttp:timeBase="smpte"' +
                            ' ttp:frameRate="30"' +
                            ' ttp:frameRateMultiplier="1000 1001"' +   // Typical value for NTSC: 30*(1000/1001) ~= 29.97 fps
                            ' ttp:dropMode="dropNTSC"' +
                            ' ttp:markerMode="continuous"' +
                            ' ttp:clockMode="local"' +
                            ' ttp:cellResolution="80 24"' +
                        '>' +
                        '<head>' +
                            '<styling>' +
                                '<style xml:id="backgroundStyle"' +
                                    ' tts:backgroundColor="rgba(128,128,128,200)"' +
                                    ' tts:displayAlign="after"' +
                                    ' tts:extent="100% 48%"' +
                                    ' tts:origin="0% 50%"' +
                                    ' tts:fontFamily="Arial"' +
                                    ' tts:fontSize="18px"' +
                                    ' tts:fontStyle="normal"' +
                                    ' tts:textAlign="center"' +
                                ' />' +
                                ' <style xml:id="speakerStyle"' +
                                    ' tts:backgroundColor="transparent"' +
                                    ' tts:color="#FFFFFF"' +
                                    ' tts:textOutline="#000000 1px 1px"' +
                                    ' style="backgroundStyle"' +
                                ' />' +
                            '</styling>' +
                            '<layout>' +
                                '<region xml:id="speaker" style="speakerStyle" tts:zIndex="1"/>' +
                                '<region xml:id="background" style="backgroundStyle" tts:zIndex="0"/>' +
                            '</layout>' +
                        '</head>' +
                        '<body>' +
                            '<div >' +
                                '<p begin="00:00:02:02" end="00:00:05:12" region="speaker">' +
                                    '<span tts:color="white">Welcome to the beautiful Bisham</span><br/>' +
                                    '<span tts:color="white">Abbey. If you wander round the</span>' +
                                '</p>' +
                                '<p begin="00:00:05:13" end="00:00:07:29" region="speaker">grounds</p>' +
                            '</div>' +
                        '</body>' +
                    '</tt>',

                    'text/xml'
                );

                var timedText = ttmlParser.parse(ttmlDocSmpte);
                var paragraphs = timedText.getBody().getChildren()[0].getChildren();
                expect(paragraphs.length).toBe(2);

                expect(paragraphs[0]).toEqual(jasmine.any(TimedTextElement));
                expect(paragraphs[0].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(paragraphs[0].getAttributes().getAttribute('begin')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[0].getAttributes().getAttribute('begin').getMilliseconds()).toBe(2067);
                expect(paragraphs[0].getAttributes().getAttribute('end')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[0].getAttributes().getAttribute('end').getMilliseconds()).toBe(5400);
                expect(paragraphs[0].getAttributes().getAttribute('dur')).toBeNull();

                expect(paragraphs[1]).toEqual(jasmine.any(TimedTextElement));
                expect(paragraphs[1].getNodeName()).toBe(TimedTextElement.NODE_NAME.p);
                expect(paragraphs[1].getAttributes().getAttribute('begin')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[1].getAttributes().getAttribute('begin').getMilliseconds()).toBe(5434);
                expect(paragraphs[1].getAttributes().getAttribute('end')).toEqual(jasmine.any(Timestamp));
                expect(paragraphs[1].getAttributes().getAttribute('end').getMilliseconds()).toBe(7968);
                expect(paragraphs[1].getAttributes().getAttribute('dur')).toBeNull();
            });

        });
    }
);
