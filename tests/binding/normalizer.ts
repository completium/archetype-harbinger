
import * as ex from "@completium/experiment-ts";
export interface queue {
    first: ex.Int;
    last: ex.Int;
    sum: ex.Nat;
    saved: Array<[
        ex.Int,
        ex.Nat
    ]>;
}
export interface update_param {
    start: Date;
    end: Date;
    open: ex.Nat;
    high: ex.Nat;
    low: ex.Nat;
    close: ex.Nat;
    volume: ex.Nat;
}
export const queue_to_mich = (x: queue): ex.Micheline => {
    return ex.pair_to_mich([x.first.to_mich(), ex.pair_to_mich([x.last.to_mich(), ex.pair_to_mich([x.sum.to_mich(), ex.list_to_mich(x.saved, x => {
                    const x_key = x[0];
                    const x_value = x[1];
                    return ex.elt_to_mich(x_key.to_mich(), x_value.to_mich());
                })])])]);
};
export const update_param_to_mich = (x: update_param): ex.Micheline => {
    return ex.pair_to_mich([ex.date_to_mich(x.start), ex.pair_to_mich([ex.date_to_mich(x.end), ex.pair_to_mich([x.open.to_mich(), ex.pair_to_mich([x.high.to_mich(), ex.pair_to_mich([x.low.to_mich(), ex.pair_to_mich([x.close.to_mich(), x.volume.to_mich()])])])])])]);
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
export const mich_to_queue = (v: ex.Micheline, collapsed: boolean = false): queue => {
    let fields = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, queue_mich_type);
    }
    return { first: ex.mich_to_int(fields[0]), last: ex.mich_to_int(fields[1]), sum: ex.mich_to_nat(fields[2]), saved: ex.mich_to_map(fields[3], (x, y) => [ex.mich_to_int(x), ex.mich_to_nat(y)]) };
};
export const mich_to_update_param = (v: ex.Micheline, collapsed: boolean = false): update_param => {
    let fields = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, update_param_mich_type);
    }
    return { start: ex.mich_to_date(fields[0]), end: ex.mich_to_date(fields[1]), open: ex.mich_to_nat(fields[2]), high: ex.mich_to_nat(fields[3]), low: ex.mich_to_nat(fields[4]), close: ex.mich_to_nat(fields[5]), volume: ex.mich_to_nat(fields[6]) };
};
export const queue_cmp = (a: queue, b: queue) => {
    return (a.first.equals(b.first) && a.last.equals(b.last) && a.sum.equals(b.sum) && a.saved == b.saved);
};
export const update_param_cmp = (a: update_param, b: update_param) => {
    return ((a.start.getTime() - a.start.getMilliseconds()) == (b.start.getTime() - b.start.getMilliseconds()) && (a.end.getTime() - a.end.getMilliseconds()) == (b.end.getTime() - b.end.getMilliseconds()) && a.open.equals(b.open) && a.high.equals(b.high) && a.low.equals(b.low) && a.close.equals(b.close) && a.volume.equals(b.volume));
};
export type assetMap_key = string;
export const assetMap_key_to_mich = (x: assetMap_key): ex.Micheline => {
    return ex.string_to_mich(x);
};
export const assetMap_key_mich_type: ex.MichelineType = ex.prim_annot_to_mich_type("string", []);
export interface assetMap_value {
    computedPrice: ex.Nat;
    lastUpdateTime: Date;
    prices: queue;
    volumes: queue;
}
export const assetMap_value_to_mich = (x: assetMap_value): ex.Micheline => {
    return ex.pair_to_mich([x.computedPrice.to_mich(), ex.pair_to_mich([ex.date_to_mich(x.lastUpdateTime), ex.pair_to_mich([queue_to_mich(x.prices), queue_to_mich(x.volumes)])])]);
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
export const mich_to_assetMap_value = (v: ex.Micheline, collapsed: boolean = false): assetMap_value => {
    let fields = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, assetMap_value_mich_type);
    }
    return { computedPrice: ex.mich_to_nat(fields[0]), lastUpdateTime: ex.mich_to_date(fields[1]), prices: mich_to_queue(fields[2], collapsed), volumes: mich_to_queue({ prim: "Pair", args: fields.slice(3) }, collapsed) };
};
export const assetMap_value_cmp = (a: assetMap_value, b: assetMap_value) => {
    return (a.computedPrice.equals(b.computedPrice) && (a.lastUpdateTime.getTime() - a.lastUpdateTime.getMilliseconds()) == (b.lastUpdateTime.getTime() - b.lastUpdateTime.getMilliseconds()) && a.prices == b.prices && a.volumes == b.volumes);
};
export type assetMap_container = Array<[
    assetMap_key,
    assetMap_value
]>;
export const assetMap_container_to_mich = (x: assetMap_container): ex.Micheline => {
    return ex.list_to_mich(x, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([x_value.computedPrice.to_mich(), ex.pair_to_mich([ex.date_to_mich(x_value.lastUpdateTime), ex.pair_to_mich([queue_to_mich(x_value.prices), queue_to_mich(x_value.volumes)])])]));
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
    get_address(): ex.Address {
        if (undefined != this.address) {
            return new ex.Address(this.address);
        }
        throw new Error("Contract not initialised");
    }
    async get_balance(): Promise<ex.Tez> {
        if (null != this.address) {
            return await ex.get_balance(new ex.Address(this.address));
        }
        throw new Error("Contract not initialised");
    }
    async deploy(assetCodes: Array<string>, oracleContract: ex.Address, numDataPoints: ex.Nat, params: Partial<ex.Parameters>) {
        const address = await ex.deploy("./contracts/normalizer.arl", {
            assetCodes: assetCodes.map(e => e),
            oracleContract: oracleContract.toString(),
            numDataPoints: numDataPoints.toString()
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
    async get_assetCodes(): Promise<Array<string>> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const res: Array<string> = [];
            for (let i = 0; i < storage.assetCodes.length; i++) {
                res.push((x => { return x; })(storage.assetCodes[i]));
            }
            return res;
        }
        throw new Error("Contract not initialised");
    }
    async get_oracleContract(): Promise<ex.Address> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new ex.Address(storage.oracleContract);
        }
        throw new Error("Contract not initialised");
    }
    async get_numDataPoints(): Promise<ex.Nat> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new ex.Nat(storage.numDataPoints);
        }
        throw new Error("Contract not initialised");
    }
    async get_assetMap_value(key: assetMap_key): Promise<assetMap_value | undefined> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const data = await ex.get_big_map_value(BigInt(storage.assetMap), assetMap_key_to_mich(key), assetMap_key_mich_type);
            if (data != undefined) {
                return mich_to_assetMap_value(data, true);
            }
            else {
                return undefined;
            }
        }
        throw new Error("Contract not initialised");
    }
    errors = {
        OPTION_IS_NONE: ex.string_to_mich("\"OPTION_IS_NONE\""),
        BAD_SENDER: ex.string_to_mich("\"bad sender\""),
        BAD_REQUEST: ex.string_to_mich("\"bad request\""),
        INVALID_SUM: ex.string_to_mich("\"invalid sum\"")
    };
}
export const normalizer = new Normalizer();
