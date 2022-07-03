
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

export const map_to_json = (l : Array<any>) => {
  return l.map(x => {
    return elt_to_json(x.key, x.value)
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


