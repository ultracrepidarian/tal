require(
    [
        'antie/subtitles/attributedefaultsfactory',
        'antie/subtitles/attributetransformercss3',
        'antie/subtitles/timedtext',
        'antie/subtitles/timedtextbody',
        'antie/subtitles/timedtextattributes',
        'antie/subtitles/timedtextelement'
    ],
    function(AttributeDefaultsFactory, AttributeTransformerCss3, TimedText, TimedTextBody, TimedTextAttributes, TimedTextElement) {
        'use strict';

        describe('antie.subtitles.TimedTextElement', function() {

            beforeEach(function() {
                spyOn(AttributeTransformerCss3.prototype, 'init');
                spyOn(AttributeTransformerCss3.prototype, 'transformFontFamily').and.callFake(function(value) {
                    return value;
                });
            });

            it('starts off with empty attributes object', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                expect(el.getAttributes()).toEqual(jasmine.any(TimedTextAttributes));
                expect(el.getAttributes()._attributeMap).toEqual({});
            });

            it('returns node name', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                expect(el.getNodeName()).toBe(TimedTextElement.NODE_NAME.text);
            });

            it('returns no text of none set', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                expect(el.getText()).toBeNull();
            });

            it('sets/gets text', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                el.setText('Winston, you are drunk!');
                expect(el.getText()).toBe('Winston, you are drunk!');
            });

            it('returns null if a parent was not set', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                expect(el.getParent()).toBe(null);
            });

            it('throws an error if the the object supplied to the parent setter is not a TimedTextElement', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p);

                //number
                var errorThrown = false;
                var invalidParentNumber = 1234;
                try {
                    el.setParent(invalidParentNumber);
                } catch (e) {
                    expect(e.message).toBe('TimedTextElement - parent should be a TimedTextElement but was: number. Value: 1234');
                    errorThrown = true;
                }
                expect(errorThrown).toBe(true); //fail the test if we didn't throw an error

                //string
                errorThrown = false;
                var invalidParentString = 'I am a string';
                try {
                    el.setParent(invalidParentString);
                } catch (e) {
                    expect(e.message).toBe('TimedTextElement - parent should be a TimedTextElement but was: string. Value: I am a string');
                    errorThrown = true;
                }
                expect(errorThrown).toBe(true); //fail the test if we didn't throw an error

                //boolean
                errorThrown = false;
                var invalidParentBoolean = true;
                try {
                    el.setParent(invalidParentBoolean);
                } catch (e) {
                    expect(e.message).toBe('TimedTextElement - parent should be a TimedTextElement but was: boolean. Value: true');
                    errorThrown = true;
                }
                expect(errorThrown).toBe(true); //fail the test if we didn't throw an error
            });

            it('returns the parent if it was set', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.div);

                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                el.setParent(parent);

                expect(el.getParent()).toBe(parent);
            });

            it('returns no children if none have been supplied', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text);

                expect(el.getChildren()).toEqual([]);
            });

            it('throws an error if the the children supplied to the constructor are not in an array', function() {
                //timedtextelement not in array
                var errorThrown = false;
                var invalidChildrenSolo = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                try {
                    new TimedTextElement(TimedTextElement.NODE_NAME.p, invalidChildrenSolo);
                } catch (e) {
                    expect(e.message).toBe('TimedTextElement - children should be an array but was: object. Value: [object Object]');
                    errorThrown = true;
                }
                expect(errorThrown).toBe(true); //fail the test if we didn't throw an error

                //string
                errorThrown = false;
                var invalidChildrenString = 'I am a string';
                try {
                    new TimedTextElement(TimedTextElement.NODE_NAME.p, invalidChildrenString);
                } catch (e) {
                    expect(e.message).toBe('TimedTextElement - children should be an array but was: string. Value: I am a string');
                    errorThrown = true;
                }
                expect(errorThrown).toBe(true); //fail the test if we didn't throw an error
            });

            it('returns the children supplied to the constructor', function() {
                var children = [
                    new TimedTextElement(TimedTextElement.NODE_NAME.text),
                    new TimedTextElement(TimedTextElement.NODE_NAME.span)
                ];

                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, children);

                expect(el.getChildren()).toEqual(children);
                expect(el.getChildren()).not.toBe(children); // It's a copy of the original array
            });

            it('returns empty timing points if no times specified', function() {
                var children = [
                    new TimedTextElement(TimedTextElement.NODE_NAME.text),
                    new TimedTextElement(TimedTextElement.NODE_NAME.span)
                ];
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, children);

                // Method under test
                expect(el.getTimingPoints()).toEqual([]);
            });

            it('inherits inheritable attributes not specified inline', function() {
                var span0Element = new TimedTextElement(TimedTextElement.NODE_NAME.span);
                var span1Element = new TimedTextElement(TimedTextElement.NODE_NAME.span);
                var paraElement = new TimedTextElement(TimedTextElement.NODE_NAME.p, [ span0Element, span1Element ]);
                var divElement = new TimedTextElement(TimedTextElement.NODE_NAME.div, [ paraElement ]);

                var span0Attributes = new TimedTextAttributes();
                span0Attributes.setAttribute('color', 'rgba(128,0,0,0.8)');
                span0Element.setAttributes(span0Attributes);

                var paraAttributes = new TimedTextAttributes();
                paraAttributes.setAttribute('color', 'green');
                paraAttributes.setAttribute('backgroundColor', '#FF00FF');
                paraElement.setAttributes(paraAttributes);

                var divAttributes = new TimedTextAttributes();
                divAttributes.setAttribute('color', 'yellow');
                divAttributes.setAttribute('direction', 'rtl');
                divElement.setAttributes(divAttributes);

                expect(span0Element.getAttribute('color')).toBe('rgba(128,0,0,0.8)');  // Inline value overrides inherited
                expect(span0Element.getAttribute('backgroundColor')).toBeNull();       // Not inherited - not an inheritable attribute
                expect(span0Element.getAttribute('direction')).toBe('rtl');            // Inherited from grandparent

                expect(span1Element.getAttribute('color')).toBe('green');              // Inherited from parent
                expect(span1Element.getAttribute('backgroundColor')).toBeNull();       // Not inherited - not an inheritable attribute
                expect(span1Element.getAttribute('direction')).toBe('rtl');            // Inherited from grandparent
            });

            it('orphan always returns null default for any attribute', function() {
                var para = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                expect(para._getAttributeDefault('direction')).toBeNull();
            });

            it('gets attribute default from parent', function() {
                var para = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                expect(para._getAttributeDefault('direction')).toBeNull();

                var body = new TimedTextBody([ para ]);
                expect(para._getAttributeDefault('direction')).toBeNull();  // Body's value is also null

                var tt = new TimedText(null, body);
                tt.setAttributeDefaults(new AttributeDefaultsFactory().getAttributes());

                expect(para._getAttributeDefault('direction')).toBe('ltr');  // tt's value is not null
            });

            it('inherits attribute value from ancestor', function() {
                var para = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                var body = new TimedTextBody([ para ]);
                var tt = new TimedText(null, body);
                tt.setAttributeDefaults(new AttributeDefaultsFactory().getAttributes());

                body.getAttributes().setAttribute('direction', 'rtl');

                expect(para.getAttribute('direction')).toBe('rtl');
            });

            it('returns default attribute value if inheritance yields nothing from any ancestor', function() {
                var para = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                var body = new TimedTextBody([ para ]);
                var tt = new TimedText(null, body);
                tt.setAttributeDefaults(new AttributeDefaultsFactory().getAttributes());

                expect(para.getAttribute('direction')).toBe('ltr');
            });

        });
    }
);
