# Nest

The following is excerpted from the D3 Wiki ([API > Core > Arrays](https://github.com/mbostock/d3/wiki/Arrays#-nest)).

---

The `nest` operator enables easy iteration and generation of hierarchical structures. 

Nesting allows elements in an array to be grouped into a hierarchical tree
structure; think of it like the `GROUP BY` operator in SQL or underscore's
`groupBy` method, except you can have *multiple* levels of grouping, and the resulting output is a tree rather than a flat table. The levels in the tree are specified by key functions. The leaf nodes of the tree can be sorted by value, while the internal nodes can be sorted by key. 

An optional rollup function will collapse the elements in each leaf node using a summary function. The nest operator (the object returned by `nest`) is reusable, and does not retain any references to the data that is nested.

For example, consider the following tabular data structure of Barley yields, from various sites in Minnesota during 1931-2:

    yields = [
      {yield: 27.00, variety: "Manchuria", year: 1931, site: "University Farm"},
      {yield: 48.87, variety: "Manchuria", year: 1931, site: "Waseca"},
      {yield: 27.43, variety: "Manchuria", year: 1931, site: "Morris"},
      {yield: 43.07, variety: "Glabron", year: 1931, site: "University Farm"},
      {yield: 55.20, variety: "Glabron", year: 1931, site: "Waseca"}
      {yield: 37.53, variety: "Manchuria", year: 1932, site: "Morris"},
      {yield: 65.90, variety: "Glabron", year: 1932, site: "Waseca"}
    ]

We can nest these records first by year, and then by variety, as follows:

    nest = require 'nest'
    assert = require 'assert'
    isEqual = assert.deepEqual

    report = nest()
      .key((d) -> d.year)
      .key((d) -> d.variety)
      .entries(yields)

This returns a nested array. Each element of the outer array is a key-values pair, listing the values for each distinct key:

    expected = [
      key: 1931
      values: [
        key: "Manchuria"
        values: [
          yield: 27.00
          variety: "Manchuria"
          year: 1931
          site: "University Farm"
         ,
          yield: 48.87
          variety: "Manchuria"
          year: 1931
          site: "Waseca"
         ,
          yield: 27.43
          variety: "Manchuria"
          year: 1931
          site: "Morris"
        ]
       ,
        key: "Glabron"
        values: [
          yield: 43.07
          variety: "Glabron"
          year: 1931
          site: "University Farm"
         ,
          yield: 55.20
          variety: "Glabron"
          year: 1931
          site: "Waseca"
        ]
      ]
     ,
      key: 1932
      values: [
        key: "Manchuria"
        values: [
          yield: 37.53
          variety: "Manchuria"
          year: 1932
          site: "Morris"
        ]
       ,
        key: "Glabron"
        values: [
          yield: 65.90
          variety: "Glabron"
          year: 1932
          site: "Waseca"
        ]
      ]
    ]

    isEqual report, expected

Note how `nest` supports more than one level of grouping, and can returns nested entries that preserve order.

We can also have `nest` return an associative-array (where each entry
correspondes to a distinct key value returned by the first key function) instead of an array of key-value pairs:

    report = nest()
      .key((d) -> d.year)
      .key((d) -> d.variety)
      .map(yields)

    expected =
      1931:
        Manchuria: [
          yield: 27.00
          variety: "Manchuria"
          year: 1931
          site: "University Farm"
         ,
          yield: 48.87
          variety: "Manchuria"
          year: 1931
          site: "Waseca"
         ,
          yield: 27.43
          variety: "Manchuria"
          year: 1931
          site: "Morris"
        ]
        Glabron: [
          yield: 43.07
          variety: "Glabron"
          year: 1931
          site: "University Farm"
         ,
          yield: 55.20
          variety: "Glabron"
          year: 1931
          site: "Waseca"
        ]
      1932:
        Manchuria: [
          yield: 37.53
          variety: "Manchuria"
          year: 1932
          site: "Morris"
        ]
        Glabron: [
          yield: 65.90
          variety: "Glabron"
          year: 1932
          site: "Waseca"
        ]

    isEqual report, expected


# **nest**()

Creates a new nest operator. The set of keys is initially empty. If the `map`
or `entries` operator is invoked before any key functions are registered, the nest operator simply returns the input array.

# nest.**key**(*function*)

Registers a new key *function*. The key function will be invoked for each element in the input array, and must return a string identifier that is used to assign the element to its group. Most often, the function is implemented as a simple accessor, such as the year and variety accessors in the example above. Each time a key is registered, it is pushed onto the end of an internal keys array, and the resulting map or entries will have an additional hierarchy level. There is not currently a facility to remove or query the registered keys. The most-recently registered key is referred to as the current key in subsequent methods.

# nest.**sortKeys**(*comparator*)

Sorts key values for the current key using the specified *comparator*, such as `d3.descending`. If no comparator is specified for the current key, the order in which keys will be returned is undefined. Note that this only affects the result of the entries operator; the order of keys returned by the map operator is always undefined, regardless of comparator.

# nest.**sortValues**(*comparator*)

Sorts leaf elements using the specified *comparator*, such as `d3.descending`. This is roughly equivalent to sorting the input array before applying the nest operator; however it is typically more efficient as the size of each group is smaller. If no value comparator is specified, elements will be returned in the order they appeared in the input array. This applies to both the map and entries operators.

# nest.**rollup**(*function*)

Specifies a rollup *function* to be applied on each group of leaf elements. The return value of the rollup function will replace the array of leaf values in either the associative array returned by the map operator, or the values attribute of each entry returned by the entries operator.

# nest.**map**(*array*[, *mapType*])

Applies the nest operator to the specified *array*, returning an associative array. Each entry in the returned associative array corresponds to a distinct key value returned by the first key function. The entry value depends on the number of registered key functions: if there is an additional key, the value is another nested associative array; otherwise, the value is the array of elements filtered from the input *array* that have the given key value.

    result = nest()
      .key((d) -> d.year)
      .key((d) -> d.variety)
      .map(yields)

If a *mapType* is specified, the specified function is used to construct a map rather than returning a simple JavaScript object. It is recommended that you use `d3.map` for this purpose. For example:

```
result = nest()
  .key((d) -> d.year)
  .key((d) -> d.variety)
  .map(yields, d3.map)

```

Using `d3.map` rather than an object offers conveniences (e.g., the returned map
has `keys` and `values` functions), and protects against unusual key names that conflict with built-in JavaScript properties, such as "__proto__".

# nest.**entries**(*array*)

Applies the nest operator to the specified *array*, returning an array of
key-values entries. Conceptually, this is similar to applying `d3.entries` to
the associative array returned by `map`, but it applies to every level of the hierarchy rather than just the first (outermost) level. Each entry in the returned array corresponds to a distinct key value returned by the first key function. The entry value depends on the number of registered key functions: if there is an additional key, the value is another nested array of entries; otherwise, the value is the array of elements filtered from the input *array* that have the given key value.
