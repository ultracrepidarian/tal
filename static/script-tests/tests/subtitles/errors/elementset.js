require(
    [
        'antie/subtitles/elementset'
    ],
    function(ElementSet) {
        'use strict';

        describe('antie.subtitles.ElementSet', function() {

            it('adds/deletes elements', function() {
                var element1 = '1';
                var element2 = 2.0;
                // var element2 = 2.0;
                var set = new ElementSet();
                expect(set.contains(element1)).toBe(false);
                expect(set.contains(element2)).toBe(false);
                set.add(element1);
                expect(set.contains(element1)).toBe(true);
                expect(set.contains(element2)).toBe(false);
                set.add(element1);
                expect(set.contains(element1)).toBe(true);
                expect(set.contains(element2)).toBe(false);
                set.add(element2);
                expect(set.contains(element1)).toBe(true);
                expect(set.contains(element2)).toBe(true);
                set.delete(element1);
                expect(set.contains(element1)).toBe(false);
                expect(set.contains(element2)).toBe(true);
                set.delete(element1);
                expect(set.contains(element1)).toBe(false);
                expect(set.contains(element2)).toBe(true);
                set.delete(element2);
                expect(set.contains(element1)).toBe(false);
                expect(set.contains(element2)).toBe(false);
            });

        });
    }
);
