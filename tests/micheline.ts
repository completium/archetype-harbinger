export const string_type = {
  prim: "string"
}

export const key_type = {
  prim: "key"
}

export const none = {
  "prim": "None"
}

export const make_string = (v : string) => {
  return { "string" : v }
}

export const make_prim = (p : string, a : Array<any>) => {
  return {
    prim: p,
    args: a
  }
}

export const make_elt       = (a : any, b : any) => make_prim("Elt",  [ a, b ])
export const make_pair      = (a : any, b : any) => make_prim("Pair", [ a, b ])
export const make_pair_type = (a : any, b : any) => make_prim("pair", [ a, b ])
export const make_option_type = (a : any)        => make_prim("option", [ a ] )

exports.make_map = (l : Array<any>) => {
  return l.map(x => {
    return make_elt(x.key, x.value)
  })
}
