require(
    [
        'antie/subtitles/attributetransformer'
    ],
    function(AttributeTransformer) {
        describe('antie.subtitles.AttributeTransformer', function() {
            var attributeTransformer;
            var mockReporter;

            beforeEach(function() {
                mockReporter = jasmine.createSpy('mockReporter');
                attributeTransformer = new AttributeTransformer(mockReporter);
            });

            it('does nothing in the base class transform', function() {
                expect(attributeTransformer.transform('id', 'whatever-it-is')).toBeNull();
            });

            it('validates an enumerated attribute', function() {
                expect(attributeTransformer.transformEnumeratedAttribute('id', 'good1', [ 'good1', 'good2' ])).toBe('good1');
                expect(attributeTransformer.transformEnumeratedAttribute('id', 'good2', [ 'good1', 'good2' ])).toBe('good2');
                expect(mockReporter).not.toHaveBeenCalled();

                expect(attributeTransformer.transformEnumeratedAttribute('id', 'bad', [ 'good1', 'good2' ])).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('id attribute should be one of "good1","good2" but was: "bad"');

                expect(attributeTransformer.transformEnumeratedAttribute('id', 'bad', [ ])).toBeNull();       // When would we do this?
                expect(mockReporter).toHaveBeenCalledWith('id attribute should be one of "" but was: "bad"'); // Not quite the right message but it's such an edge case...
            });

            it('validates a positive number', function() {
                expect(attributeTransformer.transformPositiveInteger('frameRate', '2')).toBe(2);
                expect(attributeTransformer.transformPositiveInteger('frameRate', '30')).toBe(30);
                expect(mockReporter).not.toHaveBeenCalled();

                expect(attributeTransformer.transformPositiveInteger('frameRate', '0')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('frameRate attribute should be positive, but was: 0');

                expect(attributeTransformer.transformPositiveInteger('frameRate', '-5')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('frameRate attribute should be a positive integer, but was: -5');

                expect(attributeTransformer.transformPositiveInteger('frameRate', '29.97')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('frameRate attribute should be a positive integer, but was: 29.97');

                expect(attributeTransformer.transformPositiveInteger('frameRate', 'squug')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('frameRate attribute should be a positive integer, but was: squug');
            });

            it('validates two positive numbers', function() {
                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '80 24')).toEqual([ 80, 24 ]);
                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '  80    24  ')).toEqual([ 80, 24 ]);
                expect(mockReporter).not.toHaveBeenCalled();

                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '80')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('cellResolution attribute should be two numbers separated by a space, but was: 80');

                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '80 0')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('cellResolution attribute should be two positive numbers separated by a space, but was: 80 0');

                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '0 24')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('cellResolution attribute should be two positive numbers separated by a space, but was: 0 24');

                expect(attributeTransformer.transformTwoPositiveIntegers('cellResolution', '80 squug')).toBeNull();
                expect(mockReporter).toHaveBeenCalledWith('cellResolution attribute should be two numbers separated by a space, but was: 80 squug');
            });

            it('reports errors if there is a reporter', function() {
                attributeTransformer.report('foobar');
                expect(mockReporter).toHaveBeenCalledWith('foobar');
            });

            it('ignores errors if there is no reporter', function() {
                new AttributeTransformer().report('foobar');
                expect(mockReporter).not.toHaveBeenCalled();  // I know this is obvious. What else would you test here?
            });

        });
    }
);
