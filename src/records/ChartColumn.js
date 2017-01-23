// @flow

import {Record} from 'immutable';

class ChartColumnRecord extends Record({
    key: "",
    label: "",
    isContinuous: false
}) {}

export default ChartColumnRecord;

/**
 * An object to define a column for a chart. Once passed into a `ChartData` constructor these are replaced with equivalent `ChartColumn`s. Also note that you'll rarely need to set `isContinuous` explicitly as it will be inferred from data automatically when not provided.
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

export type ChartColumnDefinition = Object|Map<string,*>;
export type ChartColumn = *; // todo: should be a Column Record
