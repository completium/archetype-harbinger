const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, blake2b, sign, keccak } = require('@completium/completium-cli');

exports.make_update_data = (start, end, open, high, low, close, volume) => {
  return  `Pair "${start}" (Pair "${end}" (Pair ${open} (Pair ${high} (Pair ${low} (Pair ${close} ${volume})))))`
}

const update_data_type = "pair (timestamp %start) (pair (timestamp %end) (pair (nat %open) (pair (nat %high) (pair (nat %low) (pair (nat %close) (nat %volume))))))"

exports.sign_update_data = async (key, data, account) => {
  const value = exprMichelineToJson(`(Pair "${key}" (${data}))`)
  const type  = exprMichelineToJson(`(pair string (${update_data_type}))`)
  const packed = packTyped(value, type)
  console.log(packed)
  const signed = await sign(packed, { as: account.name })
  return signed.sig
}
