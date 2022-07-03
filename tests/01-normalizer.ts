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
  asset1,
  sign_oracle_data
} from './00-oracle'

import {
  normalizer
} from './normalizer'

import {
 pair_to_json,
 pair_type_to_json,
 string_to_json,
 string_type_json,
 none_json,
 option_type_to_json,
 key_type_json,
 Entrypoint
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

const computeVWAP = (high : bigint, low : bigint, close : bigint, volume : bigint) : bigint => {
    return ((high + low + close) / BigInt(3)) * volume
}

/* Data -------------------------------------------------------------------- */

let update_entry : Entrypoint

const input0 : oracleData = {
  start  : '2020-07-18T22:35:01Z',
  end    : '2020-07-18T22:35:31Z',
  open   : BigInt(3059701),
  high   : BigInt(1),
  low    : BigInt(2),
  close  : BigInt(3),
  volume : BigInt(4)
}
const input1 : oracleData = {
  start  : '1970-01-01T00:00:01Z',
  end    : '1970-01-01T00:00:02Z',
  open   : BigInt(1),
  high   : BigInt(2),
  low    : BigInt(3),
  close  : BigInt(4),
  volume : BigInt(5)
}
const input2 : oracleData = {
  start  : '1970-01-01T00:00:01Z',
  end    : '1970-01-01T00:00:02Z',
  open   : BigInt(6),
  high   : BigInt(7),
  low    : BigInt(8),
  close  : BigInt(9),
  volume : BigInt(10)
}

/* Scenario ---------------------------------------------------------------- */

describe('[Normalizer] Contracts deployment', async () => {
  it('Deploy Oracle', async () => {
    await oracle.deploy(alice.pubk, { as: alice.pkh })
  });
  it('Deploy Normalizer', async () => {
    const oracle_addr = oracle.get_address()
    if (oracle_addr != undefined) {
      await normalizer.deploy(["XTZ-USD", "BTC-USD"], oracle_addr, BigInt(5),  { as: alice.pkh })
    } else {
      assert(false)
    }
    const normalizer_addr = normalizer.get_address()
    if (normalizer_addr != undefined) {
      update_entry = new Entrypoint(normalizer_addr, "update")
    } else {
      assert(false)
    }
  });
})

describe('[Normalizer] Update', async () => {
  it('Fails when data is pushed from bad address', async () => {
    expectToThrow(async () => {
      await normalizer.update([ { key: "XTZ-USD", value: input0 } ], { as : alice.pkh })
    }, normalizer.errors.INVALID_CALLER)
  })
  it('Correctly processes updates', async () => {
    const sig1 = await sign_oracle_data(asset1, input1, alice)
    await oracle.update([ { key: asset1, value: { _1 : sig1, _2 : input1 } } ], {
      as: alice.pkh
    })
    await oracle.push(update_entry, { as : alice.pkh })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      const expected = computeVWAP(input1.high, input1.low, input1.close, input1.volume) / input1.volume
      assert(assetMap.computedPrice == expected)
    } else {
      assert(false)
    }
  })
  it('Update with same time does not update', async () => {
    const sig = await sign_oracle_data(asset1, input2, alice)
    await oracle.update([ { key: asset1, value: { _1 : sig, _2 : input2 } } ], {
      as: alice.pkh
    })
    await oracle.push(update_entry, { as : alice.pkh })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      const expected = computeVWAP(input1.high, input1.low, input1.close, input1.volume) / input1.volume
      assert(assetMap.computedPrice == expected)
    } else {
      assert(false)
    }
  })
})
