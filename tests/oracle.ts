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
    open: bigint;
    high: bigint;
    low: bigint;
    close: bigint;
    volume: bigint;
}
export const oracleData_value_to_mich = (x: oracleData_value): ex.Micheline => {
    return ex.pair_to_mich([ex.date_to_mich(x.start), ex.pair_to_mich([ex.date_to_mich(x.end), ex.pair_to_mich([ex.bigint_to_mich(x.open), ex.pair_to_mich([ex.bigint_to_mich(x.high), ex.pair_to_mich([ex.bigint_to_mich(x.low), ex.pair_to_mich([ex.bigint_to_mich(x.close), ex.bigint_to_mich(x.volume)])])])])])]);
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
export const mich_to_oracleData_value = (v: ex.Micheline): oracleData_value => {
    const fields = ex.mich_to_pairs(v);
    return { start: ex.mich_to_date(fields[0]), end: ex.mich_to_date(fields[1]), open: ex.mich_to_bigint(fields[2]), high: ex.mich_to_bigint(fields[3]), low: ex.mich_to_bigint(fields[4]), close: ex.mich_to_bigint(fields[5]), volume: ex.mich_to_bigint(fields[6]) };
};
export const oracleData_value_cmp = (a: oracleData_value, b: oracleData_value) => {
    return (a.start.toISOString() == b.start.toISOString() && a.end.toISOString() == b.end.toISOString() && a.open == b.open && a.high == b.high && a.low == b.low && a.close == b.close && a.volume == b.volume);
};
export type oracleData_container = Array<[
    oracleData_key,
    oracleData_value
]>;
export const oracleData_container_to_mich = (x: oracleData_container): ex.Micheline => {
    return ex.list_to_mich(x, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([ex.date_to_mich(x_value.start), ex.pair_to_mich([ex.date_to_mich(x_value.end), ex.pair_to_mich([ex.bigint_to_mich(x_value.open), ex.pair_to_mich([ex.bigint_to_mich(x_value.high), ex.pair_to_mich([ex.bigint_to_mich(x_value.low), ex.pair_to_mich([ex.bigint_to_mich(x_value.close), ex.bigint_to_mich(x_value.volume)])])])])])]));
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
        string,
        oracleData_value
    ]
]>): ex.Micheline => {
    return ex.list_to_mich(upm, x => {
        const x_key = x[0];
        const x_value = x[1];
        return ex.elt_to_mich(ex.string_to_mich(x_key), ex.pair_to_mich([ex.string_to_mich(x_value[0]), oracleData_value_to_mich(x_value[1])]));
    });
}
const push_arg_to_mich = (normalizer: ex.Entrypoint): ex.Micheline => {
    return normalizer.to_mich();
}
const revoke_arg_to_mich = (sig: string): ex.Micheline => {
    return ex.string_to_mich(sig);
}
export class Oracle {
    address: string | undefined;
    get_address(): string | undefined {
        return this.address;
    }
    async deploy(publickey: string, params: Partial<ex.Parameters>) {
        const address = await ex.deploy("./contracts/oracle.arl", {
            publickey: publickey
        }, params);
        this.address = address;
    }
    async update(upm: Array<[
        string,
        [
            string,
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
    async revoke(sig: string, params: Partial<ex.Parameters>): Promise<any> {
        if (this.address != undefined) {
            await ex.call(this.address, "revoke", revoke_arg_to_mich(sig), params);
        }
    }
    async get_oracleData_value(key: oracleData_key): Promise<oracleData_value | undefined> {
        if (this.address != undefined) {
            const storage = await ex.get_storage(this.address);
            const data = await ex.get_big_map_value(BigInt(storage.oracleData), oracleData_key_to_mich(key), oracleData_key_mich_type);
            if (data != undefined) {
                return mich_to_oracleData_value(data);
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
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
        INVALID_SIG: ex.string_to_mich("bad sig"),
        REVOKED: ex.string_to_mich("revoked"),
        BAD_REQUEST: ex.string_to_mich("bad request")
    };
}
export const oracle = new Oracle();