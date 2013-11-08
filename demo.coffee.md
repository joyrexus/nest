Quick demo of how you can use [D3](http://http://d3js.org)'s [Nest](https://github.com/mbostock/d3/wiki/Arrays#-nest) in your node apps, sans D3.

    nest = require 'nest'
    assert = require 'assert'
    isEqual = assert.deepEqual

Suppose we have an array of records:

    data = [
      type: "apple"
      color: "green"
      quantity: 1000
     , 
      type: "apple"
      color: "red"
      quantity: 2000
     , 
      type: "grape"
      color: "green"
      quantity: 1000
     ,
      type: "grape"
      color: "red"
      quantity: 4000
    ]


## Grouping
  
Let's group our entries by color:

    result = nest()
      .key((d) -> d.color)  # group entries by color
      .entries(data)

    expected = [
      key: 'green'
      values: 
        [ { type: 'apple', color: 'green', quantity: 1000 },
          { type: 'grape', color: 'green', quantity: 1000 } ]
     ,
      key: 'red'
      values: 
        [ { type: 'apple', color: 'red', quantity: 2000 },
          { type: 'grape', color: 'red', quantity: 4000 } ]
    ]

    isEqual result, expected, 'grouping by color'

Let's group our entries by color and then by quantity ... and also have `nest` return an associative-array instead of an array of key-value pairs:

    result = nest()
      .key((d) -> d.color)    # group entries by color
      .key((d) -> d.quantity) # group entries by quantity
      .map(data)

    expected =
      green:
        "1000": [ 
          { type: 'apple', color: 'green', quantity: 1000 },
          { type: 'grape', color: 'green', quantity: 1000 } 
        ]
      red:
        "2000": [ {type: 'apple', color: 'red', quantity: 2000} ]
        "4000": [ {type: 'grape', color: 'red', quantity: 4000} ]

    isEqual result, expected, 'grouping by color then quantity'


## Rollups

Let's define an aggregator function for a [rollup](https://github.com/mbostock/d3/wiki/Arrays#wiki-nest_rollup).  Here the `total` method sums up the `quantity` attribute of each entry:

    sum = (arr, acc) -> 
      x = 0
      x += (if acc then acc(i) else i) for i in arr
      x

    total = (d) -> sum(d, (x) -> x.quantity)

Get totals by color:

    totals = nest()
      .key((d) -> d.color)    # group by color
      .rollup(total)          # sum entries by quantity
      .entries(data)

    expected = [ {key: 'green', values: 2000}, {key: 'red', values: 6000} ]
    isEqual totals, expected, 'total by color'

Similarly by type:

    totals = nest()
      .key((d) -> d.type)     # group by type
      .rollup(total)          # sum entries by quantity
      .entries(data)

    expected = [ {key: 'apple', values: 3000}, {key: 'grape', values: 5000} ]
    isEqual totals, expected, 'total by type'


## Comparison with `groupBy` and `countBy`

The following demonstrates `nest` equivalents for underscore's [groupBy](http://underscorejs.org/#groupBy) and [countBy](http://underscorejs.org/#countBy)

Note that `nest` supports more than one level of grouping and can also return nested entries that preserve order.

    _ = require 'underscore'
    isEqual = assert.deepEqual

<!-- -->

    data = [1.3, 2.1, 2.4]

    result = nest()
      .key(Math.floor)
      .map(data)

    expected = 
      1: [ 1.3 ]
      2: [ 2.1, 2.4 ]

    isEqual result, expected

    isEqual result, _.groupBy(data, (x) -> Math.floor x)

<!-- -->

    data = ["one", "two", "three"]

    result = nest()
      .key((d) -> d.length)
      .map(data)

    expected = 
      3: [ 'one', 'two' ]
      5: [ 'three' ]

    isEqual result, expected

    isEqual result, _.groupBy(data, 'length')

<!-- -->

    data = [1..10]
    type = (x) -> if x % 2 is 0 then "even" else "odd"

    result = nest()
      .key(type)
      .rollup((values) -> values.length)
      .map(data)

    isEqual result, { odd: 5, even: 5 }

    isEqual result, _.countBy(data, type)

<!-- -->

Returning to the earlier example, let's group our entries by color and then by quantity ... and also have `nest` return an associative-array instead of an array of key-value pairs:

    data = [
      type: "apple"
      color: "green"
      quantity: 1000
     , 
      type: "apple"
      color: "red"
      quantity: 2000
     , 
      type: "grape"
      color: "green"
      quantity: 1000
     ,
      type: "grape"
      color: "red"
      quantity: 4000
    ]

    result = nest()
      .key((d) -> d.color)    # group entries by color
      .key((d) -> d.quantity) # group entries by quantity
      .map(data)

    expected =
      green:
        "1000": [ 
          { type: 'apple', color: 'green', quantity: 1000 },
          { type: 'grape', color: 'green', quantity: 1000 } 
        ]
      red:
        "2000": [ {type: 'apple', color: 'red', quantity: 2000} ]
        "4000": [ {type: 'grape', color: 'red', quantity: 4000} ]

    isEqual result, expected

With a little work we can handle this with `groupBy` too:

    groupBy = (data, keys) ->
      return data if not keys.length
      [first, rest] = [ keys[0], keys.slice(1) ]
      byFirst = _.groupBy data, first
      for key of byFirst
        byFirst[key] = groupBy byFirst[key], rest
      byFirst

    isEqual result, groupBy(data, ['color', 'quantity'])


## More rollups

Inspired by [this question](http://stackoverflow.com/questions/13379912/javascript-summing-arrays-using-d3-nest), suppose the values we wish to rollup are arrays, such as an array of daily items picked. Let's say that for our rollup, then, we want to sum the *corresponding* values in the array of daily picks for each entry in our final grouping of entries (say, by color). That is, we want an array of daily pick totals for our particular grouping.

    harvest = [
      { type: "apple", color: "green", picked: [1, 2, 3, 4, 5] }, 
      { type: "apple", color: "red", picked: [5, 6, 7, 8] }, 
      { type: "grape", color: "green", picked: [9, 10, 11, 12] }, 
      { type: "grape", color: "red", picked: [13, 14, 15, 16] }
    ]

    sumDailyPicks = (data) ->
      data.reduce (prev, x) ->
        prev.picked.map (d, i) -> d + (x.picked[i] or 0)

    result = nest()
      .key((d) -> d.color)
      .rollup(sumDailyPicks)
      .entries(harvest)

    expected = [
      { key: "green", values: [ 10, 12, 14, 16, 5 ] },
      { key: "red", values: [ 18, 20, 22, 24 ] }
    ]

    isEqual result, expected
