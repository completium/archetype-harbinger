/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');

import {
  parameters,
  string_to_json,
  string_type_json
 } from './micheline'

 import {
  oracleData_literal,
  oracleData_literal_to_json,
 } from './oracle'

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
    assetMap      ?: oracleData_literal) {
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
  async update(a : oracleData_literal, params : Partial<parameters>) {
    if (this.contract != undefined) {
      await this.contract.update({
        argJsonMichelson: oracleData_literal_to_json(a),
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      });
    }
  }
  async get_assetMap(key : string) : Promise<assetMap | undefined> {
    if (this.contract != undefined) {
      const storage = await this.contract.getStorage()
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
    INVALID_SUM    :  "invalid sum"
  }
}

export const normalizer = new Normalizer()
/*
const r =
{
  "prim": "Pair",
  "args": [
    {
      "int": "3" // normalized price
    },
    {
      "string": "1970-01-01T00:00:01Z" // lastUpdateTime
    },
    { // queue
      "prim": "Pair",
      "args": [
        {
          "int": "0"
        },
        {
          "int": "0"
        },
        {
          "int": "15"
        },
        [
          {
            "prim": "Elt",
            "args": [
              {
                "int": "-1"
              },
              {
                "int": "15"
              }
            ]
          },
          {
            "prim": "Elt",
            "args": [
              {
                "int": "0"
              },
              {
                "int": "0"
              }
            ]
          }
        ]
      ]
    },
    { // queue
      "int": "0"
    },
    {
      "int": "0"
    },
    {
      "int": "5"
    },
    [ // saved
      {
        "prim": "Elt",
        "args": [
          {
            "int": "-1"
          },
          {
            "int": "5"
          }
        ]
      },
      {
        "prim": "Elt",
        "args": [
          {
            "int": "0"
          },
          {
            "int": "0"
          }
        ]
      }
    ]
  ]
}

*/