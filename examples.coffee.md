# Examples


    nest = require '../nest'
    assert = require 'assert'
    isEqual = assert.deepEqual

[This clever block](http://bl.ocks.org/mbostock/4062085) uses nest to reshape a table of birthrate data, grouping \[male, female\] totals under year and birthyear:

    data = [ 
      { age: 90, sex: 1, people: 8649, year: 1870 },
      { age: 90, sex: 2, people: 13068, year: 1870 } 
    ]

    expected = { '1870': { '1780': [ [ 8649, 13068 ] ] } }

    result = nest()
      .key((d) -> d.year)           # group by year
      .key((d) -> d.year - d.age)   # group by birthyear
      .rollup((d) -> d)
      .rollup((items) -> [i.people for i in items])
      .map(data)

    isEqual result, expected

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

