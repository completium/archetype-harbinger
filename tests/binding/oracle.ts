import * as ex from "@completium/experiment-ts";
export enum states {
    Running = 1,
    Revoked
}
export type oracleData_key = string;
export const oracleData_key_to_mich = (x: oracleData_key): ex.Micheline => {
    return ex.string_to_mich(x);
};
export const oracleData_key_mich_type: ex.MichelineType = ex.prim_annot_to_mich_type("string", []);
export interface oracleData_value {
    start: Date;
    end: Date;
    open: ex.Nat;
    high: ex.Nat;
    low: ex.Nat;
    close: ex.Nat;
    volume: ex.Nat;
}
export const oracleData_value_to_mich = (x: oracleData_value): ex.Micheline => {
    return ex.pair_to_mich([ex.date_to_mich(x.start), ex.pair_to_mich([ex.date_to_mich(x.end), ex.pair_to_mich([x.open.to_mich(), ex.pair_to_mich([x.high.to_mich(), ex.pair_to_mich([x.low.to_mich(), ex.pair_to_mich([x.close.to_mich(), x.volume.to_mich()])])])])])]);
};
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
    let fields = [];
    if (collapsed) {
        fields = ex.mich_to_pairs(v);
    }
    else {
        fields = ex.annotated_mich_to_array(v, oracleData_value_mich_type);
    }
    return { start: ex.mich_to_date(fields[0]), end: ex.mich_to_date(fields[1]), open: ex.mich_to_nat(fields[2]), high: ex.mich_to_nat(fields[3]), low: ex.mich_to_nat(fields[4]), close: ex.mich_to_nat(fields[5]), volume: ex.mich_to_nat(fields[6]) };
};
export const oracleData_value_cmp = (a: oracleData_value, b: oracleData_value) => {
    return ((a.start.getTime() - a.start.getMilliseconds()) == (b.start.getTime() - b.start.getMilliseconds()) && (a.end.getTime() - a.end.getMilliseconds()) == (b.end.getTime() - b.end.getMilliseconds()) && a.open.equals(b.open) && a.high.equals(b.high) && a.low.equals(b.low) && a.close.equals(b.close) && a.volume.equals(b.volume));
};
export type oracleData_container = Array<[
    oracleData_key,
    oracleData_value
]>;
export const oracleData_container_to_mich = (x: oracleData_container): ex.Micheline => {
    return ex.list_to_mich(x, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([ex.date_to_mich(x_value.start), ex.pair_to_mich([ex.date_to_mich(x_value.end), ex.pair_to_mich([x_value.open.to_mich(), ex.pair_to_mich([x_value.high.to_mich(), ex.pair_to_mich([x_value.low.to_mich(), ex.pair_to_mich([x_value.close.to_mich(), x_value.volume.to_mich()])])])])])]));
    });
};
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
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([x_value[0].to_mich(), oracleData_value_to_mich(x_value[1])]));
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
            const data = await ex.get_big_map_value(BigInt(storage.oracleData), oracleData_key_to_mich(key), oracleData_key_mich_type);
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