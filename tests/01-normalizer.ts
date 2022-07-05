/* Imports ----------------------------------------------------------------- */

import {
  expect_to_fail,
  get_account,
  set_mockup,
  set_mockup_now,
  set_quiet,
  Entrypoint
} from '@completium/experiment-ts'

import {
  oracle,
  oracleData,
} from './oracle'

import {
  asset1,
  sign_oracle_data
} from './00-oracle'

import {
  normalizer
} from './normalizer'


const assert = require('assert')

/* Accounts ---------------------------------------------------------------- */

const alice = get_account('alice');

/* Endpoint ---------------------------------------------------------------- */

set_mockup()

/* Verbose mode ------------------------------------------------------------ */

set_quiet(true);

/* Now --------------------------------------------------------------------- */

set_mockup_now(new Date(Date.now()))

/* Utils ------------------------------------------------------------------- */

// Should implement real euclidean division
const quotient = (a : bigint, b : bigint) : bigint => {
  const an = Number(a)
  const bn = Number(b)
  return BigInt(Math.floor(an/bn))
}

const computeVWAP = (high : bigint, low : bigint, close : bigint, volume : bigint) : bigint => {
  return (quotient(high + low + close, BigInt(3))) * volume
}

/* Data -------------------------------------------------------------------- */

const numDataPoints = 3

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
const input1_same_date : oracleData = {
  start  : '1970-01-01T00:00:01Z',
  end    : '1970-01-01T00:00:02Z',
  open   : BigInt(6),
  high   : BigInt(7),
  low    : BigInt(8),
  close  : BigInt(9),
  volume : BigInt(10)
}
const input2 : oracleData = {
  start  : '1970-01-01T00:00:03Z',
  end    : '1970-01-01T00:00:04Z',
  open   : BigInt(6),
  high   : BigInt(7),
  low    : BigInt(8),
  close  : BigInt(9),
  volume : BigInt(10)
}
const input3 : oracleData = {
  start  : '1970-01-01T00:00:05Z',
  end    : '1970-01-01T00:00:06Z',
  open   : BigInt(11),
  high   : BigInt(12),
  low    : BigInt(13),
  close  : BigInt(14),
  volume : BigInt(15)
}
const input4 : oracleData = {
  start  : '1970-01-01T00:00:07Z',
  end    : '1970-01-01T00:00:08Z',
  open   : BigInt(16),
  high   : BigInt(17),
  low    : BigInt(18),
  close  : BigInt(19),
  volume : BigInt(20)
}
const input5 : oracleData = {
  start  : '1970-01-01T00:00:09Z',
  end    : '1970-01-01T00:00:10Z',
  open   : BigInt(21),
  high   : BigInt(22),
  low    : BigInt(23),
  close  : BigInt(24),
  volume : BigInt(25)
}
const input6 : oracleData = {
  start  : '1970-01-01T00:00:11Z',
  end    : '1970-01-01T00:00:12Z',
  open   : BigInt(26),
  high   : BigInt(27),
  low    : BigInt(28),
  close  : BigInt(29),
  volume : BigInt(30)
}
const VWAP1 = computeVWAP(input1.high, input1.low, input1.close, input1.volume)
const VWAP2 = computeVWAP(input2.high, input2.low, input2.close, input2.volume)
const VWAP3 = computeVWAP(input3.high, input3.low, input3.close, input3.volume)
const VWAP4 = computeVWAP(input4.high, input4.low, input4.close, input4.volume)
const VWAP5 = computeVWAP(input5.high, input5.low, input5.close, input5.volume)
const VWAP6 = computeVWAP(input6.high, input6.low, input6.close, input6.volume)

/* Scenario ---------------------------------------------------------------- */

describe('[Normalizer] Contracts deployment', async () => {
  it('Deploy Oracle', async () => {
    await oracle.deploy(alice.pubk, { as: alice })
  });
  it('Deploy Normalizer', async () => {
    const oracle_addr = oracle.get_address()
    if (oracle_addr != undefined) {
      await normalizer.deploy(["XTZ-USD", "BTC-USD"], oracle_addr, BigInt(numDataPoints),  { as: alice })
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
    expect_to_fail(async () => {
      await normalizer.update([ [ "XTZ-USD", input0 ] ], { as : alice })
    }, normalizer.errors.INVALID_CALLER)
  })
  it('Correctly processes updates', async () => {
    const sig1 = await sign_oracle_data(asset1, input1, alice)
    await oracle.update([ [ asset1, [ sig1, input1 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP1, input1.volume))
    } else {
      assert(false)
    }
  })
  it('Update with same time does not update', async () => {
    const sig = await sign_oracle_data(asset1, input1_same_date, alice)
    await oracle.update([ [ asset1, [ sig, input1_same_date ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP1, input1.volume))
      assert(assetMap.prices.saved.length == 1)
    } else {
      assert(false)
    }
  })
  it('Update with input2', async () => {
    const sig = await sign_oracle_data(asset1, input2, alice)
    await oracle.update([ [ asset1, [ sig, input2 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP1 + VWAP2, input1.volume + input2.volume))
      assert(assetMap.prices.saved.length == 2)
    } else {
      assert(false)
    }
  })
  it('Update with input3', async () => {
    const sig = await sign_oracle_data(asset1, input3, alice)
    await oracle.update([ [ asset1, [ sig, input3 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP1 + VWAP2 + VWAP3, input1.volume + input2.volume + input3.volume))
      assert(assetMap.prices.saved.length == 3)
    } else {
      assert(false)
    }
  })
  it('Update with input4', async () => {
    const sig = await sign_oracle_data(asset1, input4, alice)
    await oracle.update([ [ asset1, [ sig, input4 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP2 + VWAP3 + VWAP4, input2.volume + input3.volume + input4.volume))
      assert(assetMap.prices.saved.length == 3)
    } else {
      assert(false)
    }
  })
  it('Update with input5', async () => {
    const sig = await sign_oracle_data(asset1, input5, alice)
    await oracle.update([ [ asset1, [ sig, input5 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP3 + VWAP4 + VWAP5, input3.volume + input4.volume + input5.volume))
      assert(assetMap.prices.saved.length == 3)
    } else {
      assert(false)
    }
  })
  it('Update with input6', async () => {
    const sig = await sign_oracle_data(asset1, input6, alice)
    await oracle.update([ [ asset1, [ sig, input6 ] ] ], {
      as: alice
    })
    await oracle.push(update_entry, { as : alice })
    const assetMap = await normalizer.get_assetMap(asset1)
    if (assetMap != undefined) {
      assert(assetMap.computedPrice == quotient(VWAP4 + VWAP5 + VWAP6, input4.volume + input5.volume + input6.volume))
      assert(assetMap.prices.saved.length == 3)
    } else {
      assert(false)
    }
  })
})
