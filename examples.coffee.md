# Examples

Below are additional examples of nest in action.

    nest = require 'nest'
    assert = require 'assert'
    isEqual = assert.deepEqual


## Sorting

We can apply custom sorting to both keys and values.

Let's group our records of people by age in descending order.

    people = [ 
      { name: 'joe', age: 30, sex: 'M' },
      { name: 'bill', age: 24, sex: 'M' },
      { name: 'mary', age: 28, sex: 'F' },
      { name: 'sue', age: 24, sex: 'F' }
    ]

    result = nest()
      .key((d) -> d.age)          # group by age
      .sortKeys((a, b) -> b - a)  # sort descending
      .entries(people)

    expected = [ 
      key: 30
      values: [ { name: 'joe', age: 30, sex: 'M' } ]
     ,
      key: 28
      values: [ { name: 'mary', age: 28, sex: 'F' } ]
     ,
      key: 24
      values: [
        { name: 'bill', age: 24, sex: 'M' },
        { name: 'sue', age: 24, sex: 'F' }
      ]
    ]

    isEqual result, expected

Now let's group by gender with our two gender keys (`F`, `M`) sorted in reverse
alphabetical order:

    order =   # our custom sort order
      M: 1    
      F: 2

    result = nest()
      .key((d) -> d.sex)                        # group by gender
      .sortKeys((a, b) -> order[a] - order[b])  # sort by custom order
      .entries(people)

    expected = [ 
      key: 'M'
      values: [ 
        { name: 'joe', age: 30, sex: 'M' },
        { name: 'bill', age: 24, sex: 'M' }
      ]
     ,
      key: 'F'
      values: [
        { name: 'mary', age: 28, sex: 'F' },
        { name: 'sue', age: 24, sex: 'F' }
      ]
    ]

    isEqual result, expected


## Reshaping

[This clever block](http://bl.ocks.org/mbostock/4062085) uses nest to reshape a
table of birthrate data, grouping \[male, female\] totals by year and birthyear:

    data = [ 
      { age: 90, sex: 'M', people: 8649, year: 1870 },
      { age: 90, sex: 'F', people: 13068, year: 1870 } 
    ]

    result = nest()
      .key((d) -> d.year)                           # group by year
      .key((d) -> d.year - d.age)                   # group by birthyear
      .rollup((group) -> [i.people for i in group]) 
      .map(data)

So, we group by year and birthyear before returning an array of totals for each
item in the resulting group.

    expected = { '1870': { '1780': [ [ 8649, 13068 ] ] } }

    isEqual result, expected

---

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
      .map(harvest)

    expected =
      green: [ 10, 12, 14, 16, 5 ]
      red: [ 18, 20, 22, 24 ] 

    isEqual result, expected

