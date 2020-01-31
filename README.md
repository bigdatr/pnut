# pnut
[![pnut npm](https://img.shields.io/npm/v/pnut.svg?style=flat-square)](https://www.npmjs.com/package/pnut)
[![pnut circle](https://img.shields.io/circleci/project/github/bigdatr/pnut.svg?style=flat-square)](https://circleci.com/gh/bigdatr/pnut)

React charts.

- [API Documentation](https://bigdatr.github.io/pnut/docs)
- [Examples](https://bigdatr.github.io/pnut/example)

## Contributing

See [Contributing](/CONTRIBUTING.md) for contribution guidelines.



## Scales



### bubble chart 
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['count']});
radius = continuousScale({columns: ['spend']});
color = colorScale({colors: ['#fff', #000'], range: radius.range});
```
### multi line
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = groupedSeries({
	data, 
	groupBy: get('type'),

});
```


### stacked bar
```
x = categoricalScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
color = (row) => colors[row.category];
data = groupedSeries({
	data, 
	groupBy: get('category'),
	process: normalize()
});
```

### bar chart
```
x = categoricalScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = plainSeries(data);
```

### grouped column
```
x = categoricalScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = groupedSeries(data, get('category'));
```


### ### histogram 
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = binnedSeries({
	data, 
	thresholds: friedman,
	value: sum('item')

});
```

### pie 
```
radius = continousScale({columns: ['foo']});
data = plainSeries(data);
```





