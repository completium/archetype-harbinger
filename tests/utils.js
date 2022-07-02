const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, blake2b, sign, keccak } = require('@completium/completium-cli');

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

// ORACLE objects

exports.make_asset_value_oracleData = (start, end, open, high, low, close, volume) => {
  return  {
    "prim": "Pair",
    "args": [
      {
        "int": `${start}`
      },
      {
        "prim": "Pair",
        "args": [
          {
            "int": `${end}`
          },
          {
            "prim": "Pair",
            "args": [
              {
                "int": `${open}`
              },
              {
                "prim": "Pair",
                "args": [
                  {
                    "int": `${high}`
                  },
                  {
                    "prim": "Pair",
                    "args": [
                      {
                        "int": `${low}`
                      },
                      {
                        "prim": "Pair",
                        "args": [
                          {
                            "int": `${close}`
                          },
                          {
                            "int": `${volume}`
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
exports.make_update_upm_value = (a, b) => this.make_pair(this.make_string(a), b)

exports.sign_update_data = async (key, data, account) => {
  const value = this.make_pair(key, data)
  const type  = this.make_pair_type(this.string_type, this.asset_value_oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}
