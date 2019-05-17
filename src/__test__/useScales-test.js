import useScales from '../useScales';
import ChartData from '../chartdata/ChartData';
const columns = [
    {key: 'foo'},
    {key: 'bar'},
    {key: 'baz'},
    {key: 'qux'}
];

const rows = [
    {foo: 1, bar: 4, baz: 'a', qux: new Date('1970-01-01')},
    {foo: 2, bar: 5, baz: 'b', qux: new Date('1970-01-02')},
    {foo: 3, bar: 6, baz: 'c', qux: new Date('1970-01-03')},
    {foo: 4, bar: 7, baz: 'c', qux: new Date('1970-01-03')}
];

const data = new ChartData(rows, columns);

describe('useScales', () => {
    it('can create many dimensions', () => {
        const dimensions = useScales([
            {columns: ['foo'], range: [0, 100]},
            {columns: ['bar'], range: [0, 100]},
        ])(data);

        expect(dimensions.length).toBe(2);
    });

    it('can scale one column', () => {
        const [foo] = useScales([
            {columns: ['foo'], range: [0, 100], zero: true},
        ])(data);

        expect(foo.scaledData).toEqual([[[25], [50], [75], [100]]]);
    });

    it('can scale multiple columns', () => {
        const [foo] = useScales([
            {columns: ['foo', 'bar'], range: [0, 14], zero: true},
        ])(data);

        expect(foo.scaledData).toEqual([
            [[2],[4],[6],[8]],
            [[8],[10],[12],[14]]
        ]);
    });

    it('will ignore nulls', () => {
            const rows = [
                {foo: 1, bar: 1},
                {foo: null, bar: null},
                {foo: 3, bar: 3}
            ];

            const data = new ChartData(rows, columns);
            const [foo] = useScales([
                {columns: ['foo', 'bar'], range: [0, 6], zero: true},
            ])(data);

            expect(foo.scaledData).toEqual([
                [[2], [null], [6]],
                [[2], [null], [6]]
            ]);
    });


    it('should throw if you try and stack non-numerical data', () => {
        const badRequest = () => useScales([
            {columns: ['qux', 'qux'], range: [0, 1], stack: true}
        ])(data);

        expect(badRequest).toThrow();
    });
});

describe('stacking', () => {
    it('can stack multiple columns', () => {
            const rows = [
                {foo: 1, bar: 1},
                {foo: 2, bar: 2},
                {foo: 3, bar: 3}
            ];

            const data = new ChartData(rows, columns);
            const [foo] = useScales([
                {columns: ['foo', 'bar'], range: [0, 6], stack: true, zero: true},
            ])(data);

            expect(foo.scaledData).toEqual([
                [[0, 1], [0, 2], [0, 3]],
                [[1, 2], [2, 4], [3, 6]]
            ]);
    });

    it('will ignore nulls', () => {
            const rows = [
                {foo: 1, bar: 1},
                {foo: null, bar: null},
                {foo: 3, bar: 3}
            ];

            const data = new ChartData(rows, columns);
            const [foo] = useScales([
                {columns: ['foo', 'bar'], range: [0, 6], stack: true, zero: true},
            ])(data);

            expect(foo.scaledData).toEqual([
                [[0, 1], [null, null], [0, 3]],
                [[1, 2], [null, null], [3, 6]]
            ]);
    });
});
