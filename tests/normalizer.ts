/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');

import {
  parameters,
  string_to_json,
  string_type_json
 } from './micheline'
import { oracleData, oracleData_container_to_json } from './oracle';

/* assetMap ---------------------------------------------------------------- */

export interface saved_elt {
  key   : bigint
  value : bigint
}

export interface queue {
    first : bigint;
    last  : bigint;
    sum   : bigint;
    saved : Array<saved_elt>
}

export interface assetMap {
  computedPrice  : bigint
  lastUpdateTime : string
  prices         : queue
  volumes        : queue
}

/* Normalizer ------------------------------------------------------------- */

export class Normalizer {
  contract : any
  get_address() : string | undefined {
    if (this.contract != undefined) {
      return this.contract.address
    }
    return undefined
  }
  async deploy(
    assetCodes     : Array<string>,
    oracleContract : string,
    numDataPoints  : bigint,
    params         : Partial<parameters>,
    assetMap      ?: Map<string, oracleData>) {
    const [normalizer_contract, _] = await Completium.deploy(
      './contracts/normalizer.arl', {
        parameters: {
          assetCodes     : assetCodes,
          oracleContract : oracleContract,
          numDataPoints  : numDataPoints
        },
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      }
    )
    this.contract = normalizer_contract
  }
  async update(a : Array< [ string, oracleData ] >, params : Partial<parameters>) {
    await Completium.call(this.contract.address, {
      entry: 'update',
      argJsonMichelson: oracleData_container_to_json(new Map(a)),
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    });
  }
  async get_assetMap(key : string) : Promise<assetMap | undefined> {
    if (this.contract != undefined) {
      const storage = await Completium.getStorage(this.contract.address)
      const data = await Completium.getValueFromBigMap(
        parseInt(storage.assetMap),
        string_to_json(key),
        string_type_json)
      if (data != undefined) {
        //console.log(JSON.stringify(data,null,2))
        return {
          computedPrice : BigInt(data.args[0].int),
          lastUpdateTime : data.args[1].string,
          prices : {
            first : BigInt(data.args[2].args[0].int),
            last  : BigInt(data.args[2].args[1].int),
            sum   : BigInt(data.args[2].args[2].int),
            saved : data.args[2].args[3].map((x : any) => {
              return {
                elt: BigInt(x.args[0].int),
                value : BigInt(x.args[1].int)
              }
            })
          },
          volumes : {
            first : BigInt(data.args[3].int),
            last  : BigInt(data.args[4].int),
            sum   : BigInt(data.args[5].int),
            saved : data.args[6].map((x : any) => {
              return {
                elt: BigInt(x.args[0].int),
                value : BigInt(x.args[1].int)
              }
            })
          }
        }
      } else {
        return undefined
      }
    }
  }
  errors = {
    INVALID_CALLER : "bad sender",
    BAD_REQUEST    : "bad request",
    INVALID_SUM    : "invalid sum"
  }
}

export const normalizer = new Normalizer()