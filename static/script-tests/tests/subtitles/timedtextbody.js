require(
    [
        'antie/subtitles/timedtextbody',
        'antie/subtitles/timedtextelement'
    ],
    function(TimedTextBody, TimedTextElement) {
        'use strict';

        describe('antie.subtitles.TimedTextBody', function() {

            it('has node name "body"', function() {
                var el = new TimedTextBody();
                expect(el.getNodeName()).toBe(TimedTextElement.NODE_NAME.body);
            });

            it('sets its parent and children', function() {
                var parent = new TimedTextElement(TimedTextElement.NODE_NAME.div);

                var children = [
                    new TimedTextElement(TimedTextElement.NODE_NAME.div),
                    new TimedTextElement(TimedTextElement.NODE_NAME.div)
                ];
                var el = new TimedTextBody(parent, children);

                expect(el.getParent()).toEqual(parent);
                expect(el.getChildren()).toEqual(children);
            });
        });
    }
);
