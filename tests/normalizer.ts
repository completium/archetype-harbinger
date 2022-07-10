/* Imports ----------------------------------------------------------------- */

import { call, deploy, get_big_map_value, get_storage, Marray, mich_to_bigint, mich_to_date, mich_to_map, mich_to_pairs, Micheline, Mint, Mpair, Mstring, Parameters, prim_to_mich_type, string_to_mich } from '@completium/experiment-ts'

import { oracleData_container_to_mich, oracleData_value } from './oracle';

/* assetMap ---------------------------------------------------------------- */

export interface queue {
    first : bigint;
    last  : bigint;
    sum   : bigint;
    saved : Array<[ bigint, bigint ]>
}

export interface assetMap {
  computedPrice  : bigint
  lastUpdateTime : Date
  prices         : queue
  volumes        : queue
}

/* Mich to records */

const mich_to_queue = (v : Micheline) : queue => {
  const fields = mich_to_pairs(v)
  return {
    first : mich_to_bigint(fields[0]),
    last  : mich_to_bigint(fields[1]),
    sum   : mich_to_bigint(fields[2]),
    saved : mich_to_map(fields[3], (x, y) => {
      return [ mich_to_bigint(x), mich_to_bigint(y) ]
    })
  }
}

const mich_to_assetMap = (v : Micheline) : assetMap => {
  const fields = mich_to_pairs(v)
  return {
    computedPrice : mich_to_bigint(fields[0]),
    lastUpdateTime : mich_to_date(fields[1]),
    prices : mich_to_queue(fields[2]),
    volumes : mich_to_queue({ prim: "Pair", args: fields.slice(3) })
  }
}

/* Normalizer ------------------------------------------------------------- */

export class Normalizer {
  address : any
  get_address() : string | undefined {
    return this.address
  }
  async deploy(
    assetCodes     : Array<string>,
    oracleContract : string,
    numDataPoints  : bigint,
    params         : Partial<Parameters>,
    assetMap      ?: Map<string, oracleData_value>) {
    const address = await deploy(
      './contracts/normalizer.arl',
      {
        assetCodes     : assetCodes,
        oracleContract : oracleContract,
        numDataPoints  : numDataPoints
      },
      params
    )
    this.address = address
  }
  async update(a : Array< [ string, oracleData_value ] >, params : Partial<Parameters>) {
    if (this.address != undefined) {
      await call(
        this.address,
        'update',
        oracleData_container_to_mich(a),
        params);
    }
  }
  async get_assetMap(key : string) : Promise<assetMap | undefined> {
    if (this.address != undefined) {
      const storage = await get_storage(this.address)
      const data = await get_big_map_value(
        BigInt(storage.assetMap),
        string_to_mich(key),
        prim_to_mich_type("string"))
      if (data != undefined) {
        return mich_to_assetMap(data)
      } else {
        return undefined
      }
    }
  }
  errors = {
    INVALID_CALLER : string_to_mich("bad sender"),
    BAD_REQUEST    : string_to_mich("bad request"),
    INVALID_SUM    : string_to_mich("invalid sum")
  }
}

export const normalizer = new Normalizer()