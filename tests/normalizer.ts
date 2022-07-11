import * as ex from "@completium/experiment-ts";

export interface queue {
    first: bigint;
    last: bigint;
    sum: bigint;
    saved: Array<[
        bigint,
        bigint
    ]>;
}
export interface update_param {
    start: Date;
    end: Date;
    open: bigint;
    high: bigint;
    low: bigint;
    close: bigint;
    volume: bigint;
}
export const queue_to_mich = (x: queue): ex.Micheline => {
    return ex.pair_to_mich([ex.bigint_to_mich(x.first), ex.pair_to_mich([ex.bigint_to_mich(x.last), ex.pair_to_mich([ex.bigint_to_mich(x.sum), ex.list_to_mich(x.saved, x => {
                    const x_key = x[0];
                    const x_value = x[1];
                    return ex.elt_to_mich(ex.bigint_to_mich(x_key), ex.bigint_to_mich(x_value));
                })])])]);
};
export const update_param_to_mich = (x: update_param): ex.Micheline => {
    return ex.pair_to_mich([ex.date_to_mich(x.start), ex.pair_to_mich([ex.date_to_mich(x.end), ex.pair_to_mich([ex.bigint_to_mich(x.open), ex.pair_to_mich([ex.bigint_to_mich(x.high), ex.pair_to_mich([ex.bigint_to_mich(x.low), ex.pair_to_mich([ex.bigint_to_mich(x.close), ex.bigint_to_mich(x.volume)])])])])])]);
};
export const queue_mich_type: ex.MichelineType = ex.pair_array_to_mich_type([
    ex.prim_annot_to_mich_type("int", ["%first"]),
    ex.pair_array_to_mich_type([
        ex.prim_annot_to_mich_type("int", ["%last"]),
        ex.pair_array_to_mich_type([
            ex.prim_annot_to_mich_type("nat", ["%sum"]),
            ex.pair_to_mich_type("map", ex.prim_annot_to_mich_type("int", []), ex.prim_annot_to_mich_type("nat", []))
        ])
    ])
]);
export const update_param_mich_type: ex.MichelineType = ex.pair_array_to_mich_type([
    ex.prim_annot_to_mich_type("timestamp", ["%start"]),
    ex.pair_array_to_mich_type([
        ex.prim_annot_to_mich_type("timestamp", ["%end"]),
        ex.pair_array_to_mich_type([
            ex.prim_annot_to_mich_type("nat", ["%open"]),
            ex.pair_array_to_mich_type([
                ex.prim_annot_to_mich_type("nat", ["%high"]),
                ex.pair_array_to_mich_type([
                    ex.prim_annot_to_mich_type("nat", ["%low"]),
                    ex.pair_array_to_mich_type([
                        ex.prim_annot_to_mich_type("nat", ["%close"]),
                        ex.prim_annot_to_mich_type("nat", ["%volume"])
                    ])
                ])
            ])
        ])
    ])
]);
export const mich_to_queue = (v: ex.Micheline): queue => {
    const fields = ex.mich_to_pairs(v);
    return { first: ex.mich_to_bigint(fields[0]), last: ex.mich_to_bigint(fields[1]), sum: ex.mich_to_bigint(fields[2]), saved: ex.mich_to_map(fields[3], (x, y) => [ex.mich_to_bigint(x), ex.mich_to_bigint(y)]) };
};
export const mich_to_update_param = (v: ex.Micheline): update_param => {
    const fields = ex.mich_to_pairs(v);
    return { start: ex.mich_to_date(fields[0]), end: ex.mich_to_date(fields[1]), open: ex.mich_to_bigint(fields[2]), high: ex.mich_to_bigint(fields[3]), low: ex.mich_to_bigint(fields[4]), close: ex.mich_to_bigint(fields[5]), volume: ex.mich_to_bigint(fields[6]) };
};
export const queue_cmp = (a: queue, b: queue) => {
    return (a.first == b.first && a.last == b.last && a.sum == b.sum && a.saved == b.saved);
};
export const update_param_cmp = (a: update_param, b: update_param) => {
    return (a.start.toISOString() == b.start.toISOString() && a.end.toISOString() == b.end.toISOString() && a.open == b.open && a.high == b.high && a.low == b.low && a.close == b.close && a.volume == b.volume);
};
export type assetMap_key = string;
export const assetMap_key_to_mich = (x: assetMap_key): ex.Micheline => {
    return ex.string_to_mich(x);
};
export const assetMap_key_mich_type: ex.MichelineType = ex.prim_annot_to_mich_type("string", []);
export interface assetMap_value {
    computedPrice: bigint;
    lastUpdateTime: Date;
    prices: queue;
    volumes: queue;
}
export const assetMap_value_to_mich = (x: assetMap_value): ex.Micheline => {
    return ex.pair_to_mich([ex.bigint_to_mich(x.computedPrice), ex.pair_to_mich([ex.date_to_mich(x.lastUpdateTime), ex.pair_to_mich([ex.pair_to_mich([ex.bigint_to_mich(x.prices.first), ex.pair_to_mich([ex.bigint_to_mich(x.prices.last), ex.pair_to_mich([ex.bigint_to_mich(x.prices.sum), ex.list_to_mich(x.prices.saved, x => {
                                const x_key = x[0];
                                const x_value = x[1];
                                return ex.elt_to_mich(ex.bigint_to_mich(x_key), ex.bigint_to_mich(x_value));
                            })])])]), ex.pair_to_mich([ex.bigint_to_mich(x.volumes.first), ex.pair_to_mich([ex.bigint_to_mich(x.volumes.last), ex.pair_to_mich([ex.bigint_to_mich(x.volumes.sum), ex.list_to_mich(x.volumes.saved, x => {
                                const x_key = x[0];
                                const x_value = x[1];
                                return ex.elt_to_mich(ex.bigint_to_mich(x_key), ex.bigint_to_mich(x_value));
                            })])])])])])]);
};
export const assetMap_value_mich_type: ex.MichelineType = ex.pair_array_to_mich_type([
    ex.prim_annot_to_mich_type("nat", ["%computedPrice"]),
    ex.pair_array_to_mich_type([
        ex.prim_annot_to_mich_type("timestamp", ["%lastUpdateTime"]),
        ex.pair_array_to_mich_type([
            ex.pair_array_to_mich_type([
                ex.prim_annot_to_mich_type("int", ["%first"]),
                ex.pair_array_to_mich_type([
                    ex.prim_annot_to_mich_type("int", ["%last"]),
                    ex.pair_array_to_mich_type([
                        ex.prim_annot_to_mich_type("nat", ["%sum"]),
                        ex.pair_to_mich_type("map", ex.prim_annot_to_mich_type("int", []), ex.prim_annot_to_mich_type("nat", []))
                    ])
                ])
            ]),
            ex.pair_array_to_mich_type([
                ex.prim_annot_to_mich_type("int", ["%first"]),
                ex.pair_array_to_mich_type([
                    ex.prim_annot_to_mich_type("int", ["%last"]),
                    ex.pair_array_to_mich_type([
                        ex.prim_annot_to_mich_type("nat", ["%sum"]),
                        ex.pair_to_mich_type("map", ex.prim_annot_to_mich_type("int", []), ex.prim_annot_to_mich_type("nat", []))
                    ])
                ])
            ])
        ])
    ])
]);
export const mich_to_assetMap_value = (v: ex.Micheline): assetMap_value => {
    const fields = ex.mich_to_pairs(v);
    return { computedPrice: ex.mich_to_bigint(fields[0]), lastUpdateTime: ex.mich_to_date(fields[1]), prices: mich_to_queue(fields[2]), volumes: mich_to_queue({ prim: "Pair", args: fields.slice(3) }) };
};
export const assetMap_value_cmp = (a: assetMap_value, b: assetMap_value) => {
    return (a.computedPrice == b.computedPrice && a.lastUpdateTime.toISOString() == b.lastUpdateTime.toISOString() && a.prices == b.prices && a.volumes == b.volumes);
};
export type assetMap_container = Array<[
    assetMap_key,
    assetMap_value
]>;
export const assetMap_container_to_mich = (x: assetMap_container): ex.Micheline => {
    return ex.list_to_mich(x, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([ex.bigint_to_mich(x_value.computedPrice), ex.pair_to_mich([ex.date_to_mich(x_value.lastUpdateTime), ex.pair_to_mich([ex.pair_to_mich([ex.bigint_to_mich(x_value.prices.first), ex.pair_to_mich([ex.bigint_to_mich(x_value.prices.last), ex.pair_to_mich([ex.bigint_to_mich(x_value.prices.sum), ex.list_to_mich(x_value.prices.saved, x => {
                                    const x_key = x[0];
                                    const x_value = x[1];
                                    return ex.elt_to_mich(ex.bigint_to_mich(x_key), ex.bigint_to_mich(x_value));
                                })])])]), ex.pair_to_mich([ex.bigint_to_mich(x_value.volumes.first), ex.pair_to_mich([ex.bigint_to_mich(x_value.volumes.last), ex.pair_to_mich([ex.bigint_to_mich(x_value.volumes.sum), ex.list_to_mich(x_value.volumes.saved, x => {
                                    const x_key = x[0];
                                    const x_value = x[1];
                                    return ex.elt_to_mich(ex.bigint_to_mich(x_key), ex.bigint_to_mich(x_value));
                                })])])])])])]));
    });
};
export const assetMap_container_mich_type: ex.MichelineType = ex.pair_to_mich_type("big_map", ex.prim_annot_to_mich_type("string", []), ex.pair_array_to_mich_type([
    ex.prim_annot_to_mich_type("nat", ["%computedPrice"]),
    ex.pair_array_to_mich_type([
        ex.prim_annot_to_mich_type("timestamp", ["%lastUpdateTime"]),
        ex.pair_array_to_mich_type([
            ex.pair_array_to_mich_type([
                ex.prim_annot_to_mich_type("int", ["%first"]),
                ex.pair_array_to_mich_type([
                    ex.prim_annot_to_mich_type("int", ["%last"]),
                    ex.pair_array_to_mich_type([
                        ex.prim_annot_to_mich_type("nat", ["%sum"]),
                        ex.pair_to_mich_type("map", ex.prim_annot_to_mich_type("int", []), ex.prim_annot_to_mich_type("nat", []))
                    ])
                ])
            ]),
            ex.pair_array_to_mich_type([
                ex.prim_annot_to_mich_type("int", ["%first"]),
                ex.pair_array_to_mich_type([
                    ex.prim_annot_to_mich_type("int", ["%last"]),
                    ex.pair_array_to_mich_type([
                        ex.prim_annot_to_mich_type("nat", ["%sum"]),
                        ex.pair_to_mich_type("map", ex.prim_annot_to_mich_type("int", []), ex.prim_annot_to_mich_type("nat", []))
                    ])
                ])
            ])
        ])
    ])
]));
const update_arg_to_mich = (upm: Array<[
    string,
    update_param
]>): ex.Micheline => {
    return ex.list_to_mich(upm, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), update_param_to_mich(x_value));
    });
}
export class Normalizer {
    address: string | undefined;
    get_address(): string | undefined {
        return this.address;
    }
    async deploy(assetCodes: Array<string>, oracleContract: string, numDataPoints: bigint, params: Partial<ex.Parameters>) {
        const address = await ex.deploy("./contracts/normalizer.arl", {
            assetCodes: assetCodes,
            oracleContract: oracleContract,
            numDataPoints: numDataPoints
        }, params);
        this.address = address;
    }
    async update(upm: Array<[
        string,
        update_param
    ]>, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            await ex.call(this.address, "update", update_arg_to_mich(upm), params);
        }
    }
    async get_assetMap_value(key: assetMap_key): Promise<assetMap_value | undefined> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const data = await ex.get_big_map_value(BigInt(storage.assetMap), assetMap_key_to_mich(key), assetMap_key_mich_type);
            if (data != undefined) {
                return mich_to_assetMap_value(data);
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    errors = {
        INVALID_CALLER: ex.string_to_mich("bad sig"),
        BAD_REQUEST: ex.string_to_mich("bad sig"),
        INVALID_SUM: ex.string_to_mich("bad sig")
    };
}
export const normalizer = new Normalizer();
