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
  sign_update_data,
  make_update_upm,
  get_asset_value_oracleData
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
    const asset = "XTZ-USD"
    const input  = {
      start  : 1,
      end    : 2,
      open   : 3,
      high   : 4,
      low    : 5,
      close  : 6,
      volume : 7
    }
    const sig   = await sign_update_data(asset, input, alice)
    await oracle.update({
      argJsonMichelson: make_update_upm([ { key: asset, value: [ sig, input ] }]),
      as: alice.pkh,
    });
    const output = await get_asset_value_oracleData(asset);
    assert(JSON.stringify(input,0,2) == JSON.stringify(output,0,2))
  })
})

