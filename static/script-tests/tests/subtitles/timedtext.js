require(
    [
        'antie/subtitles/timedtext',
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/errors/ttmlparseerror',
        'antie/subtitles/attributedefaultsfactory',
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextbody',
        'mocks/mockloggerobject'
    ],
    function(TimedText, Application, Device, RuntimeContext, TtmlParseError, AttributeDefaultsFactory, TimedTextHead, TimedTextBody, mockLoggerObject) {
        'use strict';

        describe('antie.subtitles.TimedText', function() {

            var mockLogger;
            var mockDevice;
            var mockApplication;

            beforeEach(function () {
                mockLogger = mockLoggerObject('mockLogger');

                mockDevice = Object.create(Device.prototype);
                spyOn(mockDevice, 'getLogger').and.returnValue(mockLogger);
                spyOn(mockDevice, 'getConfig').and.returnValue({});

                mockApplication = Object.create(Application.prototype);
                spyOn(mockApplication, 'getDevice').and.returnValue(mockDevice);

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

            it('gets attribute default', function() {
                var timedText = new TimedText(null, null);
                expect(timedText._getAttributeDefault('direction')).toBeNull();

                timedText.setAttributeDefaults(new AttributeDefaultsFactory().getAttributes());
                expect(timedText._getAttributeDefault('direction')).toBe('ltr');
            });

        });
    }
);
