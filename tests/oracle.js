/* Imports ---------------------------------------------------------- */

const {
  getValueFromBigMap,
  packTyped,
  sign
} = require('@completium/completium-cli');
const Micheline = require('./micheline')

/* ORACLE objects ---------------------------------------------------------- */

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

const oracle = new Object()

oracle.update = async (a, p) => {
  await oracle.contract.update({
    argJsonMichelson: this.make_update_upm(a),
    as: p.as,
    amount: p.amount
  });
}

oracle.revoke = async (a, p) => {
  await oracle.contract.revoke({
    argJsonMichelson: Micheline.make_string(a),
    as: p.as,
    amount: p.amount
  });
}

oracle.get_oracleData = async key => {
  const storage = await oracle.contract.getStorage()
  const data = await getValueFromBigMap(
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

oracle.get_state = async () => {
  const storage = await oracle.contract.getStorage()
  const state = storage._state
  if (state.toNumber() == 0) {
    return this.states.Running
  } else {
    return this.states.Revoked
  }
}

exports.oracle = oracle

/* Utils ------------------------------------------------------------------- */

exports.sign_oracle_data = async (key, data, account) => {
  const value = Micheline.make_pair(Micheline.make_string(key), this.make_asset_value_oracleData(data))
  const type  = Micheline.make_pair_type(Micheline.string_type, this.asset_value_oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}

exports.sign_oracle_revoke = async (account) => {
  const value = Micheline.none;
  const type  = Micheline.make_option_type(this.key_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}

/* Errors ------------------------------------------------------------------ */

exports.errors = {
  INVALID_SIG : "bad sig",
  REVOKED     : "revoked"
}
