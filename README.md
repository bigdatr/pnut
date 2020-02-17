# pnut
[![pnut npm](https://img.shields.io/npm/v/pnut.svg?style=flat-square)](https://www.npmjs.com/package/pnut)
[![pnut circle](https://img.shields.io/circleci/project/github/bigdatr/pnut.svg?style=flat-square)](https://circleci.com/gh/bigdatr/pnut)

React charts.




# Basics
1. Series
2. Scales
3. Render


# API

## Series
### Grouped
### Single

## Continuous Scale
## Categorical Scale

## Color Scale
Color scales let you change the colors of your charts based on different attributes of your data.
There are four types:

### Key
Grab the color directly from a data point based on a key.
```js
const color = ColorScale({series, key: 'myColor'});
```

### Set (Categorical)
Assign a specific color palette to each distinct item in the data. This should pair with a CategoricalScale.
```js
const color = ColorScale({series, key: 'type', set: ['red', 'green', 'blue']});
```

### Range (Continuous)
Assign a range of colors and interpolate between them based on a continuous metric. This should pair with a ContinuousScale.
```js
const color = ColorScale({series, key: 'age', range: ['#ccc', 'red']});
```

### Interpolated (Continuous)
Take control of the colors by providing your own interpolator. `interpolate` is given a scaled value from 0 to 1.
```js
const color = ColorScale({series, key: 'type', interpolate: type => {
	return type >= 0.5 ? 'red' : '#ccc';
});
```


# Examples


## Line
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = groupedSeries({
	data, 
	groupBy: get('type'),

});
```
## Multi Line
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = groupedSeries({
	data, 
	groupBy: get('type'),

});
```
## Stacked Area

## Column
```
x = categoricalScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = plainSeries(data);
```

## Stacked Column
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
## Grouped Column
```
x = categoricalScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = groupedSeries(data, get('category'));
```

## Scatter
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['count']});
radius = continuousScale({columns: ['spend']});
color = colorScale({colors: ['#fff', #000'], range: radius.range});
```
## Bubble
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['count']});
radius = continuousScale({columns: ['spend']});
color = colorScale({colors: ['#fff', #000'], range: radius.range});
```


### histogram @todo
```
x = continuousScale({columns: 'date'});
y = continuousScale({columns: ['spot_spend']});
data = binnedSeries({
	data, 
	thresholds: friedman,
	value: sum('item')

});
```

### pie @todo
```
radius = continousScale({columns: ['foo']});
data = plainSeries(data);
```


## TODO
* Bar
* Histogram
* Series.bin();



