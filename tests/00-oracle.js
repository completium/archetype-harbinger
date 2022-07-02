/* Imports ----------------------------------------------------------------- */

const {
  deploy,
  expectToThrow,
  getAccount,
  setEndpoint,
  setMockupNow,
  setQuiet,
} = require('@completium/completium-cli');
const oracle = require('./oracle');
const {
  sign_oracle_data,
  sign_oracle_revoke,
} = require('./utils')
const assert = require('assert');

/* Accounts ---------------------------------------------------------------- */

const alice = getAccount('alice');
const bob   = getAccount('bob');

/* Endpoint ---------------------------------------------------------------- */

setEndpoint('mockup');

/* Verbose mode ------------------------------------------------------------ */

setQuiet(true);

/* Now --------------------------------------------------------------------- */

const now = Math.floor(Date.now() / 1000)
setMockupNow(now)

/* Data -------------------------------------------------------------------- */

const asset1          = "XTZ-USD"
const asset2          = "BTC-USD"
const asset_untracked = "XTZ-BTC"
const input1  = {
  start  : '1970-01-01T00:00:01Z',
  end    : '1970-01-01T00:00:02Z',
  open   : 3,
  high   : 4,
  low    : 5,
  close  : 6,
  volume : 7
}
const input2  = {
  start  : '1970-01-01T00:00:08Z',
  end    : '1970-01-01T00:00:09Z',
  open   : 10,
  high   : 11,
  low    : 12,
  close  : 13,
  volume : 14
}
const input_past  = {
  start  : '1970-01-01T00:00:08Z',
  end    : '1970-01-01T00:00:09Z',
  open   : 15,
  high   : 16,
  low    : 17,
  close  : 18,
  volume : 19
}
const input3 = {
  start  : '1970-01-01T00:00:15Z',
  end    : '1970-01-01T00:00:16Z',
  open   : 17,
  high   : 18,
  low    : 19,
  close  : 20,
  volume : 21
}
const input4 = {
  start  : '1970-01-01T00:00:22Z',
  end    : '1970-01-01T00:00:23Z',
  open   : 24,
  high   : 25,
  low    : 26,
  close  : 27,
  volume : 28
}

/* Scenario ---------------------------------------------------------------- */

describe('[Oracle] Contract deployment', async () => {
  it('Deploy Oracle', async () => {
    const [oracle_contract, _] = await deploy(
      './contracts/oracle.arl', {
        parameters: {
          publickey: alice.pubk,
        },
        as: alice.pkh,
      }
    )
    oracle.set_contract(oracle_contract)
  });
})

describe('[Oracle] Update', async () => {
  it('Update once with valid data', async () => {
    const sig = await sign_oracle_data(asset1, input1, alice)
    await oracle.update([ { key: asset1, value: [ sig, input1 ] } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    assert(JSON.stringify(output, 0, 2) == JSON.stringify(input1, 0, 2))
  })
  it('Second Update Overwrites First Update', async () => {
    const sig = await sign_oracle_data(asset1, input2, alice)
    await oracle.update([ { key: asset1, value: [ sig, input2 ] } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    assert(JSON.stringify(output, 0, 2) == JSON.stringify(input2, 0, 2))
  })
  it('Correctly Processes Updates With Data From The Past', async () => {
    const sig = await sign_oracle_data(asset1, input_past, alice)
    await oracle.update([ { key: asset1, value: [ sig, input_past ] } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    assert(JSON.stringify(output, 0, 2) == JSON.stringify(input2, 0, 2))
  })
  it('Untracked Asset does not update oracle', async () => {
    const sig = await sign_oracle_data(asset_untracked, input1, alice)
    await oracle.update([ { key: asset_untracked, value: [ sig, input1 ] } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset_untracked);
    assert(output == undefined)
  })
  it('Update Fails With Bad Signature', async () => {
    const sig = await sign_oracle_data(asset1, input3, bob)
    expectToThrow(async () => {
      await oracle.update([ { key: asset1, value: [ sig, input3 ] } ], {
        as: alice.pkh
      })
    }, oracle.errors.INVALID_SIG)
  })
  it('Update with stale asset does not fail', async () => {
    const sig1 = await sign_oracle_data(asset1, input3, alice)
    const sig2 = await sign_oracle_data(asset2, input1, alice)
    await oracle.update([
      { key: asset1, value: [ sig1, input3 ] },
      { key: asset2, value: [ sig2, input1 ] },
    ], {
      as: alice.pkh
    })
    const output1 = await oracle.get_oracleData(asset1);
    assert(JSON.stringify(output1, 0, 2) == JSON.stringify(input3, 0, 2))
    const output2 = await oracle.get_oracleData(asset2);
    assert(JSON.stringify(output2, 0, 2) == JSON.stringify(input1, 0, 2))
    const sig3 = await sign_oracle_data(asset1, input4, alice)
    await oracle.update([
      { key: asset1, value: [ sig3, input4 ] },
      { key: asset2, value: [ sig2, input1 ] },
    ], {
      as: alice.pkh
    })
    const output3 = await oracle.get_oracleData(asset1);
    assert(JSON.stringify(output3, 0, 2) == JSON.stringify(input4, 0, 2))
    const output4 = await oracle.get_oracleData(asset2);
    assert(JSON.stringify(output4, 0, 2) == JSON.stringify(input1, 0, 2))
  })
})

describe('[Oracle] Revoke', async () => {
  it('Incorrect Revoke Fails to Revoke An Oracle', async () => {
    const sig = await sign_oracle_revoke(bob)
    expectToThrow(async () => {
      await oracle.revoke(sig, {
        as : alice.pkh
      })
    }, oracle.errors.INVALID_SIG)
  })
  it('Revoke Oracle', async () => {
    const sig = await sign_oracle_revoke(alice)
    await oracle.revoke(sig, {
      as : alice.pkh
    })
    const state = await oracle.get_state()
    assert(state == oracle.states.Revoked)
    const output = await oracle.get_oracleData(asset1);
    assert(output == undefined)
  })
  it('Update Fails when Revoked', async () => {
    const sig = await sign_oracle_data(asset1, input3, alice)
    expectToThrow(async () => {
      await oracle.update([ { key: asset1, value: [ sig, input3 ] } ], {
        as: alice.pkh
      })
    }, oracle.errors.REVOKED)
  })
})
