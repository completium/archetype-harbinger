/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');
const Micheline  = require('./micheline')

/* Params ------------------------------------------------------------------ */

interface parameters {
  as     : string,
  amount : bigint
}

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

export const make_asset_value_oracleData = (v : oracleData) => {
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

export const asset_value_oracleData_type = {
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

/* Update ------------------------------------------------------------------ */

const cmp = (a : upm_pair,b : upm_pair) => {
  if (a.key === b.key) {
    return 0;
  }
  return a.key < b.key ? -1 : 1;
};

const make_update_upm = (l : Array<upm_pair>) => {
  return Micheline.make_map(l.sort(cmp).map(x => {
    return {
      key   : Micheline.make_string(x.key),
      value : Micheline.make_pair(Micheline.make_string(x.value._1), make_asset_value_oracleData(x.value._2))
    }
  }), cmp)
}

export interface upm_value {
  _1 : string,
  _2 : oracleData
}

export interface upm_pair {
  key   : string,
  value : upm_value;
}

/* state ------------------------------------------------------------------- */

export enum states {
  Running = 1,
  Revoked,
}
/* module interface */

export class Oracle {
  contract : any
  async update (a : Array<upm_pair> , p : Partial<parameters>) : Promise<any> {
    if (this.contract != undefined) {
      await this.contract.update({
        argJsonMichelson: make_update_upm(a),
        as: p.as,
        amount: p.amount ? p.amount.toString()+"utz" : undefined
      });
    }
  }
  async revoke(a : string, p : Partial<parameters>) : Promise<any> {
    if (this.contract != undefined) {
      await this.contract.revoke({
        argJsonMichelson: Micheline.make_string(a),
        as: p.as,
        amount: p.amount ? p.amount.toString()+"utz" : undefined
      });
    }
  }
  async get_oracleData(key : string) : Promise<oracleData | undefined> {
    if (this.contract != undefined) {
      const storage = await this.contract.getStorage()
      const data = await Completium.getValueFromBigMap(
        parseInt(storage.oracleData),
        Micheline.make_string(key),
        Micheline.string_type)
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
  set_contract = (c : any) => {
    this.contract = c
  }
  errors = {
    INVALID_SIG : "bad sig",
    REVOKED     : "revoked"
  }
}

export const oracle = new Oracle()