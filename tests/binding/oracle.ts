import * as ex from "@completium/experiment-ts";

export enum states {
    Running = 1,
    Revoked
}
export type oracleData_key = string;
export const oracleData_key_mich_type: ex.MichelineType = ex.prim_annot_to_mich_type("string", []);
export class oracleData_value implements ex.ArchetypeType {
    constructor(public start: Date, public end: Date, public open: ex.Nat, public high: ex.Nat, public low: ex.Nat, public close: ex.Nat, public volume: ex.Nat) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): ex.Micheline {
        return ex.pair_to_mich([ex.date_to_mich(this.start), ex.pair_to_mich([ex.date_to_mich(this.end), ex.pair_to_mich([this.open.to_mich(), ex.pair_to_mich([this.high.to_mich(), ex.pair_to_mich([this.low.to_mich(), ex.pair_to_mich([this.close.to_mich(), this.volume.to_mich()])])])])])]);
    }
    equals(v: oracleData_value): boolean {
        return ((this.start.getTime() - this.start.getMilliseconds()) == (v.start.getTime() - v.start.getMilliseconds()) && (this.start.getTime() - this.start.getMilliseconds()) == (v.start.getTime() - v.start.getMilliseconds()) && (this.end.getTime() - this.end.getMilliseconds()) == (v.end.getTime() - v.end.getMilliseconds()) && this.open.equals(v.open) && this.high.equals(v.high) && this.low.equals(v.low) && this.close.equals(v.close) && this.volume.equals(v.volume));
    }
}
export const oracleData_value_mich_type: ex.MichelineType = ex.pair_array_to_mich_type([
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
export const mich_to_oracleData_value = (v: ex.Micheline, collapsed: boolean = false): oracleData_value => {
    let fields: ex.Micheline[] = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, oracleData_value_mich_type);
    }
    return new oracleData_value(ex.mich_to_date(fields[0]), ex.mich_to_date(fields[1]), ex.mich_to_nat(fields[2]), ex.mich_to_nat(fields[3]), ex.mich_to_nat(fields[4]), ex.mich_to_nat(fields[5]), ex.mich_to_nat(fields[6]));
};
export type oracleData_container = Array<[
    oracleData_key,
    oracleData_value
]>;
export const oracleData_container_mich_type: ex.MichelineType = ex.pair_to_mich_type("big_map", ex.prim_annot_to_mich_type("string", []), ex.pair_array_to_mich_type([
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
]));
const update_arg_to_mich = (upm: Array<[
    string,
    [
        ex.Signature,
        oracleData_value
    ]
]>): ex.Micheline => {
    return ex.list_to_mich(upm, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([x_value[0].to_mich(), x_value[1].to_mich()]));
    });
}
const push_arg_to_mich = (normalizer: ex.Entrypoint): ex.Micheline => {
    return normalizer.to_mich();
}
const revoke_arg_to_mich = (sig: ex.Signature): ex.Micheline => {
    return sig.to_mich();
}
export class Oracle {
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
    async deploy(publickey: ex.Key, params: Partial<ex.Parameters>) {
        const address = await ex.deploy("./contracts/oracle.arl", {
            publickey: publickey.toString()
        }, params);
        this.address = address;
    }
    async update(upm: Array<[
        string,
        [
            ex.Signature,
            oracleData_value
        ]
    ]>, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            await ex.call(this.address, "update", update_arg_to_mich(upm), params);
        }
    }
    async push(normalizer: ex.Entrypoint, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            await ex.call(this.address, "push", push_arg_to_mich(normalizer), params);
        }
    }
    async revoke(sig: ex.Signature, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            await ex.call(this.address, "revoke", revoke_arg_to_mich(sig), params);
        }
    }
    async get_publickey(): Promise<ex.Key> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            return new ex.Key(storage.publickey);
        }
        throw new Error("Contract not initialised");
    }
    async get_oracleData_value(key: oracleData_key): Promise<oracleData_value | undefined> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const data = await ex.get_big_map_value(BigInt(storage.oracleData), ex.string_to_mich(key), oracleData_key_mich_type);
            if (data != undefined) {
                return mich_to_oracleData_value(data, true);
            }
            else {
                return undefined;
            }
        }
        throw new Error("Contract not initialised");
    }
    async get_state(): Promise<states> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const state = storage._state;
            switch (state.toNumber()) {
                case 0: return states.Running;
                case 1: return states.Revoked;
            }
        }
        return states.Running;
    }
    errors = {
        INVALID_STATE: ex.string_to_mich("\"INVALID_STATE\""),
        r0: ex.string_to_mich("\"bad sig\""),
        BAD_SIG: ex.string_to_mich("\"bad sig\""),
        REVOKED: ex.string_to_mich("\"revoked\"")
    };
}
export const oracle = new Oracle();