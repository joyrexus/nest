(function() {

  function _class(ctor, properties) {
    try {
      for (var key in properties) {
        Object.defineProperty(ctor.prototype, key, {
          value: properties[key],
          enumerable: false
        });
      }
    } catch (e) {
      ctor.prototype = properties;
    }
  }

  var Map = function(object) {
    var map = new _Map;
    if (object instanceof _Map) object.forEach(function(key, value) { map.set(key, value); });
    else for (var key in object) map.set(key, object[key]);
    return map;
  };

  function _Map() {}

  _class(_Map, {
    has: function(key) {
      return _map_prefix + key in this;
    },
    get: function(key) {
      return this[_map_prefix + key];
    },
    set: function(key, value) {
      return this[_map_prefix + key] = value;
    },
    remove: function(key) {
      key = _map_prefix + key;
      return key in this && delete this[key];
    },
    keys: function() {
      var keys = [];
      this.forEach(function(key) { keys.push(key); });
      return keys;
    },
    values: function() {
      var values = [];
      this.forEach(function(key, value) { values.push(value); });
      return values;
    },
    entries: function() {
      var entries = [];
      this.forEach(function(key, value) { entries.push({key: key, value: value}); });
      return entries;
    },
    forEach: function(f) {
      for (var key in this) {
        if (key.charCodeAt(0) === _map_prefixCode) {
          f.call(this, key.substring(1), this[key]);
        }
      }
    }
  });

  var _map_prefix = "\0", // prevent collision with built-ins
      _map_prefixCode = _map_prefix.charCodeAt(0);

  var nest = function() {
    var nest = {},
        keys = [],
        sortKeys = [],
        sortValues,
        rollup;

    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup
          ? rollup.call(nest, array) : (sortValues
          ? array.sort(sortValues)
          : array);

      var i = -1,
          n = array.length,
          key = keys[depth++],
          keyValue,
          object,
          setter,
          valuesByKey = new _Map,
          values;

      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [object]);
        }
      }

      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }

      valuesByKey.forEach(setter);
      return object;
    }

    function entries(map, depth) {
      if (depth >= keys.length) return map;

      var array = [],
          sortKey = sortKeys[depth++];

      map.forEach(function(key, keyMap) {
        array.push({key: key, values: entries(keyMap, depth)});
      });

      return sortKey
          ? array.sort(function(a, b) { return sortKey(a.key, b.key); })
          : array;
    }

    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };

    nest.entries = function(array) {
      return entries(map(Map, array, 0), 0);
    };

    nest.key = function(d) {
      keys.push(d);
      return nest;
    };

    // Specifies the order for the most-recently specified key.
    // Note: only applies to entries. Map keys are unordered!
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };

    // Specifies the order for leaf values.
    // Applies to both maps and entries array.
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };

    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };

    return nest;
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = nest;
  } else {
    this.nest = nest;
  }

}).call(this);
