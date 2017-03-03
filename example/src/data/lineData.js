import {ChartData} from 'pnut';

const columns = [
    {
        key: 'month',
        label: 'Month'
    },
    {
        key: 'supply',
        label: 'Supply'
    },
    {
        key: 'demand',
        label: 'Demand'
    }

];

const rows = [
    {
        month: new Date("2014-01-01"),
        supply: 123605,
        demand: 280000
    },
    {
        month: new Date("2014-02-01"),
        supply: 457959,
        demand: 720000
    },
    {
        month: new Date("2014-03-01"),
        supply: 543558,
        demand: 960000
    },
    {
        month: new Date("2014-04-01"),
        supply: 657625,
        demand: 107000
    },
    {
        month: new Date("2014-05-01"),
        supply: 724687,
        demand: 116000
    },
    {
        month: new Date("2014-06-01"),
        supply: 577673,
        demand: 930000
    },
    {
        month: new Date("2014-07-01"),
        supply: 510476,
        demand: 850000
    },
    {
        month: new Date("2014-08-01"),
        supply: 587977,
        demand: 104000
    },
    {
        month: new Date("2014-09-01"),
        supply: 589351,
        demand: 121000
    },
    {
        month: new Date("2014-10-01"),
        supply: 557710,
        demand: 138000
    },
    {
        month: new Date("2014-11-01"),
        supply: 550750,
        demand: 139000
    },
    {
        month: new Date("2014-12-01"),
        supply: 240661,
        demand: 950000
    },
    {
        month: new Date("2015-01-01"),
        supply: 278804,
        demand: 870000
    },
    {
        month: new Date("2015-02-01"),
        supply: 785962,
        demand: 141000
    },
    {
        month: new Date("2015-03-01"),
        supply: 713841,
        demand: 129000
    },
    {
        month: new Date("2015-04-01"),
        supply: 681580,
        demand: 1320000
    },
    {
        month: new Date("2015-05-01"),
        supply: 930395,
        demand: 1390000
    },
    {
        month: new Date("2015-06-01"),
        supply: 937566,
        demand: 1090000
    },
    {
        month: new Date("2015-07-01"),
        supply: 1011621,
        demand: 1260000
    },
    {
        month: new Date("2015-08-01"),
        supply: 1638135,
        demand: 1540000
    },
    {
        month: new Date("2015-09-01"),
        supply: 1209174,
        demand: 1380000
    },
    {
        month: new Date("2015-10-01"),
        supply: 1060541,
        demand: 1370000
    },
    {
        month: new Date("2015-11-01"),
        supply: 135844,
        demand: 1700000
    },
    {
        month: new Date("2015-12-01"),
        supply: 629503,
        demand: 125000
    },
    {
        month: new Date("2016-01-01"),
        supply: 678891,
        demand: 109000
    },
    {
        month: new Date("2016-02-01"),
        supply: 1681174,
        demand: 1630000
    },
    {
        month: new Date("2016-03-01"),
        supply: 1209983,
        demand: 1400000
    },
    {
        month: new Date("2016-04-01"),
        supply: 1380393,
        demand: 1490000
    },
    {
        month: new Date("2016-05-01"),
        supply: 1267107,
        demand: 1510000
    },
    {
        month: new Date("2016-06-01"),
        supply: 1371218,
        demand: 1540000
    },
    {
        month: new Date("2016-07-01"),
        supply: 1652395,
        demand: 1600000
    },
    {
        month: new Date("2016-08-01"),
        supply: 1561521,
        demand: 1810000
    },
    {
        month: new Date("2016-09-01"),
        supply: 1896226,
        demand: 2180000
    },
    {
        month: new Date("2016-10-01"),
        supply: null,
        demand: 2270000
    },
    {
        month: new Date("2016-11-01"),
        supply: 1896226,
        demand: 2470000
    },
    {
        month: new Date("2016-12-01"),
        supply: 770154,
        demand: 2040000
    }
];


export default new ChartData(rows, columns);
