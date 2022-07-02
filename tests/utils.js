const { isMockup, getValueFromBigMap, exprMichelineToJson, packTyped, blake2b, sign, keccak } = require('@completium/completium-cli');

exports.make_update_data = (start, end, open, high, low, close, volume) => {
  //return  `Pair "${start}" (Pair "${end}" Pair (${open} Pair (${high} Pair (${low} Pair (${close} ${volume})))))`
  return  `Pair "${start}" "${end}" ${open} ${high} ${low} ${close} ${volume}`
}

const update_data_type = "pair (timestamp %start) (pair (timestamp % end) pair ((nat %open) pair ((nat %high) pair ((nat %low) pair ((nat %close) (nat %volume))))))"

exports.sign_update_data = (key, data, account) => {
  console.log((`Pair "${key}" (${data})`))
  console.log(JSON.stringify(exprMichelineToJson(`Pair "${key}" (${data})`), 0, 2))
  console.log(Object.keys(exprMichelineToJson(data, 0, 2)).length)
  console.log((`pair string (${update_data_type})`))
  console.log(JSON.stringify(exprMichelineToJson(`pair string (${update_data_type})`),0,2))
  const packed = packTyped(exprMichelineToJson(`Pair "${key}" (${data})`), exprMichelineToJson(`pair string (${update_data_type})`))
  const signed = sign(packed, { as: account })
  return signed.sig
}
