// @flow
import type {Point} from './Series';
import Series from './Series';
import groupBy from 'unmutable/groupBy';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';
import toArray from 'unmutable/toArray';


type GroupedSeriesConfig = {
    groupKey: string | Array<string>,
    pointKey: string,
    data: Array<Point>
};

export default class GroupedSeries extends Series {
    constructor(config: GroupedSeriesConfig) {
        const {pointKey, data} = config;
        const groupKey = [].concat(config.groupKey);
        const baseGroup = new Map();

        if(groupKey.includes(pointKey)) throw "pointKey cannot be used as a groupKey.";

        data.forEach(item => {
            const pointValue = item[pointKey];
            baseGroup.set(String(pointValue), {[pointKey]: pointValue});
        });

        const groups = pipeWith(
            [...data],
            groupBy(item => groupKey.reduce((acc, key) => acc + item[key], "")),
            toArray(),
            map(group => {
                const newGroupMap = group.reduce((map, item) => {
                    return map.set(String(item[pointKey]), item);
                }, new Map(baseGroup));
                return [...newGroupMap.values()];
            }),
        );

        super({
            pointKey,
            groupKey,
            rawData: data,
            groups
        });
    }
}
