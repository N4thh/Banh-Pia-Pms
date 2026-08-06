import { IsEnum, IsOptional } from "class-validator";

export enum StatsRange {
  ALL = "ALL",
  TODAY = "TODAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export class AdminStatsDto {
  @IsOptional()
  @IsEnum(StatsRange)
  range?: StatsRange = StatsRange.ALL;   
}