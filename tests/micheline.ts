
export interface parameters {
  as     : string,
  amount : bigint
}

export const string_type_json = {
  prim: "string"
}

export const key_type_json = {
  prim: "key"
}

export const none_json = {
  "prim": "None"
}

export const string_to_json = (v : string) => {
  return { "string" : v }
}

export const bool_to_json = (v : boolean) => {
  return { "string" : v ? "True" : "False" }
}

export const bigint_to_json = (v : bigint) => {
  return { "int" : v.toString() }
}

export const make_prim = (p : string, a : Array<any>) => {
  return {
    prim: p,
    args: a
  }
}

export const elt_to_json       = (a : any, b : any) => make_prim("Elt",  [ a, b ])
export const pair_to_json      = (a : any, b : any) => make_prim("Pair", [ a, b ])
export const pair_type_to_json = (a : any, b : any) => make_prim("pair", [ a, b ])
export const option_type_to_json = (a : any)        => make_prim("option", [ a ] )
export const some_to_json      = (a : any)          => make_prim("Some", [ a ])

export const option_to_json = <T>(v : T | undefined, to_json : { (a : T) : any }) => {
  if (v != undefined) {
    return some_to_json(to_json(v))
  } else {
    return none_json
  }
}

export const list_to_json = <T>(l : Array<T>, to_json : { (a : T) : any }) => {
  l.map(x => to_json(x))
}

export const set_to_json = <T>(s : Set<T>, to_json : { (a : T) : any }) => {
  Array.from(s.values()).map(x => to_json(x))
}

export const string_cmp = (a : string, b : string) => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

export const map_to_json = <K, V>(
  m : Map<K, V>,
  key_to_json : { (a : K) : any },
  value_to_json : { (a : V) : any },
  sort_keys : { (a : K, b : K) : number }) => {
  return Array.from(m.keys()).sort(sort_keys).map(k => {
    const v = m.get(k)
    if (v != undefined) {
      return elt_to_json(key_to_json(k), value_to_json(v))
    } else {
      return undefined
    }
  })
}

export class Entrypoint {
  addr : string
  name : string
  constructor(a : string, n : string) {
    this.addr = a
    this.name =n
  }
  to_json() {
    return string_to_json(this.addr+"%"+this.name)
  }
}


