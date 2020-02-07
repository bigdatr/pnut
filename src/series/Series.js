// @flow
import groupBy from 'unmutable/groupBy';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';
import toArray from 'unmutable/toArray';
import get from 'unmutable/get';
import getIn from 'unmutable/getIn';

type SeriesConfig<A> = {
    groups: Array<Array<A>>,
    rawData: Array<A>,
    type: string,
    groupKey: string,
    pointKey: string,
    preprocess: Object
};

export default class Series<A> {
    constructor(config: SeriesConfig<A>) {
        this.rawData = config.rawData;
        this.groups = config.groups;
        this.type = config.type;
        this.groupKey = config.groupKey;
        this.pointKey = config.pointKey;
        this.preprocess = config.preprocess || {};
    }

    static of(config: SeriesConfig<A>): Series<A> {
        return new Series(config);
    }

    static group(groupKey: string, pointKey: string, rawData: A[][]): Series<A> {
        const baseGroup = new Map();

        rawData.forEach(item => {
            const pointValue = get(pointKey)(item);
            baseGroup.set(String(pointValue), {[pointKey]: pointValue});
        });

        const groups = pipeWith(
            [...rawData],
            groupBy(get(groupKey)),
            toArray(),
            map(group => {
                const newGroupMap = group.reduce((map, item) => {
                    return map.set(String(get(pointKey)(item)), item);
                }, new Map(baseGroup));

                return [...newGroupMap.values()];
            })
        );

        return Series.of({
            type: 'grouped',
            groupKey,
            pointKey,
            rawData,
            groups
        });
    }

    copy() {
        return new Series({...this});
    }

    update<B>(fn: Function): Series<B> {
        return Series.of(fn(this));
    }

    get(groupIndex: number, pointIndex: number): A {
        return getIn([groupIndex, pointIndex])(this.groups);
    }

    mapGroups<B>(fn: (A) => B): Series<B> {
        this.groups = this.groups.map(fn);
        return this.copy();
    }

    getGroup(index: number): A[] {
        return this.data[index];
    }

    mapPoints<B>(fn: (A) => B): Series<B> {
        for (let c = 0; c < this.groups[0].length; c++) {
            let point = fn(this.getPoint(c), c);
            for (let r = 0; r < this.groups.length; r++) {
                this.groups[r][c] = point[r];
            }
        }

        return this.copy();
    }

    getPoint(index: number): A[] {
        return this.groups.map(group => group[index]);
    }

}
