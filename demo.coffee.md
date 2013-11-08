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

