// @flow

import {Record} from 'immutable';

class Column extends Record({
    key: "",
    label: "",
    isContinuous: false
}) {}

export default Column;
