require(
    [
        'antie/subtitles/ttmlnamespaces'
    ],
    function(TtmlNamespaces) {
        'use strict';

        describe('antie .subtitles.TtmlNamespaces', function() {

            it('default namespace for tt prefix is http://www.w3.org/ns/ttml', function() {
                var ttmlNamespaces = new TtmlNamespaces();
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/ns/ttml')).toBe(true);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/2006/10/ttaf1')).toBe(false);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/2006/04/ttaf1')).toBe(false);
            });

            it('specified namespaces override default', function() {
                var ttmlNamespaces = new TtmlNamespaces(['http://www.w3.org/2006/10/ttaf1', 'http://www.w3.org/2006/04/ttaf1']);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/ns/ttml')).toBe(false);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/2006/10/ttaf1')).toBe(true);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/2006/04/ttaf1')).toBe(true);
            });

            it('only recognises the canonical name for a namespace', function() {
                var ttmlNamespaces = new TtmlNamespaces(['http://www.w3.org/2006/10/ttaf1']);
                expect(ttmlNamespaces.isCanonicalNamespace('tt', 'http://www.w3.org/2006/10/ttaf1')).toBe(true);
                expect(ttmlNamespaces.isCanonicalNamespace('tt2', 'http://www.w3.org/2006/10/ttaf1')).toBe(false);
            });

            it('only recognises non TTML standard namespaces when explicitly specified', function() {
                var defaultTtmlNamespaces = new TtmlNamespaces();
                expect(defaultTtmlNamespaces.isCanonicalNamespace('smpte', 'http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt')).toBe(false);

                var specifiedTtmlNamespaces = new TtmlNamespaces(['http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt']);
                expect(specifiedTtmlNamespaces.isCanonicalNamespace('smpte', 'http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt')).toBe(true);
            });

        });
    }
);
