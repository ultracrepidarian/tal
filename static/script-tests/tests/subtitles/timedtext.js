require(
    [
        'antie/subtitles/timedtext',
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/errors/ttmlparseerror'
    ],
    function(TimedText, Application, Device, RuntimeContext, TtmlParseError) {
        'use strict';

        var mockLogger;
        var mockDevice;
        var mockApplication;
        var ttmlDoc;

        describe('antie.subtitles.TimedText', function() {
            beforeEach(function () {
                var loggersEnabled = {'log':false, 'debug':false, 'info':true, 'warn':true, 'error':true};
                mockLogger = jasmine.createSpyObj('mockLogger', Object.keys(loggersEnabled));

                for (var severity in loggersEnabled) {
                    if (loggersEnabled[severity]) {
                        mockLogger[severity].andCallFake(function() {
                            console[severity].apply(console, arguments);  // Actually log it to the console
                        });
                    }
                }

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
                        '>' +
                        '<body>' +
                            '<div >' +
                                '<p begin="00:00:02.000" end="00:00:05.760" region="speaker">' +
                                    '<span tts:color="white">Welcome to the beautiful Bisham</span><br/>' +
                                    '<span tts:color="white">Abbey. If you wander round the</span>' +
                                '</p>' +
                            '</div>' +
                        '</body>' +
                    '</tt>',

                    'text/xml'
                );
            });

            afterEach(function() {
                RuntimeContext.clearCurrentApplication();
            });

            it('reads language from <tt> tag', function() {
                var timedText = new TimedText(ttmlDoc);
                expect(timedText.getLang()).toBe('eng');
            });

            it('throws TtmlParseError if TTML document is missing', function() {
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    new TimedText();
//                }).toThrowError(TtmlParseError, 'TTML document is missing');   // Jasmine 2.0

                try {
                    new TimedText();
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document is missing');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

            it('throws TtmlParseError if TTML document is the wrong datatype', function() {
                // In the absence of Jasmine 2.0 toThrowError() we must check all this manually in a try/catch
//                expect(function() {
//                    new TimedText(function(){});
//                }).toThrowError(TtmlParseError, 'TTML document is not a valid XML document (type=function)');   // Jasmine 2.0

                try {
                    new TimedText(function(){});
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
//                    new TimedText(noRoot);
//                }).toThrowError(TtmlParseError, 'TTML document root element is not <tt> - it was: null');   // Jasmine 2.0

                try {
                    new TimedText(noRoot);
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
//                    new TimedText(notTt);
//                }).toThrowError(TtmlParseError, 'TTML document root element is not <tt> - it was: <gibberish>');   // Jasmine 2.0

                try {
                    new TimedText(notTt);
                    expect('Error not thrown').toBe('Error thrown');  // Fail the test (in the absence of the Jasmine 2.4 fail() method)
                } catch (e) {
                    expect(e.message).toBe('TTML document root element is not <tt> - it was: <gibberish>');
                    expect(e).toEqual(jasmine.any(TtmlParseError));
                }
            });

        });
    }
);
