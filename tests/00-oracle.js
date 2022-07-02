const {
  deploy,
  expectToThrow,
  exprMichelineToJson,
  getAccount,
  getValueFromBigMap,
  jsonMichelineToExpr,
  runGetter,
  packTyped,
  setEndpoint,
  setMockupNow,
  setQuiet,
} = require('@completium/completium-cli');
const {
  make_asset_value_oracleData,
  asset_value_oracleData_type,
  sign_update_data,
  make_map,
  make_pair,
  make_string,
  make_update_upm_key,
  make_update_upm_value
} = require('./utils');
const assert = require('assert');

// contract
let oracle;

// accounts
const alice = getAccount('alice');

//set endpointhead
setEndpoint('mockup');

// verbose mode
setQuiet(true);

// now
const now = Math.floor(Date.now() / 1000)
setMockupNow(now)

// scenario

describe('[Oracle] Contract deployment', async () => {
  it('Deploy Oracle', async () => {
    [oracle, _] = await deploy(
      './contracts/oracle.arl', {
        parameters: {
          publickey: alice.pubk,
        },
        as: alice.pkh,
      }
    )
  });
})

describe('[Oracle] Update once with valid data', async () => {
  it('Update Oracle', async () => {
    const asset = make_string("XTZ-USD")
    const data  = make_asset_value_oracleData(1, 2, 3, 4, 5, 6, 7)
    const sig   = await sign_update_data(asset, data, alice)
    const arg   = make_map([ {
      key:   make_update_upm_key(sig),
      value: make_update_upm_value(sig, data)
    }])
    await oracle.update({
      argJsonMichelson: arg,
      as: alice.pkh,
    });
  })
})

