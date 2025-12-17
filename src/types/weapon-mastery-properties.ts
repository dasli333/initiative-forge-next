// Weapon mastery property type definitions
// Mastery properties like "Cleave", "Graze", "Nick", etc.

/**
 * Weapon mastery property DTO with localized names
 * Mastery properties define special combat techniques (e.g., Cleave, Graze, Nick)
 */
export interface WeaponMasteryPropertyDTO {
  id: string;
  name: {
    en: string;
    pl: string;
  };
  description: string;
}

/**
 * List weapon mastery properties response
 */
export interface ListWeaponMasteryPropertiesResponseDTO {
  properties: WeaponMasteryPropertyDTO[];
}
