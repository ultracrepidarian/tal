require(
    [
        'antie/subtitles/timedtext',
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/errors/ttmlparseerror',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextbody',
        'mocks/mockloggerobject'
    ],
    function(TimedText, Application, Device, RuntimeContext, TtmlParseError, TimedTextHead, TimedTextBody, mockLoggerObject) {
        'use strict';

        describe('antie.subtitles.TimedText', function() {

            var mockLogger;
            var mockDevice;
            var mockApplication;

            beforeEach(function () {
                mockLogger = mockLoggerObject('mockLogger');

                mockDevice = Object.create(Device.prototype);
                spyOn(mockDevice, 'getLogger').andReturn(mockLogger);

                mockApplication = Object.create(Application.prototype);
                spyOn(mockApplication, 'getDevice').andReturn(mockDevice);

                RuntimeContext.setCurrentApplication(mockApplication);
            });

            afterEach(function() {
                RuntimeContext.clearCurrentApplication();
            });

            it('creates a new TimedTextHead if the <head> is present', function() {
                var head = new TimedTextHead();
                var timedText = new TimedText(head);
                expect(timedText.getHead()).toBe(head);
            });

            it('creates a new TimedTextBody if the <body> is present', function() {
                var body = new TimedTextBody();
                var timedText = new TimedText(null, body);
                expect(timedText.getBody()).toBe(body);
            });

        });
    }
);
