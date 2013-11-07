Quick demo of how you can use [D3](http://http://d3js.org)'s [Nest](https://github.com/mbostock/d3/wiki/Arrays#-nest) in your node apps, sans D3.

```coffeescript
nest = require 'nest'
assert = require 'assert'
isEqual = assert.deepEqual
```
Suppose we have an array of records:

```coffeescript
data = [
  type: "apple"
  color: "green"
  quantity: 1
 , 
  type: "apple"
  color: "red"
  quantity: 2
 , 
  type: "grape"
  color: "green"
  quantity: 3
 ,
  type: "grape"
  color: "red"
  quantity: 4
]
```

## Grouping
  
Let's group our entries by color:

```coffeescript
groups = nest()
  .key((d) -> d.color)  # group entries by color
  .entries(data)

expected = [
  key: 'green'
  values: 
    [ { type: 'apple', color: 'green', quantity: 1 },
      { type: 'grape', color: 'green', quantity: 3 } ]
 ,
  key: 'red'
  values: 
    [ { type: 'apple', color: 'red', quantity: 2 },
      { type: 'grape', color: 'red', quantity: 4 } ]
]
isEqual groups, expected, 'group by color'
```

## Rollups

Let's define an aggregator function for a [rollup](https://github.com/mbostock/d3/wiki/Arrays#wiki-nest_rollup).  Here the `total` method sums up the `quantity` attribute of each entry:

```coffeescript
sum = (arr, acc) -> 
  x = 0
  x += (if acc then acc(i) else i) for i in arr
  x

total = (d) -> sum(d, (x) -> x.quantity)
```
So we can now get totals by color:

```coffeescript
totals = nest()
  .key((d) -> d.color)    # group by color
  .rollup(total)          # sum entries by quantity
  .entries(data)

expected = [ { key: 'green', values: 4 }, { key: 'red', values: 6 } ]
isEqual totals, expected, 'total by color'
```
Similarly by type:

```coffeescript
totals = nest()
  .key((d) -> d.type)     # group by type
  .rollup(total)          # sum entries by quantity
  .entries(data)

expected = [ { key: 'apple', values: 3 }, { key: 'grape', values: 7 } ]
isEqual totals, expected, 'total by type'
```

