/* Imports ---------------------------------------------------------- */

const {
  packTyped,
  sign
} = require('@completium/completium-cli')

const oracle = require('./oracle')
const Micheline = require('./micheline')


/* Utils ------------------------------------------------------------------- */

exports.sign_oracle_data = async (key, data, account) => {
  const value = Micheline.make_pair(Micheline.make_string(key), oracle.make_asset_value_oracleData(data))
  const type  = Micheline.make_pair_type(Micheline.string_type, oracle.asset_value_oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}

exports.sign_oracle_revoke = async (account) => {
  const value = Micheline.none;
  const type  = Micheline.make_option_type(Micheline.key_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}
