require(
    [
        'antie/subtitles/timedtextattributes',
        'antie/subtitles/timedtextelement'
    ],
    function(TimedTextAttributes, TimedTextElement) {
        'use strict';

        describe('antie.subtitles.TimedTextElement', function() {
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
            
            it('returns null if a parent was not supplied', function() {
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p);
                expect(el.getParent()).toBe(null);
            });
            
//            it('throws an error if the the parent supplied to the constructor is not a TimedTextElement', function() {
//                var invalidParentNumber = 1234;       
//    			expect(function() {
//                    var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, invalidParentNumber);
//    			}).toThrowError("TimedTextElement - parent should be a TimedTextElement but was: number. Value: 1234");
//    			
//                var invalidParentString = "I am a string";
//    			expect(function() {
//                    var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, invalidParentString);
//    			}).toThrowError("TimedTextElement - parent should be a TimedTextElement but was: string. Value: I am a string");
//    			
//                var invalidParentBoolean = true;
//    			expect(function() {
//                    var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, invalidParentBoolean);
//    			}).toThrowError("TimedTextElement - parent should be a TimedTextElement but was: boolean. Value: true");
//            });

            it('returns the parent supplied to the constructor', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.text);
                
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, parent);

                expect(el.getParent()).toBe(parent);
            });

            it('returns no children if none have been supplied', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.span);

                var el = new TimedTextElement(TimedTextElement.NODE_NAME.text, parent);
                
                expect(el.getChildren()).toEqual([]);
            });
            
//            it('throws an error if the the children supplied to the constructor are not in an array', function() {
//                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.div);
//
//                var invalidChildrenSolo = new TimedTextElement(TimedTextElement.NODE_NAME.text);
//    			expect(function() {
//                    var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, parent, invalidChildrenSolo);
//    			}).toThrowError("TimedTextElement - children should be an array but was: object. Value: [object Object]");
//    			
//                var invalidChildrenObject = {
//                        new TimedTextElement(TimedTextElement.NODE_NAME.br),
//                        new TimedTextElement(TimedTextElement.NODE_NAME.text)
//                    };
//    			expect(function() {
//                    var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, parent, invalidChildrenObject);
//    			}).toThrowError("TimedTextElement - children should be an array but was: object. Value: [object Object]");  
//            });

            it('returns the children supplied to the constructor', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.div);

                var children = [
                    new TimedTextElement(TimedTextElement.NODE_NAME.text),
                    new TimedTextElement(TimedTextElement.NODE_NAME.span)
                ];
                
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, parent, children);

                expect(el.getChildren()).toEqual(children);
                expect(el.getChildren()).not.toBe(children); // It's a copy of the original array
            });

            it('returns empty timing points if no times specified', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.div);

                var children = [
                    new TimedTextElement(TimedTextElement.NODE_NAME.text),
                    new TimedTextElement(TimedTextElement.NODE_NAME.span)
                ];
                var el = new TimedTextElement(TimedTextElement.NODE_NAME.p, parent, children);

                // Method under test
                expect(el.getTimingPoints()).toEqual([]);
            });
        });
    }
);
