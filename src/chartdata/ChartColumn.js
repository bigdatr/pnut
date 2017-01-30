// @flow

import {Record} from 'immutable';

class ChartColumnRecord extends Record({
    key: "",
    label: "",
    isContinuous: false
}) {}

export default ChartColumnRecord;

/**
 * An `Object` or `Map` that defines column information for a chart. These enable you to nominate labels for your columns, and provide a default column order.
 * Once passed into a `ChartData` constructor these are replaced with equivalent `ChartColumn` Records.
 * Also note that you'll rarely need to set `isContinuous` explicitly as it will be inferred from data automatically when not provided.
 *
 * @typedef ChartColumnDefinition
 * @type {Object|Map}
 * @property {string} key A unique string name to refer to this column in code.
 * @property {string} label A human readable label for this column that can be rendered by charts
 * @property {boolean} [isContinuous] A boolean indicating if the data in this column is continuous i.e. the data has intrinsic order (like numbers). This property is optional and will be inferred from the data when not provided.
 */

/**
 * A `ChartColumn` Immutable Record containing column-specific metadata.
 *
 * @typedef ChartColumn
 * @type {Record}
 * @property {string} key A unique string name to refer to this column in code.
 * @property {string} label A human readable label for this column that can be rendered by charts
 * @property {boolean} isContinuous A boolean indicating if the data in this column is continuous i.e. the data has intrinsic order (like numbers).
 */

export type ChartColumnDefinition = {key: string, label: string, isContinuous: ?boolean}|Map<string,*>;
export type ChartColumn = ChartColumnRecord;
