/* Imports ----------------------------------------------------------------- */

const {
  deploy,
  expectToThrow,
  getAccount,
  setEndpoint,
  setMockupNow,
  setQuiet,
  packTyped,
  sign
} = require('@completium/completium-cli')

import {
  oracle,
  oracleData,
  cmp_oracleData,
  states,
  oracleData_to_json,
  oracleData_type
} from './oracle'

import {
 pair_to_json,
 pair_type_to_json,
 string_to_json,
 string_type_json,
 none_json,
 option_type_to_json,
 key_type_json
} from './micheline'


const assert = require('assert')

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

/* Utils ------------------------------------------------------------------- */

export const sign_oracle_data = async (key : string, data : oracleData, account : any) => {
  const value = pair_to_json(string_to_json(key), oracleData_to_json(data))
  const type  = pair_type_to_json(string_type_json, oracleData_type)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}

export const sign_oracle_revoke = async (account : any) => {
  const value = none_json;
  const type  = option_type_to_json(key_type_json)
  const packed = packTyped(value, type)
  const signed = await sign(packed, { as: account.name })
  return signed.prefixSig
}

/* Data -------------------------------------------------------------------- */

export const asset1          = "XTZ-USD"
export const asset2          = "BTC-USD"
const asset_untracked = "XTZ-BTC"
const input1 : oracleData = {
  start  : '1970-01-01T00:00:01Z',
  end    : '1970-01-01T00:00:02Z',
  open   : BigInt(3),
  high   : BigInt(4),
  low    : BigInt(5),
  close  : BigInt(6),
  volume : BigInt(7)
}
const input2 : oracleData  = {
  start  : '1970-01-01T00:00:08Z',
  end    : '1970-01-01T00:00:09Z',
  open   : BigInt(10),
  high   : BigInt(11),
  low    : BigInt(12),
  close  : BigInt(13),
  volume : BigInt(14)
}
const input_past : oracleData  = {
  start  : '1970-01-01T00:00:08Z',
  end    : '1970-01-01T00:00:09Z',
  open   : BigInt(15),
  high   : BigInt(16),
  low    : BigInt(17),
  close  : BigInt(18),
  volume : BigInt(19)
}
const input3 : oracleData = {
  start  : '1970-01-01T00:00:15Z',
  end    : '1970-01-01T00:00:16Z',
  open   : BigInt(17),
  high   : BigInt(18),
  low    : BigInt(19),
  close  : BigInt(20),
  volume : BigInt(21)
}
const input4 : oracleData = {
  start  : '1970-01-01T00:00:22Z',
  end    : '1970-01-01T00:00:23Z',
  open   : BigInt(24),
  high   : BigInt(25),
  low    : BigInt(26),
  close  : BigInt(27),
  volume : BigInt(28)
}

/* Scenario ---------------------------------------------------------------- */

describe('[Oracle] Contract deployment', async () => {
  it('Deploy Oracle', async () => {
    await oracle.deploy(alice.pubk, { as: alice.pkh })
  });
})

describe('[Oracle] Update', async () => {
  it('Update once with valid data', async () => {
    const sig = await sign_oracle_data(asset1, input1, alice)
    await oracle.update([ { key: asset1, value: { _1 : sig, _2 : input1 } } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input1)) : assert(false)
  })
  it('Second Update Overwrites First Update', async () => {
    const sig = await sign_oracle_data(asset1, input2, alice)
    await oracle.update([ { key: asset1, value: { _1: sig, _2: input2 } } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input2)) : assert(false)
  })
  it('Correctly Processes Updates With Data From The Past', async () => {
    const sig = await sign_oracle_data(asset1, input_past, alice)
    await oracle.update([ { key: asset1, value: { _1: sig, _2: input_past } } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input2)) : assert(false)
  })
  it('Untracked Asset does not update oracle', async () => {
    const sig = await sign_oracle_data(asset_untracked, input1, alice)
    await oracle.update([ { key: asset_untracked, value: { _1: sig, _2: input1 } } ], {
      as: alice.pkh
    })
    const output = await oracle.get_oracleData(asset_untracked);
    assert(output == undefined)
  })
  it('Update Fails With Bad Signature', async () => {
    const sig = await sign_oracle_data(asset1, input3, bob)
    expectToThrow(async () => {
      await oracle.update([ { key: asset1, value: { _1: sig, _2: input3 } } ], {
        as: alice.pkh
      })
    }, oracle.errors.INVALID_SIG)
  })
  it('Update with stale asset does not fail', async () => {
    const sig1 = await sign_oracle_data(asset1, input3, alice)
    const sig2 = await sign_oracle_data(asset2, input1, alice)
    await oracle.update([
      { key: asset1, value: { _1: sig1, _2: input3 } },
      { key: asset2, value: { _1: sig2, _2: input1 } },
    ], {
      as: alice.pkh
    })
    const output1 = await oracle.get_oracleData(asset1);
    (output1 != undefined) ? assert(cmp_oracleData(output1, input3)) : assert(false)
    const output2 = await oracle.get_oracleData(asset2);
    (output2 != undefined) ? assert(cmp_oracleData(output2, input1)) : assert(false)
    const sig3 = await sign_oracle_data(asset1, input4, alice)
    await oracle.update([
      { key: asset1, value: { _1: sig3, _2: input4 } },
      { key: asset2, value: { _1: sig2, _2: input1 } },
    ], {
      as: alice.pkh
    })
    const output3 = await oracle.get_oracleData(asset1);
    (output3 != undefined) ? assert(cmp_oracleData(output3, input4)) : assert(false)
    const output4 = await oracle.get_oracleData(asset2);
    (output4 != undefined) ? assert(cmp_oracleData(output4, input1)) : assert(false)
  })
})

describe('[Oracle] Revoke', async () => {
  it('Incorrect Revoke Fails to Revoke An Oracle', async () => {
    const sig = await sign_oracle_revoke(bob)
    expectToThrow(async () => {
      await oracle.revoke(sig, { as : alice.pkh })
    }, oracle.errors.INVALID_SIG)
  })
  it('Revoke Oracle', async () => {
    const sig = await sign_oracle_revoke(alice)
    await oracle.revoke(sig, { as : alice.pkh })
    const state = await oracle.get_state()
    assert(state == states.Revoked)
    const output = await oracle.get_oracleData(asset1);
    assert(output == undefined)
  })
  it('Update Fails when Revoked', async () => {
    const sig = await sign_oracle_data(asset1, input3, alice)
    expectToThrow(async () => {
      await oracle.update([ { key: asset1, value: { _1: sig, _2: input3 } } ], {
        as: alice.pkh
      })
    }, oracle.errors.REVOKED)
  })
})
