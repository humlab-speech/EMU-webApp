'use strict';

const { HierarchyWorker } = require('../../../src/app/workers/hierarchy.worker');

describe('Worker: HierarchyWorker', function () {

    let hierarchyWorker;

    beforeEach(function () {
        hierarchyWorker = new HierarchyWorker();
    });

    // ================================================================
    // Test helper: build annotation structures for testing
    // ================================================================

    /**
     * Create a test annotation with specified levels and links.
     * @param {Array} levelNames - Level names to create
     * @param {Array} links - Array of {fromID, toID} link objects
     * @returns {Object} Annotation JSO
     */
    function makeAnnotation(levelNames, links = []) {
        const annotation = {
            levels: levelNames.map((name, idx) => ({
                name,
                type: idx === 0 ? 'EVENT' : 'SEGMENT',
                items: []
            })),
            links: links
        };

        // Helper to add item to level
        annotation.addItem = function(levelName, id, sampleStart, sampleDur, label = 'item') {
            const level = this.levels.find(l => l.name === levelName);
            if (level) {
                level.items.push({
                    id,
                    sampleStart,
                    sampleDur,
                    labels: [{ name: label }]
                });
            }
        };

        return annotation;
    }

    // ================================================================
    // reduceToItemsWithTimeInView — viewport filtering
    // ================================================================

    describe('reduceToItemsWithTimeInView', function () {

        it('excludes item before viewport', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 0, 100);

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                500,  // viewPortStartSample
                1000  // viewPortEndSample
            );

            expect(result.items.length).toBe(0);
        });

        it('excludes item after viewport', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 1000, 100);

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                0,    // viewPortStartSample
                500   // viewPortEndSample
            );

            expect(result.items.length).toBe(0);
        });

        it('includes item overlapping viewport start', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 400, 200); // 400-600 overlaps 500-1000

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                500,
                1000
            );

            expect(result.items.length).toBe(1);
            expect(result.items[0].id).toBe(1);
        });

        it('includes item overlapping viewport end', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 900, 200); // 900-1100 overlaps 500-1000

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                500,
                1000
            );

            expect(result.items.length).toBe(1);
        });

        it('excludes item where sampleStart + sampleDur === vpStart (strict > check)', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 300, 200); // ends at 500 (vpStart)

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                500,
                1000
            );

            expect(result.items.length).toBe(0);
        });

        it('excludes item where sampleStart === vpEnd', function () {
            const annotation = makeAnnotation(['sublevel']);
            annotation.addItem('sublevel', 1, 1000, 200); // starts at vpEnd

            const result = hierarchyWorker.reduceToItemsWithTimeInView(
                annotation,
                ['sublevel'],
                500,
                1000
            );

            expect(result.items.length).toBe(0);
        });

    });

    // ================================================================
    // giveTimeToParentsAndAppendItemsAndLinks — time propagation
    // ================================================================

    describe('giveTimeToParentsAndAppendItemsAndLinks', function () {

        it('child with no links — no crash on empty links', function () {
            const annotation = makeAnnotation(['child'], []);
            annotation.addItem('child', 1, 0, 100);

            expect(function () {
                hierarchyWorker.reduceToItemsWithTimeInView(
                    annotation,
                    ['child'],
                    0, 100
                );
            }).not.toThrow();
        });

        it('two levels with parent child relationship — annotation processed', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 }
            ]);
            annotation.addItem('child', 1, 50, 100);
            annotation.addItem('parent', 10, 0, 200);

            expect(function () {
                hierarchyWorker.reduceAnnotationToViewableTimeAndPath(
                    annotation,
                    ['child', 'parent'],
                    0, 200
                );
            }).not.toThrow();
        });

        it('multiple children link to parent — processes all links', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 },
                { fromID: 10, toID: 2 }
            ]);
            annotation.addItem('child', 1, 30, 50);
            annotation.addItem('child', 2, 100, 50);
            annotation.addItem('parent', 10, 0, 200);

            expect(function () {
                hierarchyWorker.reduceAnnotationToViewableTimeAndPath(
                    annotation,
                    ['child', 'parent'],
                    0, 200
                );
            }).not.toThrow();
        });

        it('time propagation — handles child extending parent bounds', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 }
            ]);
            annotation.addItem('child', 1, 50, 150);  // child extends beyond parent
            annotation.addItem('parent', 10, 100, 100);

            const result = hierarchyWorker.reduceAnnotationToViewableTimeAndPath(
                annotation,
                ['child', 'parent'],
                0, 300
            );

            // Result should have two levels with items properly updated
            expect(result.levels.length).toBe(2);
            expect(result.links).toBeDefined();
        });

        it('multiple children for same parent — includes all children', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 },
                { fromID: 10, toID: 2 },
                { fromID: 10, toID: 3 }
            ]);
            annotation.addItem('child', 1, 0, 50);
            annotation.addItem('child', 2, 50, 50);
            annotation.addItem('child', 3, 100, 50);
            annotation.addItem('parent', 10, 0, 200);

            const result = hierarchyWorker.reduceAnnotationToViewableTimeAndPath(
                annotation,
                ['child', 'parent'],
                0, 200
            );

            // Should process all three children
            expect(result.levels[0].items.length).toBe(3);
        });

    });

    // ================================================================
    // guessLinkDefinitions — link relationship types
    // ================================================================

    describe('guessLinkDefinitions', function () {

        it('empty annotation — returns empty array', function () {
            const annotation = makeAnnotation(['level1', 'level2'], []);

            const result = hierarchyWorker.guessLinkDefinitions(annotation);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it('single parent one child — identifies relationship', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 }   // parent 10 -> child 1
            ]);
            annotation.addItem('child', 1, 0, 100);
            annotation.addItem('parent', 10, 0, 100);

            const result = hierarchyWorker.guessLinkDefinitions(annotation);

            // Should return link definitions with proper structure
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('type');
            expect(result[0]).toHaveProperty('superlevelName');
            expect(result[0]).toHaveProperty('sublevelName');
        });

        it('one parent two children — identifies ONE_TO_MANY', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 },  // parent 10 -> child 1
                { fromID: 10, toID: 2 }   // parent 10 -> child 2
            ]);
            annotation.addItem('child', 1, 0, 100);
            annotation.addItem('child', 2, 100, 100);
            annotation.addItem('parent', 10, 0, 200);

            const result = hierarchyWorker.guessLinkDefinitions(annotation);

            // Should have identified ONE_TO_MANY relationship
            expect(result.length).toBeGreaterThan(0);
            const oneToMany = result.some(l => l.type === 'ONE_TO_MANY');
            expect(oneToMany).toBe(true);
        });

        it('one child two parents — identifies MANY_TO_MANY', function () {
            const annotation = makeAnnotation(['child', 'parent'], [
                { fromID: 10, toID: 1 },  // parent 10 -> child 1
                { fromID: 11, toID: 1 }   // parent 11 -> child 1
            ]);
            annotation.addItem('child', 1, 0, 100);
            annotation.addItem('parent', 10, 0, 100);
            annotation.addItem('parent', 11, 0, 100);

            const result = hierarchyWorker.guessLinkDefinitions(annotation);

            // Should identify MANY_TO_MANY relationship
            expect(result.length).toBeGreaterThan(0);
            const manyToMany = result.some(l => l.type === 'MANY_TO_MANY');
            expect(manyToMany).toBe(true);
        });

    });

});
