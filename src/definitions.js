// @flow

export type ChartColumnInput<R> = {key: $Keys<R>, label: string, isContinuous?: ?boolean};
export type ChartColumnInputList<R> = Array<ChartColumnInput<R>>;
export type ChartColumn<R> = {key: $Keys<R>, label: string, isContinuous: boolean};
export type ChartColumnList<R> = Array<ChartColumn<R>>;
export type ChartScalar = string|number|null|Date;
export type ChartRow = {[key: string]: ChartScalar};