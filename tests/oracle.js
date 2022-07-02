/* Imports ----------------------------------------------------------------- */

const Completium = require('@completium/completium-cli');
const Micheline  = require('./micheline')

/* OracleData -------------------------------------------------------------- */

exports.make_asset_value_oracleData = (asset_value_oracle) => {
  return  {
    "prim": "Pair",
    "args": [
      {
        "string": `${asset_value_oracle.start}`
      },
      {
        "prim": "Pair",
        "args": [
          {
            "string": `${asset_value_oracle.end}`
          },
          {
            "prim": "Pair",
            "args": [
              {
                "int": `${asset_value_oracle.open}`
              },
              {
                "prim": "Pair",
                "args": [
                  {
                    "int": `${asset_value_oracle.high}`
                  },
                  {
                    "prim": "Pair",
                    "args": [
                      {
                        "int": `${asset_value_oracle.low}`
                      },
                      {
                        "prim": "Pair",
                        "args": [
                          {
                            "int": `${asset_value_oracle.close}`
                          },
                          {
                            "int": `${asset_value_oracle.volume}`
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

exports.asset_value_oracleData_type = {
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

exports.make_update_upm_key = a => Micheline.make_string(a)
exports.make_update_upm_value = (a, b) => Micheline.make_pair(Micheline.make_string(a), Micheline.make_asset_value_oracleData(b))

const cmp = (a,b) => {
  if (a.key.string === b.key.string) {
    return 0;
  }
  return a.key.string < b.key.string ? -1 : 1;
};

exports.make_update_upm = l => {
  return Micheline.make_map(l.map(x => {
    return {
      key   : Micheline.make_string(x.key),
      value : Micheline.make_pair(Micheline.make_string(x.value[0]), this.make_asset_value_oracleData(x.value[1]))
    }
  }), cmp)
}

/* Contract ---------------------------------------------------------------- */

const contract = new Object()

exports.set_contract = c => {
  contract.obj = c
}

exports.update = async (a, p) => {
  await contract.obj.update({
    argJsonMichelson: this.make_update_upm(a),
    as: p.as,
    amount: p.amount
  });
}

exports.revoke = async (a, p) => {
  await contract.obj.revoke({
    argJsonMichelson: Micheline.make_string(a),
    as: p.as,
    amount: p.amount
  });
}

exports.get_oracleData = async key => {
  const storage = await contract.obj.getStorage()
  const data = await Completium.getValueFromBigMap(
    parseInt(storage.oracleData),
    Micheline.make_string(key),
    Micheline.string_type)
  if (data != undefined) {
    return {
        start  : data.args[0].string,
        end    : data.args[1].string,
        open   : parseInt(data.args[2].int, 10),
        high   : parseInt(data.args[3].int, 10),
        low    : parseInt(data.args[4].int, 10),
        close  : parseInt(data.args[5].int, 10),
        volume : parseInt(data.args[6].int, 10)
    }
  } else {
    return undefined
  }
}

exports.states = {
  Running : 0,
  Revoked : 1
}

exports.get_state = async () => {
  const storage = await contract.obj.getStorage()
  const state = storage._state
  if (state.toNumber() == 0) {
    return this.states.Running
  } else {
    return this.states.Revoked
  }
}

/* Errors ------------------------------------------------------------------ */

exports.errors = {
  INVALID_SIG : "bad sig",
  REVOKED     : "revoked"
}
