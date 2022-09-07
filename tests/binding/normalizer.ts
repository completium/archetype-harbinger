import * as ex from "@completium/experiment-ts";

export class queue implements ex.ArchetypeType {
    constructor(public first: ex.Int, public last: ex.Int, public sum: ex.Nat, public saved: Array<[
        ex.Int,
        ex.Nat
    ]>) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): ex.Micheline {
        return ex.pair_to_mich([this.first.to_mich(), ex.pair_to_mich([this.last.to_mich(), ex.pair_to_mich([this.sum.to_mich(), ex.list_to_mich(this.saved, x => {
                        const x_key = x[0];
                        const x_value = x[1];
                        return ex.elt_to_mich(x_key.to_mich(), x_value.to_mich());
                    })])])]);
    }
    equals(v: queue): boolean {
        return (this.first.equals(v.first) && this.first.equals(v.first) && this.last.equals(v.last) && this.sum.equals(v.sum) && this.saved == v.saved);
    }
}
export class update_param implements ex.ArchetypeType {
    constructor(public start: Date, public end: Date, public open: ex.Nat, public high: ex.Nat, public low: ex.Nat, public close: ex.Nat, public volume: ex.Nat) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): ex.Micheline {
        return ex.pair_to_mich([ex.date_to_mich(this.start), ex.pair_to_mich([ex.date_to_mich(this.end), ex.pair_to_mich([this.open.to_mich(), ex.pair_to_mich([this.high.to_mich(), ex.pair_to_mich([this.low.to_mich(), ex.pair_to_mich([this.close.to_mich(), this.volume.to_mich()])])])])])]);
    }
    equals(v: update_param): boolean {
        return ((this.start.getTime() - this.start.getMilliseconds()) == (v.start.getTime() - v.start.getMilliseconds()) && (this.start.getTime() - this.start.getMilliseconds()) == (v.start.getTime() - v.start.getMilliseconds()) && (this.end.getTime() - this.end.getMilliseconds()) == (v.end.getTime() - v.end.getMilliseconds()) && this.open.equals(v.open) && this.high.equals(v.high) && this.low.equals(v.low) && this.close.equals(v.close) && this.volume.equals(v.volume));
    }
}
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
    let fields: ex.Micheline[] = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, queue_mich_type);
    }
    return new queue(ex.mich_to_int(fields[0]), ex.mich_to_int(fields[1]), ex.mich_to_nat(fields[2]), ex.mich_to_map(fields[3], (x, y) => [ex.mich_to_int(x), ex.mich_to_nat(y)]));
};
export const mich_to_update_param = (v: ex.Micheline, collapsed: boolean = false): update_param => {
    let fields: ex.Micheline[] = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, update_param_mich_type);
    }
    return new update_param(ex.mich_to_date(fields[0]), ex.mich_to_date(fields[1]), ex.mich_to_nat(fields[2]), ex.mich_to_nat(fields[3]), ex.mich_to_nat(fields[4]), ex.mich_to_nat(fields[5]), ex.mich_to_nat(fields[6]));
};
export type assetMap_key = string;
export const assetMap_key_mich_type: ex.MichelineType = ex.prim_annot_to_mich_type("string", []);
export class assetMap_value implements ex.ArchetypeType {
    constructor(public computedPrice: ex.Nat, public lastUpdateTime: Date, public prices: queue, public volumes: queue) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): ex.Micheline {
        return ex.pair_to_mich([this.computedPrice.to_mich(), ex.pair_to_mich([ex.date_to_mich(this.lastUpdateTime), ex.pair_to_mich([this.prices.to_mich(), this.volumes.to_mich()])])]);
    }
    equals(v: assetMap_value): boolean {
        return (this.computedPrice.equals(v.computedPrice) && this.computedPrice.equals(v.computedPrice) && (this.lastUpdateTime.getTime() - this.lastUpdateTime.getMilliseconds()) == (v.lastUpdateTime.getTime() - v.lastUpdateTime.getMilliseconds()) && this.prices == v.prices && this.volumes == v.volumes);
    }
}
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
    let fields: ex.Micheline[] = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, assetMap_value_mich_type);
    }
    return new assetMap_value(ex.mich_to_nat(fields[0]), ex.mich_to_date(fields[1]), mich_to_queue(fields[2], collapsed), mich_to_queue({ prim: "Pair", args: fields.slice(3) }, collapsed));
};
export type assetMap_container = Array<[
    assetMap_key,
    assetMap_value
]>;
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
        return ex.elt_to_mich(ex.string_to_mich(x_key), x_value.to_mich());
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
            const data = await ex.get_big_map_value(BigInt(storage.assetMap), ex.string_to_mich(key), assetMap_key_mich_type);
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
