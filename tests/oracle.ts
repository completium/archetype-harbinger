/* Imports ----------------------------------------------------------------- */

import { bigint_to_mich, call, deploy, elt_to_mich, Entrypoint, get_big_map_value, get_storage, list_to_mich, Micheline, MichelineType, Mint, Mpair, Mstring, pair_array_to_mich_type, pair_to_mich, Parameters, prim_annot_to_mich_type, prim_to_mich_type, string_to_mich } from '@completium/experiment-ts'

/* OracleData -------------------------------------------------------------- */

export interface oracleData {
  start  : string,
  end    : string,
  open   : bigint,
  high   : bigint,
  low    : bigint,
  close  : bigint,
  volume : bigint
}

export const cmp_oracleData = (a : oracleData, b : oracleData) => {
  return (
    a.start  == b.start &&
    a.end    == b.end   &&
    a.open   == b.open  &&
    a.high   == b.high  &&
    a.low    == b.low   &&
    a.close  == b.close &&
    a.volume == b.volume
  )
}

export const oracleData_to_mich = (v : oracleData) : Micheline => {
  return pair_to_mich([
    string_to_mich(v.start),
    string_to_mich(v.end),
    bigint_to_mich(v.open),
    bigint_to_mich(v.high),
    bigint_to_mich(v.low),
    bigint_to_mich(v.close),
    bigint_to_mich(v.volume),
  ])
}

export const oracleData_type : any =
  pair_array_to_mich_type([
    prim_annot_to_mich_type("timestamp", ["%start"]),
    prim_annot_to_mich_type("timestamp", ["%end"]),
    prim_annot_to_mich_type("nat", ["%open"]),
    prim_annot_to_mich_type("nat", ["%high"]),
    prim_annot_to_mich_type("nat", ["%low"]),
    prim_annot_to_mich_type("nat", ["%close"]),
    prim_annot_to_mich_type("nat", ["%volume"]),
  ])

export const oracleData_container_to_mich = (c : Array< [string, oracleData] >) : Micheline => {
  return list_to_mich(c, x => elt_to_mich(string_to_mich(x[0]), oracleData_to_mich(x[1])))
}

const get_oracleData = async (address : string, key : string) : Promise<oracleData | undefined> => {
  const storage = await get_storage(address)
  const data = await get_big_map_value(
    BigInt(storage.oracleData),
    string_to_mich(key),
    prim_to_mich_type("string"))
  if (data != undefined) {
    return {
      start  : ((data as Mpair)["args"][0] as Mstring)["string"],
      end    : ((data as Mpair)["args"][1] as Mstring)["string"],
      open   : BigInt(((data as Mpair)["args"][2] as Mint)["int"]),
      high   : BigInt(((data as Mpair)["args"][3] as Mint)["int"]),
      low    : BigInt(((data as Mpair)["args"][4] as Mint)["int"]),
      close  : BigInt(((data as Mpair)["args"][5] as Mint)["int"]),
      volume : BigInt(((data as Mpair)["args"][6] as Mint)["int"])
    }
  } else {
    return undefined
  }
}

/* Update ------------------------------------------------------------------ */

const sort_upm_key = (a : [ string, [ string, oracleData ] ], b : [ string, [ string, oracleData ] ]) : number => {
  if (a[0] == b[0]) {
    return 0;
  }
  return a[0] < b[0] ? -1 : 1;
}

const update_arg_to_mich = (l : Array< [ string, [ string, oracleData ] ]>) : Micheline => {
  return list_to_mich(l.sort(sort_upm_key), x => elt_to_mich(string_to_mich(x[0]), pair_to_mich([string_to_mich(x[1][0]), oracleData_to_mich(x[1][1])])))
}

/* state ------------------------------------------------------------------- */

export enum states {
  Running = 1,
  Revoked,
}
/* Oracle ------------------------------------------------------------------ */

export class Oracle {
  address : string | undefined
  get_address() : string | undefined {
    return this.address
  }
  async deploy(publickey : string,  params : Partial<Parameters>, oracleData_lit ?: Map<string, oracleData>) {
    const address = await deploy(
      './contracts/oracle.arl', {
        publickey: publickey,
      }, params
    )
    this.address = address
  }
  async update (a : Array< [ string, [ string, oracleData ] ]> , params : Partial<Parameters>) : Promise<any> {
    if (this.address != undefined) {
      await call(this.address, 'update', update_arg_to_mich(a), params)
    }
  }
  async push(e : Entrypoint, params : Partial<Parameters>) : Promise<any> {
    if (this.address != undefined) {
      await call(this.address, 'push', e.to_mich(), params)
    }
  }
  async revoke(a : string, params : Partial<Parameters>) : Promise<any> {
    if (this.address != undefined) {
      await call(this.address, 'revoke', string_to_mich(a), params);
    }
  }
  async get_oracleData(key : string) : Promise<oracleData | undefined> {
    if (this.address != undefined) {
      return await get_oracleData(this.address, key)
    }
    else {
      return undefined
    }
  }
  async get_state() : Promise<states> {
    if(this.address != undefined) {
      const storage = await get_storage(this.address)
      const state = storage._state
      if (state.toNumber() == 0) {
        return states.Running
      } else {
        return states.Revoked
      }
    }
    return states.Running
  }
  errors = {
    INVALID_SIG : string_to_mich("bad sig"),
    REVOKED     : string_to_mich("revoked")
  }
}

export const oracle = new Oracle()
