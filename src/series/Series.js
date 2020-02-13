// @flow
import groupBy from 'unmutable/groupBy';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';
import toArray from 'unmutable/toArray';
import get from 'unmutable/get';
import getIn from 'unmutable/getIn';


export type Point = {[string]: any};

type SeriesConfig = {
    groups: Point[][],
    rawData: Point[],
    type: string,
    groupKey: string[],
    pointKey: ?string,
    preprocess?: Object
};


export default class Series {
    groups: Point[][];
    rawData: Point[];
    type: string;
    groupKey: string[];
    pointKey: ?string;
    preprocess: Object;

    constructor(config: SeriesConfig) {
        this.rawData = config.rawData;
        this.groups = config.groups;
        this.type = config.type;
        this.groupKey = config.groupKey;
        this.pointKey = config.pointKey;
        this.preprocess = config.preprocess || {};
    }

    static of(config: SeriesConfig): Series {
        return new Series(config);
    }

    static group(group: string | Array<string>, pointKey: string, rawData: Point[]): Series {
        // Backwards compatibility;
        const groupKey = typeof group === "string" ? [group] : group;
        if(groupKey.includes(pointKey))
            throw "Point key cannot be used as a grouping key.";

        const baseGroup = new Map();

        rawData.forEach(item => {
            const pointValue = get(pointKey)(item);
            baseGroup.set(String(pointValue), {[pointKey]: pointValue});
        });

        const groups = pipeWith(
            [...rawData],
            groupBy(item => groupKey.reduce((acc, key) => acc + item[key], "")),
            toArray(),
            map(group => {
                const newGroupMap = group.reduce((map, item) => {
                    return map.set(String(get(pointKey)(item)), item);
                }, new Map(baseGroup));
                return [...newGroupMap.values()];
            }),
        );

        return Series.of({
            type: 'grouped',
            groupKey,
            pointKey,
            rawData,
            groups
        });
    }

    copy(): Series {
        return new Series({...this});
    }

    update(fn: Function): Series {
        return Series.of(fn(this));
    }

    get(groupIndex: number, pointIndex: number): Point {
        return getIn([groupIndex, pointIndex])(this.groups);
    }

    mapGroups(fn: Function): Series {
        this.groups = this.groups.map(fn);
        return this.copy();
    }

    getGroup(index: number): Point[] {
        return this.groups[index];
    }

    mapPoints(fn: Function): Series {
        for (let c = 0; c < this.groups[0].length; c++) {
            let point = fn(this.getPoint(c), c);
            for (let r = 0; r < this.groups.length; r++) {
                this.groups[r][c] = point[r];
            }
        }

        return this.copy();
    }

    getPoint(index: number): Point[] {
        return this.groups.map(group => group[index]);
    }

    sumRow(key: string, index: number){
        return this.getGroup(index).reduce((acc, row) => acc + (row[key] || 0), 0);
    }
    
    sumColumn(key: string, index: number){
        return this.groups.reduce((acc, group) => acc + (group[index][key] || 0), 0);
    }

    sum(key: string): number{
        return this.rawData.reduce((acc, point) => acc + (point[key] || 0), 0);
    }

}
