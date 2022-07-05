/* Imports ----------------------------------------------------------------- */

import {
  Mint,
  Mstring,
  Mpair,
  Parameters,
  Micheline,
  deploy,
  call,
  get_storage,
  string_to_mich,
  get_big_map_value,
  prim_to_mich_type,
  Marray
} from './experiment'

import { oracleData, oracleData_container_to_mich } from './oracle';

/* assetMap ---------------------------------------------------------------- */

export interface queue {
    first : bigint;
    last  : bigint;
    sum   : bigint;
    saved : Array<[ bigint, bigint ]>
}

export interface assetMap {
  computedPrice  : bigint
  lastUpdateTime : string
  prices         : queue
  volumes        : queue
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
    assetMap      ?: Map<string, oracleData>) {
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
  async update(a : Array< [ string, oracleData ] >, params : Partial<Parameters>) {
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
        //console.log(JSON.stringify(data,null,2))
        return {
          computedPrice : BigInt(((data as Mpair)["args"][0] as Mint)["int"]),
          lastUpdateTime : ((data as Mpair)["args"][1] as Mstring)["string"],
          prices : {
            first : BigInt((((data as Mpair)["args"][2] as Mpair)["args"][0] as Mint)["int"]),
            last  : BigInt((((data as Mpair)["args"][2] as Mpair)["args"][1] as Mint)["int"]),
            sum   : BigInt((((data as Mpair)["args"][2] as Mpair)["args"][2] as Mint)["int"]),
            saved : (((data as Mpair)["args"][2] as Mpair)["args"][3] as Marray).map((x : Micheline) => {
              return [
                BigInt(((x as Mpair)["args"][0] as Mint)["int"]),
                BigInt(((x as Mpair)["args"][1] as Mint)["int"])
              ]
            })
          },
          volumes : {
            first : BigInt(((data as Mpair)["args"][3] as Mint)["int"]),
            last  : BigInt(((data as Mpair)["args"][4] as Mint)["int"]),
            sum   : BigInt(((data as Mpair)["args"][5] as Mint)["int"]),
            saved : ((data as Mpair)["args"][6] as Marray).map((x : any) => {
              return [
                BigInt(((x as Mpair)["args"][0] as Mint)["int"]),
                BigInt(((x as Mpair)["args"][1] as Mint)["int"])
              ]
            })
          }
        }
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