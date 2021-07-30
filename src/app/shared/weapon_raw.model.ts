import {AidSkill, Weapons} from "./analyzer.constants";

export interface WeaponRaw {
  id: number;
  resource_id: number;
  name: string;
  type: Weapons;
  rarity: string;
  cost: number;
  targets: number;
  skill_name: string;
  sp: number;
  support_skill_name: AidSkill;
  support_skill_tier: string;
  damage: number;
  recover: number;
  patk: number;
  matk: number;
  pdef: number;
  mdef: number;
  attribute: number;
  evo: number;
  is_infinite_evo: number;
  max_patk: number;
  max_matk: number;
  max_pdef: number;
  max_mdef: number;
  add_patk: number;
  add_matk: number;
  add_pdef: number;
  add_mdef: number;

}
