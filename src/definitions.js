// @flow
import type {Node} from 'react';

export type ChartColumnInput<R> = {key: $Keys<R>, label?: string, isContinuous?: ?boolean};
export type ChartColumnInputList<R> = Array<ChartColumnInput<R>>;
export type ChartColumn<R> = {key: $Keys<R>, label: string, isContinuous: boolean};
export type ChartColumnList<R> = Array<ChartColumn<R>>;
export type ChartScalar = string|number|null|Date;
export type ChartRow = {[key: string]: ChartScalar};

export type Scale = Function;

export type LinePosition = {x1: number, x2: number, y1: number, y2: number};
export type PathPosition = {d: string};
export type TextPosition = {x: number, y: number, children: Node};
