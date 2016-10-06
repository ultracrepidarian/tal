require(
    [
        'antie/application',
        'antie/devices/browserdevice',
        'antie/runtimecontext',
        'antie/subtitles/attributetransformercss3'
    ],
    function(Application, Device, RuntimeContext, AttributeTransformerCss3) {
        describe('antie.subtitles.AttributeTransformerCss3', function() {
            var stubConfig;
            var mockDevice;
            var mockApplication;
            var mockReporter;
            var attributeTransformer;

            beforeEach(function () {
                stubConfig = {
                    accessibility: {
                        captions: {
                            fontMap: {
                                'default':               'sans-serif',
                                'unknown':               'sans-serif',
                                'monospace':             'monospace',
                                'sansSerif':             'sans-serif',
                                'serif':                 'serif',
                                'monospaceSansSerif':    'monospace',
                                'monospaceSerif':        'monospace',
                                'proportionalSansSerif': 'sans-serif',
                                'proportionalSerif':     'serif',
                                'Arial':                 'Arial, sans-serif',
                                'Times New Roman':       '"Times New Roman", serif'
                            }
                        }
                    }
                };
                mockDevice = Object.create(Device.prototype);
                spyOn(mockDevice, 'getConfig').andReturn(stubConfig);
                mockApplication = Object.create(Application.prototype);
                spyOn(mockApplication, 'getDevice').andReturn(mockDevice);
                RuntimeContext.setCurrentApplication(mockApplication);

                mockReporter = jasmine.createSpy('mockReporter');
                attributeTransformer = new AttributeTransformerCss3(mockReporter);
            });

            afterEach(function() {
                RuntimeContext.clearCurrentApplication();
            });

            it('maps font family names found in the font map', function() {
                expect(attributeTransformer.transform('fontFamily', 'default')).toBe('sans-serif');
                expect(attributeTransformer.transform('fontFamily', 'Times New Roman')).toBe('"Times New Roman", serif');
            });

            it('maps unknown font family names to the "unknown" font, if it\'s in the font map', function() {
                expect(attributeTransformer.transform('fontFamily', 'Unknown Font')).toBe('sans-serif');
            });

            it('does not remap unknown font family names if "unknown" is not in the font map', function() {
                delete stubConfig.accessibility.captions.fontMap.unknown;
                expect(attributeTransformer.transform('fontFamily', 'Unknown Font')).toBe('Unknown Font');
            });

            it('does not remap font family names if there is no font map', function() {
                delete stubConfig.accessibility.captions.fontMap;
                expect(attributeTransformer.transform('fontFamily', 'default')).toBe('default');
                expect(attributeTransformer.transform('fontFamily', 'Times New Roman')).toBe('Times New Roman');
                expect(attributeTransformer.transform('fontFamily', 'Unknown Font')).toBe('Unknown Font');
            });

            it('does not remap font family names if there is captions config', function() {
                delete stubConfig.accessibility;
                attributeTransformer = new AttributeTransformerCss3(mockReporter);  // It needs to re-read the config to pick this up
                expect(attributeTransformer.transform('fontFamily', 'default')).toBe('default');
                expect(attributeTransformer.transform('fontFamily', 'Times New Roman')).toBe('Times New Roman');
                expect(attributeTransformer.transform('fontFamily', 'Unknown Font')).toBe('Unknown Font');
            });

            it('non string font names fail validation', function() {
                expect(attributeTransformer.transform('fontFamily', {})).toBeNull();
            });

            it('does nothing to some attributes', function() {
                expect(attributeTransformer.transform('id', 'whatever-it-is, anything')).toBe('whatever-it-is, anything');
                expect(attributeTransformer.transform('lang', 'whatever-it-is, anything')).toBe('whatever-it-is, anything');
            });

            it('only accepts valid values for xml:space', function() {
                expect(attributeTransformer.transform('space', 'default')).toBe('default');
                expect(attributeTransformer.transform('space', 'preserve')).toBe('preserve');
                expect(mockReporter).not.toHaveBeenCalled();

                expect(attributeTransformer.transform('space', 'whatever-it-is, anything')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('space attribute should be one of "default","preserve" but was: "whatever-it-is, anything"');

                expect(attributeTransformer.transform('space', 'Default')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('space attribute should be one of "default","preserve" but was: "Default"');
            });

            it('leaves rgb colours alone', function() {
                expect(attributeTransformer.transform('color', 'rgb(235,201,153)')).toBe('rgb(235,201,153)');

                // Even invalid ones
                expect(attributeTransformer.transform('color', 'rgb(500,201,153)')).toBe('rgb(500,201,153)');
                // TODO Should we transform to TV safe colours?
            });

            it('does not tolerate spaces in rgb colour values', function() {
                expect(attributeTransformer.transform('color', 'rgb(235, 201,153)')).toBeNull();
            });

            it('transforms rgba colours to CSS3 equivalents', function() {
                expect(attributeTransformer.transform('color', 'rgba(235,201,153,128)')).toBe('rgba(235,201,153,0.50)');
                // TODO Should we transform to TV safe colours?
            });

            it('does not tolerate spaces in rgba colour values', function() {
                expect(attributeTransformer.transform('color', 'rgba(235, 201,153,128)')).toBeNull();
            });

            it('leaves 6 hex digit colours alone', function() {
                expect(attributeTransformer.transform('color', '#FFEE88')).toBe('#FFEE88');
                expect(attributeTransformer.transform('color', '#ffee88')).toBe('#ffee88');
                // TODO Should we transform to TV safe colours?
            });

            it('transforms 8 hex digit colours to CSS3 equivalents', function() {
                expect(attributeTransformer.transform('color', '#FFEE887F')).toBe('rgba(255,238,136,0.50)');
                expect(attributeTransformer.transform('color', '#ffee887f')).toBe('rgba(255,238,136,0.50)');
                // TODO Should we transform to TV safe colours?
            });

            it('transforms transparent to CSS3 equivalent colour', function() {
                expect(attributeTransformer.transform('color', 'transparent')).toBe('rgba(0,0,0,0.0)');
            });

            it('leaves named colours alone', function() {
                expect(attributeTransformer.transform('color', 'red')).toBe('red');
                expect(attributeTransformer.transform('color', 'white')).toBe('white');

                // Even nonexistent colours
                expect(attributeTransformer.transform('color', 'aquapurpliotrope')).toBe('aquapurpliotrope');
            });

            it('rejects any other colour value', function() {
                expect(attributeTransformer.transform('color', 'not a word')).toBeNull();
                expect(attributeTransformer.transform('color', { error: 'not even a string' })).toBeNull();
            });

            it('recognises length suffixes', function() {
                expect(attributeTransformer.transform('lineHeight', '18px')).toBe('18px');
                expect(attributeTransformer.transform('lineHeight', '1.5em')).toBe('1.5em');
                expect(attributeTransformer.transform('lineHeight', '1.5c')).toBe('1.5c');
                expect(attributeTransformer.transform('lineHeight', '+10%')).toBe('+10%');

                expect(attributeTransformer.transform('lineHeight', '-10%')).toBeNull();
                expect(attributeTransformer.transform('lineHeight', '18turds')).toBeNull();
            });

        });
    }
);
