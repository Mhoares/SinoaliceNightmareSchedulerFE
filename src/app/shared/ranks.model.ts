export interface Rank {
  name: string;
  timeslot: number;
  globalRank: number;
  trueRank: number;
  updated: boolean;
  tsRank: number;
  wins: number;
  losses: number;
  lifeforce: number;
}
export interface Ranks{
  Day:number
  GC:number
  rank:Rank[]
}
