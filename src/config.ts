export type ArchitectureType = 'RV32' | 'RV64';
export interface Configuration {
  Architecture : ArchitectureType,
  M_enabled: boolean,
}
