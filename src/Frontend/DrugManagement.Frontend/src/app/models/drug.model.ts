export interface Drug {
  id: number;
  metadataId: number;
  drugPackageSizeId: number;
  shopId: number;
  boughtOn?: Date | string;
  openedOn?: Date | string;
  palatableUntil?: Date | string;
  boughtBy?: number;
  personConcerned?: number;
  amountLeftAbsolute?: number;
  amountLeftInPercentage?: number;
}

export interface DrugMetadata {
  id: number;
  name: string;
  activeSubstance?: string;
  description?: string;
}

export interface DrugPackageSize {
  id: number;
  size: string;
  unit: string;
}
