/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');

import {
  pair_to_json,
  string_to_json,
  string_type_json,
  map_to_json,
  string_cmp,
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

export const oracleData_container_to_json = (c : Map<string, oracleData>) => {
  return map_to_json(c, string_to_json, oracleData_to_json, string_cmp)
}

/* Update ------------------------------------------------------------------ */

const update_arg_to_json = (l : Map< string, [ string, oracleData ]>) => {
  return map_to_json(l, string_to_json, x => pair_to_json(string_to_json(x[0]), oracleData_to_json(x[1])), string_cmp)
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
  async deploy(publickey : string,  params : Partial<parameters>, oracleData_lit ?: Map<string, oracleData>) {
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
  async update (a : Array< [ string, [ string, oracleData ] ]> , params : Partial<parameters>) : Promise<any> {
    await Completium.call(this.contract.address, {
      entry: 'update',
      argJsonMichelson: update_arg_to_json(new Map(a)),
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    })
  }
  async push(e : Entrypoint, params : Partial<parameters>) : Promise<any> {
    await Completium.call(this.contract.address, {
      entry: 'push',
      argJsonMichelson: e.to_json(),
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    })
  }
  async revoke(a : string, params : Partial<parameters>) : Promise<any> {
    await Completium.call(this.contract.address, {
      entry: 'revoke',
      argJsonMichelson: string_to_json(a),
      as: params.as,
      amount: params.amount ? params.amount.toString()+"utz" : undefined
    });
  }
  async get_oracleData(key : string) : Promise<oracleData | undefined> {
    if (this.contract != undefined) {
      const storage = await Completium.getStorage(this.contract.address)
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
      const storage = await Completium.getStorage(this.contract.address)
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