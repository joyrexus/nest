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

We can use rollups to aggregate aspects of our groupings.

Recall how above we grouped our data entries by color, resulting in two entries
per color group.  We can use a rollup to do this sort of tallying, e.g., tally
up the number of entries in each resulting group:

    result = nest()
      .key((d) -> d.color)              # group by color
      .rollup((group) -> group.length)  # get number of items in group
      .map(data)

    isEqual result, { green: 2, red: 2 }


Let's define an aggregator function for a [rollup](https://github.com/mbostock/d3/wiki/Arrays#wiki-nest_rollup).  

Here, `sum` takes an array `arr` and an accessor method `acc` and returns the sum of the values returned by the accessor when applied to each item in the array:

    sum = (arr, acc) -> 
      x = 0
      x += (if acc then acc(i) else i) for i in arr
      x

Our `total` method sums up the `quantity` attribute of each entry:

    total = (group) -> sum(group, (i) -> i.quantity)

Get totals by color:

    totals = nest()
      .key((d) -> d.color)    # group by color
      .rollup(total)          # sum entries by quantity
      .map(data)

    isEqual totals, {green: 2000, red: 6000}

Similarly by type:

    totals = nest()
      .key((d) -> d.type)     # group by type
      .rollup(total)          # sum entries by quantity
      .map(data)

    isEqual totals, {apple: 3000, grape: 5000}


Note that rollups don't have to result in a single value.  You're aggregation
function could return an array or object.

For example, suppose we want *both* the number of entries in each group and the
total quantity?  Let's create a new rollup function to handle this:

    summarize = (group) -> 
      entries: group.length
      quantity: sum(group, (x) -> x.quantity)

    summary = nest()
      .key((d) -> d.type)     # group by type
      .rollup(summarize)
      .map(data)

    expected = 
      apple:
        entries: 2
        quantity: 3000
      grape:
        entries: 2
        quantity: 5000

    isEqual summary, expected


## Comparison with `groupBy` and `countBy`

The following demonstrates `nest` equivalents for underscore's (or lodash's) [groupBy](http://underscorejs.org/#groupBy) and [countBy](http://underscorejs.org/#countBy)

Note that `nest` supports more than one level of grouping and can also return nested entries that preserve order.

    _ = require 'lodash'
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

With a little help from lodash's [groupBy](http://lodash.com/docs#groupBy) and [mapValues](http://lodash.com/docs#mapValues) we can handle this too:

    nest = (seq, keys) ->
      return seq unless keys.length
      [first, rest...] = keys
      _.mapValues _.groupBy(seq, first), (value) -> nest(value, rest) 

    isEqual result, nest(data, ['color', 'quantity'])

See [this gist](https://gist.github.com/joyrexus/9834587) for more info on this alternative approach to nesting (i.e., multi-level grouping).

