
function min(data, columns, stackedData) {
    return stackedData
        ? array.min([].concat(...stackedData), d => d[0])
        : data.min(columns)
    ;
}
