/* Imports ----------------------------------------------------------------- */

import { Account, expect_to_fail, get_account, none_mich, option_to_mich_type, pack, pair_array_to_mich_type, pair_to_mich, pair_to_mich_type, prim_to_mich_type, set_mockup, set_mockup_now, set_quiet, sign, string_to_mich } from '@completium/experiment-ts'

const assert = require('assert')

import {
  oracle,
  oracleData,
  cmp_oracleData,
  states,
  oracleData_to_mich,
  oracleData_type
} from './oracle'

/* Accounts ---------------------------------------------------------------- */

const alice = get_account('alice');
const bob   = get_account('bob');

/* Endpoint ---------------------------------------------------------------- */

set_mockup()

/* Verbose mode ------------------------------------------------------------ */

set_quiet(true);

/* Now --------------------------------------------------------------------- */

set_mockup_now(new Date(Date.now()))

/* Utils ------------------------------------------------------------------- */

export const sign_oracle_data = async (key : string, data : oracleData, signer : Account) => {
  const value = pair_to_mich([string_to_mich(key), oracleData_to_mich(data)])
  const type  = pair_array_to_mich_type([prim_to_mich_type("string"), oracleData_type])
  const packed = pack(value, type)
  return await sign(packed, signer)
}

export const sign_oracle_revoke = async (signer : Account) => {
  const value = none_mich;
  const type  = option_to_mich_type(prim_to_mich_type("key"))
  const packed = pack(value, type)
  return await sign(packed, signer)
}

/* Data -------------------------------------------------------------------- */

export const asset1          = "XTZ-USD"
export const asset2          = "BTC-USD"
const asset_untracked = "XTZ-BTC"
const input1 : oracleData = {
  start  : new Date('1970-01-01T00:00:01Z'),
  end    : new Date('1970-01-01T00:00:02Z'),
  open   : BigInt(3),
  high   : BigInt(4),
  low    : BigInt(5),
  close  : BigInt(6),
  volume : BigInt(7)
}
const input2 : oracleData  = {
  start  : new Date('1970-01-01T00:00:08Z'),
  end    : new Date('1970-01-01T00:00:09Z'),
  open   : BigInt(10),
  high   : BigInt(11),
  low    : BigInt(12),
  close  : BigInt(13),
  volume : BigInt(14)
}
const input_past : oracleData  = {
  start  : new Date('1970-01-01T00:00:08Z'),
  end    : new Date('1970-01-01T00:00:09Z'),
  open   : BigInt(15),
  high   : BigInt(16),
  low    : BigInt(17),
  close  : BigInt(18),
  volume : BigInt(19)
}
const input3 : oracleData = {
  start  : new Date('1970-01-01T00:00:15Z'),
  end    : new Date('1970-01-01T00:00:16Z'),
  open   : BigInt(17),
  high   : BigInt(18),
  low    : BigInt(19),
  close  : BigInt(20),
  volume : BigInt(21)
}
const input4 : oracleData = {
  start  : new Date('1970-01-01T00:00:22Z'),
  end    : new Date('1970-01-01T00:00:23Z'),
  open   : BigInt(24),
  high   : BigInt(25),
  low    : BigInt(26),
  close  : BigInt(27),
  volume : BigInt(28)
}

/* Scenario ---------------------------------------------------------------- */

describe('[Oracle] Contract deployment', async () => {
  it('Deploy Oracle', async () => {
    await oracle.deploy(alice.pubk, { as: alice })
  });
})

describe('[Oracle] Update', async () => {
  it('Update once with valid data', async () => {
    const sig = await sign_oracle_data(asset1, input1, alice)
    await oracle.update([ [ asset1, [ sig, input1 ] ] ], {
      as: alice
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input1)) : assert(false)
  })
  it('Second Update Overwrites First Update', async () => {
    const sig = await sign_oracle_data(asset1, input2, alice)
    await oracle.update([ [ asset1, [ sig, input2 ] ] ], {
      as: alice
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input2)) : assert(false)
  })
  it('Correctly Processes Updates With Data From The Past', async () => {
    const sig = await sign_oracle_data(asset1, input_past, alice)
    await oracle.update([ [ asset1, [ sig, input_past ] ] ], {
      as: alice
    })
    const output = await oracle.get_oracleData(asset1);
    (output != undefined) ? assert(cmp_oracleData(output, input2)) : assert(false)
  })
  it('Untracked Asset does not update oracle', async () => {
    const sig = await sign_oracle_data(asset_untracked, input1, alice)
    await oracle.update([ [ asset_untracked, [ sig, input1 ] ] ], {
      as: alice
    })
    const output = await oracle.get_oracleData(asset_untracked);
    assert(output == undefined)
  })
  it('Update Fails With Bad Signature', async () => {
    const sig = await sign_oracle_data(asset1, input3, bob)
    expect_to_fail(async () => {
      await oracle.update([ [ asset1, [ sig, input3 ] ] ], {
        as: alice
      })
    }, oracle.errors.INVALID_SIG)
  })
  it('Update with stale asset does not fail', async () => {
    const sig1 = await sign_oracle_data(asset1, input3, alice)
    const sig2 = await sign_oracle_data(asset2, input1, alice)
    await oracle.update([ [ asset1, [ sig1, input3 ] ], [ asset2, [ sig2, input1 ] ], ], {
      as: alice
    })
    const output1 = await oracle.get_oracleData(asset1);
    (output1 != undefined) ? assert(cmp_oracleData(output1, input3)) : assert(false)
    const output2 = await oracle.get_oracleData(asset2);
    (output2 != undefined) ? assert(cmp_oracleData(output2, input1)) : assert(false)
    const sig3 = await sign_oracle_data(asset1, input4, alice)
    await oracle.update([ [ asset1, [ sig3, input4 ] ], [ asset2, [ sig2, input1 ] ], ], {
      as: alice
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
    expect_to_fail(async () => {
      await oracle.revoke(sig, { as : alice })
    }, oracle.errors.INVALID_SIG)
  })
  it('Revoke Oracle', async () => {
    const sig = await sign_oracle_revoke(alice)
    await oracle.revoke(sig, { as : alice })
    const state = await oracle.get_state()
    assert(state == states.Revoked)
    const output = await oracle.get_oracleData(asset1);
    assert(output == undefined)
  })
  it('Update Fails when Revoked', async () => {
    const sig = await sign_oracle_data(asset1, input3, alice)
    expect_to_fail(async () => {
      await oracle.update([ [ asset1, [ sig, input3 ] ] ], {
        as: alice
      })
    }, oracle.errors.REVOKED)
  })
})
