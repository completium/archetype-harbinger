const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, blake2b, sign, keccak, getStorage } = require('@completium/completium-cli');

// LIB ------------------------------------------------------------------------

exports.string_type = {
  prim: "string"
}

exports.make_string = v => {
  return { "string" : v }
}

exports.make_int = v => {
  return { "int": v }
}

exports.make_prim = (p, a) => {
  return {
    prim: p,
    args: a
  }
}

exports.make_elt       = (a, b) => this.make_prim("Elt",  [ a, b ])
exports.make_pair      = (a, b) => this.make_prim("Pair", [ a, b ])
exports.make_pair_type = (a, b) => this.make_prim("pair", [ a, b ])

exports.make_map = l => {
  return l.map( x => {
    return this.make_elt(x.key, x.value)
  })
}

// ORACLE objects -------------------------------------------------------------

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

exports.make_update_upm_key = a => this.make_string(a)
exports.make_update_upm_value = (a, b) => this.make_pair(this.make_string(a), this.make_asset_value_oracleData(b))
exports.make_update_upm = l => {
  return this.make_map(l.map(x => {
    return {
      key   : this.make_string(x.key),
      value : this.make_pair(this.make_string(x.value[0]), this.make_asset_value_oracleData(x.value[1]))
    }
  }))
}

// Utils ----------------------------------------------------------------------

const oracle = new Object()

oracle.update = async (a, p) => {
  await oracle.contract.update({
    argJsonMichelson: this.make_update_upm(a),
    as: p.as,
    amount: p.amount
  });
}

oracle.get_oracleData = async key => {
  const storage = await oracle.contract.getStorage()
  const data = await getValueFromBigMap(
    parseInt(storage.oracleData),
    this.make_string(key),
    this.string_type)
  return {
    start  : data.args[0].string,
    end    : data.args[1].string,
    open   : parseInt(data.args[2].int, 10),
    high   : parseInt(data.args[3].int, 10),
    low    : parseInt(data.args[4].int, 10),
    close  : parseInt(data.args[5].int, 10),
    volume : parseInt(data.args[6].int, 10)
  }
}

exports.oracle = oracle

exports.sign_update_data = async (key, data, account) => {
  const value = this.make_pair(this.make_string(key), this.make_asset_value_oracleData(data))
  const type  = this.make_pair_type(this.string_type, this.asset_value_oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}
