/* Imports ----------------------------------------------------------------- */

import { bigint_to_mich, call, date_to_mich, deploy, elt_to_mich, Entrypoint, get_big_map_value, get_storage, list_to_mich, mich_to_bigint, mich_to_date, mich_to_pairs, Micheline, MichelineType, Mint, Mpair, Mstring, pair_array_to_mich_type, pair_to_mich, Parameters, prim_annot_to_mich_type, prim_to_mich_type, string_to_mich } from '@completium/experiment-ts'

/* OracleData -------------------------------------------------------------- */

export interface oracleData {
  start  : Date,
  end    : Date,
  open   : bigint,
  high   : bigint,
  low    : bigint,
  close  : bigint,
  volume : bigint
}

export const cmp_oracleData = (a : oracleData, b : oracleData) => {
  return (
    a.start.toISOString()  == b.start.toISOString() &&
    a.end.toISOString()   == b.end.toISOString()   &&
    a.open   == b.open  &&
    a.high   == b.high  &&
    a.low    == b.low   &&
    a.close  == b.close &&
    a.volume == b.volume
  )
}

export const oracleData_to_mich = (v : oracleData) : Micheline => {
  return pair_to_mich([
    date_to_mich(v.start),
    date_to_mich(v.end),
    bigint_to_mich(v.open),
    bigint_to_mich(v.high),
    bigint_to_mich(v.low),
    bigint_to_mich(v.close),
    bigint_to_mich(v.volume),
  ])
}

export const mich_to_oracleData = (v : Micheline) : oracleData => {
  const fields = mich_to_pairs(v)
  return {
    start  : mich_to_date(fields[0]),
    end    : mich_to_date(fields[1]),
    open   : mich_to_bigint(fields[2]),
    high   : mich_to_bigint(fields[3]),
    low    : mich_to_bigint(fields[4]),
    close  : mich_to_bigint(fields[5]),
    volume : mich_to_bigint(fields[6])
  }
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
    return mich_to_oracleData(data)
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
