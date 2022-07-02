const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, blake2b, sign, keccak } = require('@completium/completium-cli');

const string_type= {
  prim: "string"
}

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

const asset_value_oracleData_type = {
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

exports.asset_value_oracleData_type = asset_value_oracleData_type

const make_string = v => {
  return { "string" : v }
}

exports.make_string = make_string

const make_int = v => {
  return { "int": v }
}

const make_prim = (p, a) => {
  return {
    prim: p,
    args: a
  }
}

const make_elt       = (a, b) => make_prim("Elt",  [ a, b ])
const make_pair      = (a, b) => make_prim("Pair", [ a, b ])
const make_pair_type = (a, b) => make_prim("pair", [ a, b ])

const make_map = l => {
  return l.map( x => {
    return make_elt(x.key, x.value)
  })
}

exports.make_map = make_map

exports.make_pair = make_pair

exports.make_pair_type = make_pair_type

const make_update_upm_key   = a => make_string(a)
const make_update_upm_value = (a, b) => make_pair(make_string(a), b)

exports.make_update_upm_key = make_update_upm_key
exports.make_update_upm_value = make_update_upm_value

exports.sign_update_data = async (key, data, account) => {
  const value = make_pair(key, data)
  const type  = make_pair_type(string_type, asset_value_oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}
