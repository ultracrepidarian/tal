require(
    [
        'antie/subtitles/timedtexthead',
        'antie/subtitles/timedtextelement'
    ],
    function(TimedTextHead, TimedTextElement) {
        'use strict';

        describe('antie.subtitles.TimedTextHead', function() {

            it('has node name "head"', function() {
                var el = new TimedTextHead();
                expect(el.getNodeName()).toBe(TimedTextElement.NODE_NAME.head);
            });

        });
    }
);
