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
  make_update_data,
  sign_update_data
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
    const data  = make_update_data(1, 2, 3, 4, 5, 6, 7)
    const sig   = sign_update_data(asset, data, alice)
    await oracle.update({
      argMichelson: `{ Elt "${asset}" (Pair "${sig}" "${data}") }`,
      as: alice.pkh,
    });
  })
})

