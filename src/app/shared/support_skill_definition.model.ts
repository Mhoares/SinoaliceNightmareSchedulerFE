export interface SupportSkillDefinition{
  support_skill_name : string
  support_skill_tier:Record<string,SupportSkillDescription[]>
}
export interface SupportSkillDescription{
  rate:number
  value:Record<string, number>[]
}
