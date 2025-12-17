// Weapon property type definitions
// Properties like "Finesse", "Light", "Versatile", etc.

/**
 * Weapon property DTO with localized names
 * Properties define weapon characteristics (e.g., Finesse, Light, Heavy)
 */
export interface WeaponPropertyDTO {
  id: string;
  name: {
    en: string;
    pl: string;
  };
  description: string;
}

/**
 * List weapon properties response
 */
export interface ListWeaponPropertiesResponseDTO {
  properties: WeaponPropertyDTO[];
}
