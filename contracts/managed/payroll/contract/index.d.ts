import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getAllocation(context: __compactRuntime.WitnessContext<Ledger, PS>,
                employeeAddress_0: string): [PS, bigint];
  markClaimed(context: __compactRuntime.WitnessContext<Ledger, PS>,
              employeeAddress_0: string): [PS, []];
}

export type ImpureCircuits<PS> = {
  createPayroll(context: __compactRuntime.CircuitContext<PS>,
                id_0: string,
                employer_0: string,
                month_0: string,
                numEmployees_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayment(context: __compactRuntime.CircuitContext<PS>,
               employeeAddress_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createPayroll(context: __compactRuntime.CircuitContext<PS>,
                id_0: string,
                employer_0: string,
                month_0: string,
                numEmployees_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayment(context: __compactRuntime.CircuitContext<PS>,
               employeeAddress_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createPayroll(context: __compactRuntime.CircuitContext<PS>,
                id_0: string,
                employer_0: string,
                month_0: string,
                numEmployees_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  claimPayment(context: __compactRuntime.CircuitContext<PS>,
               employeeAddress_0: string): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly payrollId: string;
  readonly employerAddress: string;
  readonly payrollMonth: string;
  readonly totalEmployees: bigint;
  readonly claimCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
