Yes, you can use [D3](http://http://d3js.org)'s [Nest](https://github.com/mbostock/d3/wiki/Arrays#-nest) in your node apps, *sans* D3.

See [demo](demo.coffee.md) for sample usage, [examples](examples.coffee.md) for
additional examples, and [docs](docs.coffee.md) for details on all nest methods. Note that all three files are [literate coffeescript](http://coffeescript.org/#literate) files and can be run as is.

For [smash](https://github.com/mbostock/smash/wiki)-style extraction-and-bundling of D3's nest operator, see [this block](http://bl.ocks.org/joyrexus/7393907).


## To do

* Add [package.json](http://package.json.nodejitsu.com/)

* Package as a [component](https://github.com/component/component/wiki/F.A.Q)
  using the [set](https://github.com/component/set) component as a model.

* Integrate [tests](https://github.com/mbostock/d3/blob/master/test/arrays/nest-test.js) and [examples](http://bl.ocks.org/phoebebright/raw/3176159/).
