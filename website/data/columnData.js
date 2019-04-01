import {ChartData} from 'pnut';

const columns = [
    {
        key: 'supply',
        label: 'Supply',
        isContinuous: true
    },
    {
        key: 'demand',
        label: 'Demand',
        isContinuous: true
    },
    {
        key: 'other',
        label: 'Other',
        isContinuous: true
    },

    {
        key: 'property_type',
        label: 'Property Type',
        isContinuous: false
    }
];

const rows = [
    {
        demand: 2316,
        property_type: "Townhouse",
        supply: 312,
        other: 178
    },
    {
        demand: 4487,
        property_type: "Villa",
        supply: 100,
        other: 278
    },
    {
        demand: 1275,
        property_type: "Land",
        supply: 782,
        other: 378
    },
    {
        demand: 707,
        property_type: "Apartment",
        supply: 264,
        other: 478
    },
    {
        demand: 3681,
        property_type: "Unit",
        supply: 654,
        other: 578
    },
    {
        demand: 4544,
        property_type: "House",
        supply: 2151,
        other: 678
    },
    {
        demand: 2560,
        property_type: "Other",
        supply: 378,
        other: 778
    }
];


export default new ChartData(rows, columns);