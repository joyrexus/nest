Yes, you can use [D3](http://http://d3js.org)'s [Nest](https://github.com/mbostock/d3/wiki/Arrays#-nest) in your node apps, *sans* D3.

See [demo](demo.coffee.md) for sample usage and [docs](docs.coffee.md) for
details. Note that both are [literate coffeescript](http://coffeescript.org/#literate) files and can be run as is.

For [smash](https://github.com/mbostock/smash/wiki)-style extraction-and-bundling of D3's nest operator, see [this block](http://bl.ocks.org/joyrexus/7393907).


## To do

* Integrate [examples](http://bl.ocks.org/phoebebright/raw/3176159/).

* Explore overlap and use with crossfilter.
  * [API](https://github.com/square/crossfilter/wiki/API-Reference)
  * [Examples](http://bl.ocks.org/phoebebright/raw/3822981/)
  * [Tutorial](http://eng.wealthfront.com/2012/09/explore-your-multivariate-data-with-crossfilter.html)
  * [Custom filter functions](https://github.com/square/crossfilter/pull/36)
