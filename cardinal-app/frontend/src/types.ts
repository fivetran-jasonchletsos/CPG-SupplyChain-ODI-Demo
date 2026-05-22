// Synthetic Cardinal Provisions data schemas.

export interface Summary {
  generated_at: string;
  source: 'demo' | 'live';
  fiscal_year: string;
  as_of_week: string;
  kpis: {
    net_sales_ytd_usd: number;
    net_sales_ytd_yoy_pct: number;
    gross_margin_pct: number;
    gross_margin_yoy_pct_pts: number;
    otif_score_pct: number;
    otif_target_pct: number;
    otif_yoy_pct_pts: number;
    fill_rate_pct: number;
    fill_rate_target_pct: number;
    days_of_supply: number;
    days_of_supply_target: number;
    forecast_accuracy_mape_pct: number;
    forecast_accuracy_target_mape_pct: number;
    retailer_chargebacks_ytd_usd: number;
    retailer_chargebacks_yoy_pct: number;
    jbp_attainment_pct: number;
    jbp_attainment_target_pct: number;
    top10_revenue_concentration_pct: number;
    carrier_otd_pct: number;
    carrier_otd_target_pct: number;
    scope3_intensity_kg_per_case: number;
    scope3_intensity_yoy_pct: number;
  };
  categories: { category: string; net_sales_usd: number; share_pct: number; growth_yoy_pct: number }[];
  top_issues: { id: string; severity: 'high' | 'medium' | 'low'; title: string; detail: string; owner: string; link: string }[];
}

export interface Plant {
  id: string;
  name: string;
  type: 'owned' | 'copack';
  lat: number;
  lon: number;
  category: string;
  capacity_utilization_pct: number;
  oee_pct: number | null;
  changeover_hours_per_week: number | null;
  safety_incidents_ytd: number | null;
  brands: string[];
  bottleneck: string | null;
}

export interface PlantsData {
  generated_at: string;
  owned: Plant[];
  copack: Plant[];
  scheduling_agent: AgentBlock;
}

export interface AgentBlock {
  title: string;
  summary: string;
  recommendations?: { action: string; rationale: string; confidence_pct: number }[];
  decisions?: { action: string; rationale: string; redirect_to: string }[];
  signals?: { sku: string; signal: string; recommendation: string; confidence_pct: number }[];
  at_risk_shipments?: { id: string; retailer: string; dc: string; pickup_in_hours: number; risk: string; reason: string; action: string }[];
}

export interface DC {
  id: string;
  name: string;
  lat: number;
  lon: number;
  throughput_cases_per_day: number;
  dos_food_bev: number;
  dos_household: number;
  dos_personal_care: number;
  slow_mover_dollars_usd: number;
  dock_to_stock_hours: number;
  weekly_receipts_cases: number;
  fill_rate_pct: number;
}

export interface DCNetwork {
  generated_at: string;
  dcs: DC[];
  network_totals: { avg_dos_days: number; total_slow_mover_dollars_usd: number; avg_fill_rate_pct: number; total_daily_throughput_cases: number };
}

export interface Retailer {
  rank: number;
  id: string;
  alias: string;
  channel: string;
  otif_pct: number;
  otif_target_pct: number;
  chargebacks_ytd_usd: number;
  sla_perf_pct: number;
  fines_per_1000_cases_usd: number;
  trend: 'up' | 'down' | 'flat';
}

export interface RetailerCompliance {
  generated_at: string;
  retailers: Retailer[];
  chargeback_reasons: { reason: string; pct_of_dollars: number; ytd_usd: number }[];
  compliance_agent: AgentBlock;
}

export interface ForecastWeek {
  week: string;
  label: string;
  food_bev_forecast: number;
  food_bev_actual: number | null;
  household_forecast: number;
  household_actual: number | null;
  personal_care_forecast: number;
  personal_care_actual: number | null;
}

export interface ForecastSKU {
  sku: string;
  brand: string;
  description: string;
  category: string;
  mape_pct: number;
  weekly_avg_units: number;
  driver: string;
}

export interface ForecastData {
  generated_at: string;
  horizon_weeks: number;
  weekly_by_category: ForecastWeek[];
  mape_trend: { week: string; mape_pct: number }[];
  worst_skus: ForecastSKU[];
  demand_sensing_agent: AgentBlock;
}

export interface POSRow {
  sku: string;
  brand: string;
  retailer: string;
  weekly_pos_units: number;
  weekly_pos_dollars_usd: number;
  void_stores_pct: number;
  promo_lift_vs_base_pct: number;
}

export interface POSData {
  generated_at: string;
  top_skus_by_retailer: POSRow[];
  distribution_voids: {
    headline: string;
    top_void_examples: { sku: string; retailer: string; stores_void: number; estimated_lost_sales_weekly_usd: number }[];
  };
}

export interface Promotion {
  id: string;
  brand: string;
  sku: string;
  retailer: string;
  status: 'running' | 'ended';
  planned_spend_usd: number;
  actual_spend_usd: number;
  incremental_lift_cases: number;
  cannibalization_cases: number;
  roi: number;
  recommendation: string;
}

export interface TradePromotionData {
  generated_at: string;
  total_trade_spend_ytd_usd: number;
  total_incremental_volume_ytd_cases: number;
  blended_roi: number;
  promotions: Promotion[];
  trade_spend_agent: AgentBlock;
}

export interface CustomerOtifWeek {
  week: string;
  label: string;
  otif_pct: number;
}

export interface ChargebackReasonBreakdown {
  reason: string;
  ytd_usd: number;
  pct_of_dollars: number;
}

export interface JbpCommitment {
  pillar: string;
  commitment: string;
  target: number;
  actual: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
}

export interface PosWeekBySku {
  sku: string;
  brand: string;
  week_label: string;
  pos_units: number;
  forecast_units: number;
}

export interface CustomerPromo {
  id: string;
  sku: string;
  brand: string;
  status: 'running' | 'ended';
  lift_pct: number;
  cannibalization_pct: number;
  end_week: string;
}

export interface NewItemLaunch {
  sku: string;
  brand: string;
  launched_week: string;
  doors_distributed: number;
  doors_target: number;
  weekly_velocity_units: number;
}

export interface Customer {
  rank: number;
  id: string;
  alias: string;
  channel: string;
  banner_type: string;
  customer_team_lead: string;
  ytd_revenue_usd: number;
  ytd_otif_pct: number;
  ytd_chargebacks_usd: number;
  jbp_status: 'green' | 'yellow' | 'red';
  jbp_commitment_attainment_pct: number;
  last_week_pos_units: number;
  active_promos: number;
  hq_lat: number;
  hq_lon: number;
  primary_dc: string;
  otif_trend_8wk: CustomerOtifWeek[];
  chargeback_breakdown: ChargebackReasonBreakdown[];
  jbp_commitments: JbpCommitment[];
  pos_by_sku_last_4wk: PosWeekBySku[];
  active_promo_detail: CustomerPromo[];
  carrier_otd_to_dc_pct: number;
  new_item_launches: NewItemLaunch[];
}

export interface CustomerTeamRoll {
  lead: string;
  retailers: string[];
  portfolio_revenue_usd: number;
  portfolio_otif_pct: number;
  jbp_attainment_pct: number;
}

export interface CustomersData {
  generated_at: string;
  customers: Customer[];
  team_scorecard: CustomerTeamRoll[];
  summary: {
    top10_revenue_concentration_pct: number;
    jbp_attainment_pct: number;
    chargeback_ytd_usd: number;
    avg_otif_pct: number;
  };
}

export interface CarrierLane {
  origin: string;
  destination_retailer_dc: string;
  otd_pct: number;
  weekly_loads: number;
}

export interface Carrier {
  id: string;
  name: string;
  mode: string;
  otd_pct: number;
  weekly_loads: number;
  on_time_pickups_pct: number;
  damage_claims_per_1000: number;
  key_lanes: CarrierLane[];
}

export interface CarrierOTDData {
  generated_at: string;
  network_otd_pct: number;
  carriers: Carrier[];
}

export interface SustainabilityData {
  generated_at: string;
  emissions: {
    scope1_mt_co2e_ytd: number;
    scope1_yoy_pct: number;
    scope2_mt_co2e_ytd: number;
    scope2_yoy_pct: number;
    scope3_mt_co2e_ytd: number;
    scope3_yoy_pct: number;
    scope3_intensity_kg_per_case: number;
    intensity_target_2030_kg_per_case: number;
  };
  scope3_breakdown: { category: string; share_pct: number; mt_co2e: number }[];
  packaging: {
    recyclable_share_pct: number;
    recyclable_target_2030_pct: number;
    recycled_content_pct: number;
    recycled_content_target_2030_pct: number;
    compostable_share_pct: number;
  };
  water: { withdrawal_megaliters_ytd: number; withdrawal_intensity_l_per_case: number; intensity_yoy_pct: number; high_stress_basin_share_pct: number };
  epr_state_compliance: { state: string; law: string; status: string; next_filing: string; risk_note: string | null }[];
}

export interface Connector {
  id: string;
  fivetran_id: string;
  name: string;
  category: string;
  status: 'healthy' | 'degraded' | 'failed';
  last_sync: string;
  sync_freq_minutes: number;
  rows_24h: number;
  lag_seconds: number;
  lineage_label: string;
  notes: string;
}

export interface PipelineData {
  generated_at: string;
  connectors: Connector[];
  layers: { layer: string; table_count: number; row_count_billions: number; size_tb: number; freshness_minutes: number }[];
  failures: { id: string; title: string; detected_at: string; resolved_at: string; resolution: string; lineage_label: string }[];
}

export interface IcebergTable {
  layer: string;
  name: string;
  rows: number;
  size_gb: number;
  partitions: string | null;
  last_snapshot: string;
}

export interface IcebergData {
  generated_at: string;
  lake_bucket: string;
  catalog: string;
  format: string;
  tables: IcebergTable[];
  compute_engines: { name: string; role: string }[];
}
