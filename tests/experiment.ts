const Completium = require('@completium/completium-cli');

/* Michleline -------------------------------------------------------------- */

type Mprim   = {
  "prim" : "True" | "False" | "None" | "Unit"
}

type Mstring = {
  "string" : string
}

type Mbytes  = {
  "bytes"  : string
}

type Mint    = {
  "int"    : string
}

type Mpair   = {
  "prim"   : "Pair" | "Elt",
  "args"   : [ Micheline, Micheline ]
}

type Msingle = {
  "prim"   : "Some" | "Right" | "Left",
  "args"   : [ Micheline ]
}

type Marray  = Array<Micheline>

export type Micheline =
| Mprim
| Mstring
| Mbytes
| Mint
| Msingle
| Mpair
| Marray

/* Michleline Type --------------------------------------------------------- */

type MTprim = {
  "prim"   :  "address" | "bls12_381_fr" | "bls12_381_g1" | "bls12_381_g2" | "bool" | "bytes" |
              "chain_id" | "chest" | "chest_key" | "int" | "key" | "key_hash" | "mutez" | "nat" |
              "never" | "operation" | "signature" | "string" | "timestamp" | "unit"
}

type MTsingle = {
  "prim"   : "contract" | "list" | "option" | "set" | "ticket",
  "args"   : [ MichelineType ]
}

type MTint   = {
  "prim"   : "sapling_transaction" | "sapling_state",
  "args"   : [
    { "int" : string }
  ]
}

type MTpair  = {
  "prim"   : "big_map" | "lambda" | "map" | "or" | "pair",
  "args"   : [ MichelineType, MichelineType ]
}

export type MichelineType =
| MTprim
| MTsingle
| MTint
| MTpair

/* Interfaces -------------------------------------------------------------- */

export interface Account {
  name : string,
  pk   : string,
  pkh  : string,
  sk   : string,
}

export interface Parameters {
  as     : Account,
  amount : bigint
}

/* Experiment API ---------------------------------------------------------- */

export const get_account = (name : string) : Account => {
  const a = Completium.getAccount(name)
  return {
    name : a.name,
    pk   : a.pk,
    pkh  : a.pkh,
    sk   : a.sk
  }
}

export const pack = (obj : Micheline, typ ?: MichelineType) => {
  if (typ != undefined) {
    return Completium.packTyped(obj, typ)
  } else {
    return Completium.pack(obj)
  }
}

export const sign = async (v : string, a : Account) : Promise<string> => {
  const signed = await Completium.sign(v, { as: a.name })
  return signed.prefixSig
}

/**
 * Calls a contract entrypoint
 * @param c contract address
 * @param e entry point name
 * @param a entry point argument
 * @param p parameters (as, amount)
 */
export const call = async(c : string, e : string, a : Micheline, p : Parameters) => {
  return await Completium.call(c, {
      entry: e,
      argJsonMichelson: a,
      as: p.as.pkh,
      amount: p.amount ? p.amount.toString()+"utz" : undefined
   })
}

/**
 * Transfers tez
 * @param from account to transfer from
 * @param to   account or address to transfer to
 * @param amount amount to transfer in mutez
 * @returns
 */
export const transfer = async (from : Account, to : Account | string, amount : bigint) => {
  const to_ = typeof to == "string" ? to : to.pkh
  return await Completium.transfer(from.pkh, to_, amount.toString())
}

/* to Micheline ------------------------------------------------------------ */

export const string_to_mich = (v : string) : Micheline => {
  return { "string" : v }
}

export const string_mich_type : MichelineType = {
  prim: "string"
}

export const key_mich_type : MichelineType = {
  prim: "key"
}

export const none_mich : Micheline = {
  "prim": "None"
}

export const bool_to_mich = (v : boolean) : Micheline => {
  return { "string" : v ? "True" : "False" }
}

export const bool_mich_type : MichelineType = {
  prim: "bool"
}

export const bigint_to_mich = (v : bigint) : Micheline => {
  return { "int" : v.toString() }
}

export const elt_to_mich = (a : Micheline, b : Micheline) : Micheline => {
  return {
    prim: "Elt",
    args: [ a, b ]
  }
}

export const pair_to_mich = (a : Micheline, b : Micheline) : Micheline => {
  return {
    prim: "Pair",
    args: [ a, b ]
  }
}

export const pair_type_to_mich = (a : MichelineType, b : MichelineType) : MichelineType => {
  return {
    prim: "pair",
    args: [ a, b ]
  }
}

export const option_type_to_mich = (a : MichelineType) : MichelineType => {
  return {
    prim: "option",
    args: [ a ]
  }
}

export const some_to_mich = (a : Micheline) : Micheline => {
  return {
    prim: "Some",
    args: [ a ]
  }
}

export const option_to_json = <T>(v : T | undefined, to_mich : { (a : T) : Micheline }) : Micheline => {
  if (v != undefined) {
    return some_to_mich(to_mich(v))
  } else {
    return none_mich
  }
}

export const list_to_json = <T>(l : Array<T>, to_mich : { (a : T) : Micheline }) => {
  l.map(x => to_mich(x))
}

export const set_to_json = <T>(s : Set<T>, to_json : { (a : T) : Micheline }) => {
  Array.from(s.values()).map(x => to_json(x))
}

export const string_cmp = (a : string, b : string) => {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
};

export class Entrypoint {
  addr : string
  name : string
  constructor(a : string, n : string) {
    this.addr = a
    this.name =n
  }
  to_mich() {
    return string_to_mich(this.addr+"%"+this.name)
  }
}
