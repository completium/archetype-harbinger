/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');

import {
  pair_to_json,
  string_to_json,
  string_type_json,
  map_to_json,
  parameters,
  Entrypoint
 } from './micheline'

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
  return a.start == b.start && a.end == b.end && a.open == b.open && a.high == b.high && a.low == b.low && a.close == b.close && a.volume == b.volume
}

export const oracleData_to_json = (v : oracleData) => {
  return  {
    "prim": "Pair",
    "args": [
      {
        "string": `${v.start}`
      },
      {
        "prim": "Pair",
        "args": [
          {
            "string": `${v.end}`
          },
          {
            "prim": "Pair",
            "args": [
              {
                "int": `${v.open}`
              },
              {
                "prim": "Pair",
                "args": [
                  {
                    "int": `${v.high}`
                  },
                  {
                    "prim": "Pair",
                    "args": [
                      {
                        "int": `${v.low}`
                      },
                      {
                        "prim": "Pair",
                        "args": [
                          {
                            "int": `${v.close}`
                          },
                          {
                            "int": `${v.volume}`
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

export const oracleData_type = {
  "prim": "pair",
  "args": [
    {
      "prim": "timestamp",
      "annots": [
        "%start"
      ]
    },
    {
      "prim": "pair",
      "args": [
        {
          "prim": "timestamp",
          "annots": [
            "%end"
          ]
        },
        {
          "prim": "pair",
          "args": [
            {
              "prim": "nat",
              "annots": [
                "%open"
              ]
            },
            {
              "prim": "pair",
              "args": [
                {
                  "prim": "nat",
                  "annots": [
                    "%high"
                  ]
                },
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "nat",
                      "annots": [
                        "%low"
                      ]
                    },
                    {
                      "prim": "pair",
                      "args": [
                        {
                          "prim": "nat",
                          "annots": [
                            "%close"
                          ]
                        },
                        {
                          "prim": "nat",
                          "annots": [
                            "%volume"
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export interface oracleData_elt {
  key: string,
  value: oracleData
}

export type oracleData_literal = Array<oracleData_elt>

const cmp_oracleData_elt = (a : oracleData_elt,b : oracleData_elt) => {
  if (a.key === b.key) {
    return 0;
  }
  return a.key < b.key ? -1 : 1;
};

export const oracleData_literal_to_json = (l : oracleData_literal) => {
  return map_to_json(l.sort(cmp_oracleData_elt).map(x => {
    return {
      key   : string_to_json(x.key),
      value : oracleData_to_json(x.value)
    }
  }))
}

/* Update ------------------------------------------------------------------ */

export interface upm_value {
  _1 : string,
  _2 : oracleData
}

export interface upm_elt {
  key   : string,
  value : upm_value;
}

export type update_arg = Array<upm_elt>

const cmp_upm_elt = (a : upm_elt,b : upm_elt) => {
  if (a.key === b.key) {
    return 0;
  }
  return a.key < b.key ? -1 : 1;
};

const update_upm_to_json = (l : update_arg) => {
  return map_to_json(l.sort(cmp_upm_elt).map(x => {
    return {
      key   : string_to_json(x.key),
      value : pair_to_json(string_to_json(x.value._1), oracleData_to_json(x.value._2))
    }
  }))
}

/* state ------------------------------------------------------------------- */

export enum states {
  Running = 1,
  Revoked,
}
/* Oracle ------------------------------------------------------------------ */

export class Oracle {
  contract : any
  get_address() : string | undefined {
    if (this.contract != undefined) {
      return this.contract.address
    }
    return undefined
  }
  async deploy(publickey : string,  params : Partial<parameters>, oracleData_lit ?: oracleData_literal) {
    const [oracle_contract, _] = await Completium.deploy(
      './contracts/oracle.arl', {
        parameters: {
          publickey: publickey,
        },
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      }
    )
    this.contract = oracle_contract
  }
  async update (a : update_arg , params : Partial<parameters>) : Promise<any> {
    if (this.contract != undefined) {
      await this.contract.update({
        argJsonMichelson: update_upm_to_json(a),
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      });
    }
  }
  async push(e : Entrypoint, params : Partial<parameters>) : Promise<any> {
    if (this.contract != undefined) {
      await this.contract.push({
        argJsonMichelson: e.to_json(),
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      })
    }
  }
  async revoke(a : string, params : Partial<parameters>) : Promise<any> {
    if (this.contract != undefined) {
      await this.contract.revoke({
        argJsonMichelson: string_to_json(a),
        as: params.as,
        amount: params.amount ? params.amount.toString()+"utz" : undefined
      });
    }
  }
  async get_oracleData(key : string) : Promise<oracleData | undefined> {
    if (this.contract != undefined) {
      const storage = await this.contract.getStorage()
      const data = await Completium.getValueFromBigMap(
        parseInt(storage.oracleData),
        string_to_json(key),
        string_type_json)
      if (data != undefined) {
        return {
            start  : data.args[0].string,
            end    : data.args[1].string,
            open   : BigInt(data.args[2].int),
            high   : BigInt(data.args[3].int),
            low    : BigInt(data.args[4].int),
            close  : BigInt(data.args[5].int),
            volume : BigInt(data.args[6].int)
        }
      } else {
        return undefined
      }
    }
  }
  async get_state() : Promise<states> {
    if(this.contract != undefined) {
      const storage = await this.contract.getStorage()
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
    INVALID_SIG : "bad sig",
    REVOKED     : "revoked"
  }
}

export const oracle = new Oracle()