exports.string_type = {
  prim: "string"
}

exports.key_type = {
  prim: "key"
}

exports.none = {
  "prim": "None"
}

exports.make_string = v => {
  return { "string" : v }
}

exports.make_int = v => {
  return { "int": v }
}

exports.make_prim = (p, a) => {
  return {
    prim: p,
    args: a
  }
}

exports.make_elt       = (a, b) => this.make_prim("Elt",  [ a, b ])
exports.make_pair      = (a, b) => this.make_prim("Pair", [ a, b ])
exports.make_pair_type = (a, b) => this.make_prim("pair", [ a, b ])
exports.make_option_type = a    => this.make_prim("option", [ a ] )

exports.make_map = (l, cmp) => {
  return l.sort(cmp).map(x => {
    return this.make_elt(x.key, x.value)
  })
}
