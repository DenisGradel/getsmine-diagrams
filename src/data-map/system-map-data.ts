export type SystemKey =
  | "source"
  | "crm"
  | "meta"
  | "platrum"
  | "google"
  | "reports"
  | "system";

export type AssetKind =
  | "source"
  | "process"
  | "table"
  | "report"
  | "consumer"
  | "backup"
  | "group";

export type AssetStatus = "active" | "reference" | "legacy" | "manual";

export type Asset = {
  id: string;
  title: string;
  technicalName?: string;
  technicalId?: string;
  system: SystemKey;
  kind: AssetKind;
  group: string;
  status: AssetStatus;
  purpose: string;
  source: string;
  targets: string;
  update: string;
  lastVerified?: string;
  href?: string;
  view?: ViewKey;
  count?: number;
};

export type ViewKey =
  | "overview"
  | "crm"
  | "meta"
  | "platrum"
  | "google"
  | "schedule"
  | "service";

export type GraphNodeSpec = {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width?: number;
};

export type GraphEdgeSpec = {
  id: string;
  source: string;
  target: string;
  label?: string;
  mode?: "event" | "daily" | "weekly" | "manual";
};

export type GraphView = {
  title: string;
  description: string;
  nodes: GraphNodeSpec[];
  edges: GraphEdgeSpec[];
};

export const verifiedAt = "5 августа 2026";

const workflowUrl = (id: string) => `https://n8n.dengradel.com/workflow/${id}`;
const sheetUrl = (gid: number) =>
  `https://docs.google.com/spreadsheets/d/1FHashYJ4o_kVa4KQtkQt0BqfghOQwM7e_7ggs69j3rE/edit#gid=${gid}`;

const coreAssets: Asset[] = [
  {
    id: "lead-sources",
    title: "Новые заявки",
    technicalName: "GHL / Tilda / Calendly / LeadOn / Platform",
    system: "source",
    kind: "source",
    group: "Источники",
    status: "active",
    purpose: "Точки, через которые новые люди оставляют заявки или регистрируются.",
    source: "Формы, лендинги, встречи и продуктовая платформа",
    targets: "Корпоративный n8n и затем Pipedrive",
    update: "Сразу при поступлении новой заявки",
    view: "crm",
  },
  {
    id: "pipedrive",
    title: "Pipedrive",
    system: "crm",
    kind: "source",
    group: "CRM",
    status: "active",
    purpose: "Рабочая CRM отдела продаж: сделки, контакты, стадии, активности и заметки.",
    source: "Корпоративные маршруты заявок, сотрудники и прямые интеграции",
    targets: "Ежедневное CRM-обновление, резервные копии и управленческие отчёты",
    update: "Постоянно в ходе работы отдела продаж",
    view: "crm",
  },
  {
    id: "meta-source",
    title: "Meta Ads",
    system: "meta",
    kind: "source",
    group: "Реклама",
    status: "active",
    purpose: "Расходы, кампании, группы объявлений, объявления, креативы и рекламные результаты Meta.",
    source: "Meta Marketing API",
    targets: "Ежедневный рекламный пакет и Meta-отчёты",
    update: "Ежедневно",
    view: "meta",
  },
  {
    id: "google-source",
    title: "Google Ads",
    system: "google",
    kind: "source",
    group: "Реклама",
    status: "active",
    purpose: "Рекламные кампании Google Ads и YouTube, поисковые запросы и найденные закономерности.",
    source: "Google Ads API",
    targets: "Google Ads Daily State, аналитика и рекламный агент",
    update: "Ежедневные и отдельные аналитические процессы",
    view: "google",
  },
  {
    id: "platrum-source",
    title: "Platrum",
    system: "platrum",
    kind: "source",
    group: "Продажи",
    status: "active",
    purpose: "Агрегированные продажи, полученные деньги, устройства и встречи.",
    source: "Platrum API",
    targets: "Вкладка Platrum, Weekly и общий Dashboard",
    update: "Раз в неделю после закрытия недели продаж",
    view: "platrum",
  },
  {
    id: "corporate-intake",
    title: "Приём и маршрутизация заявок",
    technicalName: "corporate n8n GetsMine",
    system: "crm",
    kind: "process",
    group: "CRM-процессы",
    status: "active",
    purpose: "Определяет, в какую воронку и стадию Pipedrive должна попасть новая заявка.",
    source: "GHL, Tilda, Calendly, LeadOn и Platform",
    targets: "Pipedrive и история происхождения заявок",
    update: "Сразу при каждом входящем событии",
    view: "crm",
  },
  {
    id: "trace",
    title: "История происхождения заявок",
    technicalName: "Lead Attribution Trace",
    technicalId: "WvjzpXT2qkEdAITz",
    system: "crm",
    kind: "table",
    group: "Главные CRM-данные",
    status: "active",
    purpose: "Сохраняет, откуда пришла заявка, рекламные признаки и связь с человеком и сделкой.",
    source: "Корпоративные маршруты заявок и страховочная запись из Pipedrive",
    targets: "Подготовленные CRM-сделки и оценка доказательности источника",
    update: "При новой заявке; недостающие записи дополняются ежедневным CRM-процессом",
    lastVerified: "2026-08-05",
    view: "crm",
  },
  {
    id: "crm-refresh",
    title: "Ежедневное обновление CRM",
    technicalName: "GM CRM - Incremental Refresh v0.1",
    technicalId: "VAJKFrbTvtcx03TC",
    system: "crm",
    kind: "process",
    group: "CRM-процессы",
    status: "active",
    purpose: "Забирает только новые и изменившиеся сделки, а не переписывает всю CRM.",
    source: "Pipedrive и последнее принятое состояние CRM",
    targets: "CRM-таблицы, Leads, Sources, Weekly и таблица качества Meta-лидов",
    update: "Ежедневно в 09:40 МСК",
    lastVerified: "2026-08-05",
    href: workflowUrl("VAJKFrbTvtcx03TC"),
    view: "crm",
  },
  {
    id: "crm-prepared",
    title: "Подготовленные CRM-сделки",
    technicalName: "crm_deals_prepared_latest",
    technicalId: "0gpe7gfSJj6Jq5Iq",
    system: "crm",
    kind: "table",
    group: "Главные CRM-данные",
    status: "active",
    purpose: "Главная очищенная версия сделок для аналитики, источников, стадий и отчётов.",
    source: "Базовая CRM-таблица и история происхождения заявок",
    targets: "Leads, Sources, Weekly, Meta-quality и другие CRM-выходы",
    update: "Внутри ежедневного CRM-обновления",
    lastVerified: "2026-08-05",
    view: "crm",
  },
  {
    id: "meta-quality",
    title: "Качество Meta-лидов",
    technicalName: "crm_meta_quality_output_v0_1",
    technicalId: "ca2YjOEscCGoiCsn",
    system: "meta",
    kind: "table",
    group: "Связь CRM и рекламы",
    status: "active",
    purpose: "Компактная CRM-выборка для оценки качества Meta-лидов без копирования всей истории сделок.",
    source: "Последние принятые подготовленные CRM-сделки с признаками Meta",
    targets: "Meta Chat Access и рекламный анализ",
    update: "Ежедневно вместе с CRM в 09:40 МСК",
    lastVerified: "2026-08-05: 32 уникальные сделки",
    view: "meta",
  },
  {
    id: "meta-refresh",
    title: "Ежедневное обновление Meta",
    technicalName: "GM Meta Ads - Regular Refresh Schedule v0.1",
    technicalId: "JSI9fAbIEvYaCbhJ",
    system: "meta",
    kind: "process",
    group: "Meta-процессы",
    status: "active",
    purpose: "Получает свежие рекламные данные и готовит принятый управленческий пакет Meta.",
    source: "Meta Marketing API",
    targets: "Внутренние Meta-таблицы и Meta-вкладки Google Sheets",
    update: "Ежедневно в 09:50 МСК",
    href: workflowUrl("JSI9fAbIEvYaCbhJ"),
    view: "meta",
  },
  {
    id: "meta-package",
    title: "Управленческий пакет Meta",
    technicalName: "GM Meta Ads Management Report",
    system: "meta",
    kind: "group",
    group: "Главные Meta-данные",
    status: "active",
    purpose: "Принятые рекламные строки, из которых собираются все рабочие Meta-отчёты.",
    source: "Ежедневные Meta-данные, периоды, кампании, объявления и креативы",
    targets: "Dashboard_Meta, Weekly_Meta и детальные Meta-вкладки",
    update: "После ежедневного Meta-обновления",
    lastVerified: "2026-08-05",
    count: 2,
    view: "meta",
  },
  {
    id: "platrum-refresh",
    title: "Еженедельное обновление Platrum",
    technicalName: "GM CRM - Platrum Weekly Refresh v0.1",
    technicalId: "1pqVEqUdUQptEt9F",
    system: "platrum",
    kind: "process",
    group: "Platrum-процессы",
    status: "active",
    purpose: "Забирает закрытую недельную статистику продаж и обновляет рабочую вкладку Platrum.",
    source: "Platrum API",
    targets: "Platrum, Weekly и Dashboard",
    update: "По четвергам в 10:30 МСК",
    href: workflowUrl("1pqVEqUdUQptEt9F"),
    view: "platrum",
  },
  {
    id: "crm-reports",
    title: "CRM-отчёты",
    technicalName: "Leads / Sources / Weekly",
    system: "reports",
    kind: "group",
    group: "Управленческие отчёты",
    status: "active",
    purpose: "Рабочие списки и недельная картина лидов, источников и стадий.",
    source: "Подготовленные CRM-сделки",
    targets: "Руководители и общий Dashboard",
    update: "После успешного ежедневного CRM-обновления",
    count: 3,
    view: "crm",
  },
  {
    id: "meta-reports",
    title: "Meta-отчёты",
    technicalName: "Dashboard_Meta и детальные вкладки",
    system: "reports",
    kind: "group",
    group: "Управленческие отчёты",
    status: "active",
    purpose: "Расходы, лиды, CPL, кампании, группы, объявления, креативы и настройки Meta.",
    source: "Управленческий пакет Meta",
    targets: "Руководители, общий Dashboard и рекламный анализ",
    update: "После ежедневного Meta-обновления",
    count: 7,
    view: "meta",
  },
  {
    id: "dashboard",
    title: "Общий Dashboard",
    technicalName: "GM CRM - Dashboard Regular Refresh v0.1",
    technicalId: "vmJXGofnYuSmtHoh",
    system: "reports",
    kind: "report",
    group: "Управленческие отчёты",
    status: "active",
    purpose: "Главный управленческий экран, который объединяет CRM, рекламу и продажи Platrum.",
    source: "Weekly, Sources, Meta-отчёты и последний принятый Platrum-срез",
    targets: "Руководители GetsMine",
    update: "Ежедневно в 10:45 МСК",
    href: sheetUrl(1741118867),
    view: "overview",
  },
  {
    id: "agents",
    title: "CRM и рекламные агенты",
    system: "system",
    kind: "consumer",
    group: "Получатели",
    status: "active",
    purpose: "Читают подготовленные данные и отвечают на вопросы по CRM и рекламе.",
    source: "CRM-таблицы, Meta-quality, рекламные таблицы и управленческие отчёты",
    targets: "Управленческие решения и подготовленные действия",
    update: "Читают последнее принятое состояние при запросе",
    view: "overview",
  },
  {
    id: "pipedrive-backup",
    title: "Резервные копии Pipedrive",
    technicalName: "GM CRM - Pipedrive Backup Schedule v0.1",
    technicalId: "bFfV7qwQQzlrFIyd",
    system: "system",
    kind: "backup",
    group: "Защита данных",
    status: "active",
    purpose: "Сохраняет независимое состояние Pipedrive в Google Drive.",
    source: "Pipedrive, только чтение",
    targets: "Current, Weekly и Monthly backup-файлы в Google Drive",
    update: "Ежедневно в 08:30 МСК",
    lastVerified: "2026-08-05: 132 132 записи",
    href: workflowUrl("bFfV7qwQQzlrFIyd"),
    view: "crm",
  },
  {
    id: "google-data",
    title: "Google Ads: рабочие данные",
    system: "google",
    kind: "group",
    group: "Google Ads",
    status: "active",
    purpose: "Ежедневное состояние, контекст кампаний, найденные закономерности и подготовленные предложения.",
    source: "Google Ads API и решения рекламного контура",
    targets: "Google Ads Chat Access и будущие отчёты",
    update: "По расписанию и при аналитических проходах",
    count: 6,
    view: "google",
  },
];

type TableSeed = [name: string, id: string, status?: AssetStatus];

const crmTables: TableSeed[] = [
  ["crm_deals_base_latest", "tH8EuFNgWi2RuagX"],
  ["crm_deals_prepared_latest", "0gpe7gfSJj6Jq5Iq"],
  ["crm_meta_output_latest", "VBnSW6lPm1EUa456", "legacy"],
  ["crm_meta_quality_output_v0_1", "ca2YjOEscCGoiCsn"],
  ["crm_publication_state", "14hlGWgYCuJ141Ka"],
  ["crm_stage_events", "H7pPFZ8p9uX1ZMJ1", "reference"],
  ["crm_sveta_leads", "11YNFaRbjqAvaDgB", "legacy"],
  ["crm_sveta_leads_v2", "G7HLicyzbRSKwPLH", "legacy"],
  ["crm_sveta_leads_v3", "mkjgRDFr14n0cndS"],
  ["crm_sync_runs", "hP3fFu5SZ1pekBuW"],
  ["crm_test_datatable_node_rows", "G66Nod5c3YbUx6tR", "legacy"],
  ["crm_test_pipedrive_slice_rows", "SifYys0pHGhx8tW7", "legacy"],
];

const metaTables: TableSeed[] = [
  ["GM Meta Ads Agent Business Context", "zFt640ty670sDWgk"],
  ["GM Meta Ads Approved Actions", "WVvaElT5GUDXvg3O"],
  ["GM Meta Ads Branch Daily Support", "Y5a5Zg2cXVvIgesx"],
  ["GM Meta Ads Branch Daily Support Sync Log", "BSnpdj3ioVoTRRGT", "reference"],
  ["GM Meta Ads CRM Reconciliation Latest", "Ko2VLtBkYMPXnHmP", "reference"],
  ["GM Meta Ads CRM Reconciliation Sync Log", "ZYFM4xvZ1KEpEMmt", "reference"],
  ["GM Meta Ads Campaign Context", "SYu1nXNTfTdocTtY"],
  ["GM Meta Ads Campaign Context Sync Log", "oW2dmy3pUxFnbHt4", "reference"],
  ["GM Meta Ads Creative Assets Registry", "rQovkxvM30sXd39n"],
  ["GM Meta Ads Creative Branch Evidence", "FOMLvjb5GjM03eoF"],
  ["GM Meta Ads Creative Decision Layer", "Y39uf8pwnyklyMIn"],
  ["GM Meta Ads Creative Deployment Log", "AxYibRgAhWNYG6TW", "reference"],
  ["GM Meta Ads Creative Evidence Sync Log", "G1fHj7ZkUlZQaCT2", "reference"],
  ["GM Meta Ads Creative Family Summary", "ypQhvFGjmRsTfo4e"],
  ["GM Meta Ads Creative Outcome Tracking", "c6EeYjTES0Wd1z96"],
  ["GM Meta Ads Creative Production Requests", "UvLJslYp57N9aFub"],
  ["GM Meta Ads Creative Translation Memory", "TdTEdEkLBdCMuTqN"],
  ["GM Meta Ads Daily State", "MnETvLgkCFzMPpxy"],
  ["GM Meta Ads Execution Log", "y400LNvJEvBPrydb", "reference"],
  ["GM Meta Ads Execution Results", "kDJg0k27FOu9XhMs", "reference"],
  ["GM Meta Ads Family Daily Support", "K8uq3i9WEUI9D56z"],
  ["GM Meta Ads Family Daily Support Sync Log", "EqfGdYE7p7cjgXf8", "reference"],
  ["GM Meta Ads Insights", "RYvglooFym8mAtXZ"],
  ["GM Meta Ads Insights Sync Log", "m16f8hqNbQlVO8Y8", "reference"],
  ["GM Meta Ads Management Report Flat Rows", "7GUCUMOPumWMngnt"],
  ["GM Meta Ads Management Report Registry", "omtChL20etqq7Fgj"],
  ["GM Meta Ads Operator Snapshot", "3r2taUYxCAZATCo6"],
  ["GM Meta Ads Operator Snapshot Sync Log", "DPWCQX9nWWvFZ5Uq", "reference"],
  ["GM Meta Ads Operator Trend", "8LwvoND8Hd4jwwW7"],
  ["GM Meta Ads Operator Trend Sync Log", "ldow6qqs0vW6AdcY", "reference"],
  ["GM Meta Ads Period Reports", "uFtEvGG5957zisl1"],
  ["GM Meta Ads Policy Config", "qvDGh1Z8fL5DLxWZ"],
  ["GM Meta Ads Policy Config Sync Log", "bmNrFQXsXJg3Su0p", "reference"],
  ["GM Meta Ads Proposal Decisions", "HTwXqjHCvIctnypx"],
  ["GM Meta Ads Proposal Drafts", "7CMa95dQljImkVKo"],
  ["GM Meta Ads Proposal Sync Log", "WKwTMGDcvdrSRg7n", "reference"],
  ["GM Meta Ads Registry", "tAEtFt4Nn4KvXFqI"],
  ["GM Meta Ads Registry Sync Log", "B8QNpsYD4U6LfWMB", "reference"],
  ["gm_meta_facebook_comment_dedupe", "1h9mWMIJq1YVRsuQ"],
];

const googleTables: TableSeed[] = [
  ["GM Google Ads Campaign Context", "mQv532cw0t9XkOIf"],
  ["GM Google Ads Daily State", "IqlUsmR1uQrueHmB"],
  ["GM Google Ads Execution Log", "KoVgGMx413FBSiSN", "reference"],
  ["GM Google Ads Feedback Log", "Qu7YaBpwwe0g1Fqq", "reference"],
  ["GM Google Ads Learning Candidates", "JOWhCn0UhpYKAG1R"],
  ["GM Google Ads Proposal Bundles", "CTJCIkZE7jby8HVW"],
];

const corporateTables: TableSeed[] = [
  ["Lead Attribution Trace", "WvjzpXT2qkEdAITz"],
  ["Platform list", "mn0MtizmlqEDO1oB"],
  ["promotion sales", "HsKwbJk45axzFb8u", "reference"],
  ["Tilda list", "LCwAYCfCMMP4eymw"],
  ["RSSHub Telegram", "MrhyUnm1inaU9PcH", "reference"],
  ["GoHighLevel Workflow list", "KiA80LN2QQjTcaIN"],
  ["Pipedrive Funnel", "BvP5roedOkJ8gK6h"],
  ["Calendly Event list", "TjMM9xl4DlPhovp5"],
];

const sheetSeeds: Array<[string, number, AssetStatus?]> = [
  ["Dashboard", 1741118867],
  ["Platrum", 1153325794],
  ["Weekly", 1860558469],
  ["Sources", 1699227204],
  ["Dashboard_Meta", 1270861046],
  ["Weekly_Meta", 1612880445],
  ["Leads", 1521221874],
  ["Campaigns_Meta", 793842907],
  ["Adsets_Meta", 299715178],
  ["Ads_Meta", 1741293012],
  ["Creatives_Meta", 701413541],
  ["Adset_Context_Meta", 2041595178],
  ["n8n_tables", 1906202601, "reference"],
  ["v1", 2023547289, "legacy"],
  ["v2", 1260710208, "legacy"],
  ["t_LEADS", 46301223, "reference"],
  ["t_WEEKLY DASHBOARD", 554895289, "reference"],
  ["t_SOURCE PERFORMANCE", 12346477, "reference"],
  ["t_CREATIVE PERFORMANCE", 408848716, "reference"],
  ["t_LISTS", 149729703, "reference"],
  ["t_SEO TRACKING", 110170208, "reference"],
  ["t_GEO TRACKING", 949289097, "reference"],
  ["t_SEO_GEO SUMMARY", 1696871793, "reference"],
  ["meta_overview", 1010133851, "legacy"],
];

function tableAssets(
  seeds: TableSeed[],
  system: SystemKey,
  group: string,
  update: string,
  environment: string,
): Asset[] {
  return seeds.map(([name, id, status = "active"]) => ({
    id: `table-${id}`,
    title: name,
    technicalName: name,
    technicalId: id,
    system,
    kind: "table",
    group,
    status,
    purpose:
      status === "legacy"
        ? "Старая или тестовая таблица, сохранённая для истории и проверки."
        : status === "reference"
          ? "Служебная или журнальная таблица этого контура."
          : `Рабочая внутренняя таблица контура ${group}.`,
    source: environment,
    targets: "Связанные процессы и отчёты своего контура",
    update,
    lastVerified: "2026-08-05",
    view:
      system === "crm"
        ? "crm"
        : system === "meta"
          ? "meta"
          : system === "google"
            ? "google"
            : "service",
  }));
}

const sheetAssets: Asset[] = sheetSeeds.map(([name, gid, status = "active"]) => ({
  id: `sheet-${gid}`,
  title: name,
  technicalName: `Google Sheets: ${name}`,
  technicalId: String(gid),
  system:
    name.includes("Meta") || name === "meta_overview"
      ? "meta"
      : name === "Platrum"
        ? "platrum"
        : "reports",
  kind: "report",
  group:
    status === "active"
      ? "Рабочие вкладки Google Sheets"
      : status === "legacy"
        ? "Старые вкладки Google Sheets"
        : "Справочные вкладки Google Sheets",
  status,
  purpose:
    status === "active"
      ? "Рабочая вкладка управленческого пакета."
      : status === "legacy"
        ? "Старая или скрытая вкладка, не используемая как текущий отчёт."
        : "Справочная или шаблонная вкладка.",
  source: "Подготовленные CRM, Meta или Platrum данные",
  targets: "Руководители и связанные управленческие отчёты",
  update:
    status === "active"
      ? "По расписанию соответствующего контура"
      : "Вручную или не обновляется",
  lastVerified: "2026-08-05",
  href: sheetUrl(gid),
  view:
    name.includes("Meta") || name === "meta_overview"
      ? "meta"
      : name === "Platrum"
        ? "platrum"
        : status === "active"
          ? "crm"
          : "service",
}));

const otherTable: Asset = {
  id: "table-VQ57hUzF7UN4SHDr",
  title: "gm_video_production_jobs_v0_1",
  technicalName: "gm_video_production_jobs_v0_1",
  technicalId: "VQ57hUzF7UN4SHDr",
  system: "system",
  kind: "table",
  group: "Другие процессы GetsMine",
  status: "reference",
  purpose: "Рабочая таблица видеопроизводства; показана только для полноты инвентаря n8n.",
  source: "Контур видеопроизводства",
  targets: "Видео-агенты",
  update: "По заданиям видеопроизводства",
  lastVerified: "2026-08-05",
  view: "service",
};

export const inventory: Asset[] = [
  ...coreAssets,
  ...tableAssets(crmTables, "crm", "CRM", "Ежедневно или по событию", "Личный n8n"),
  ...tableAssets(metaTables, "meta", "Meta Ads", "По Meta-расписанию или действию", "Личный n8n"),
  ...tableAssets(googleTables, "google", "Google Ads", "По Google Ads-расписанию или действию", "Личный n8n"),
  ...tableAssets(corporateTables, "crm", "Корпоративный CRM", "При входящем событии или вручную", "Корпоративный n8n"),
  otherTable,
  ...sheetAssets,
];

export const assetById = new Map(inventory.map((asset) => [asset.id, asset]));

const overviewNodes: GraphNodeSpec[] = [
  { id: "n1", assetId: "lead-sources", x: 0, y: 40 },
  { id: "n2", assetId: "pipedrive", x: 0, y: 245 },
  { id: "n3", assetId: "meta-source", x: 0, y: 450 },
  { id: "n4", assetId: "platrum-source", x: 0, y: 655 },
  { id: "n5", assetId: "corporate-intake", x: 350, y: 40 },
  { id: "n6", assetId: "crm-refresh", x: 350, y: 245 },
  { id: "n7", assetId: "meta-refresh", x: 350, y: 450 },
  { id: "n8", assetId: "platrum-refresh", x: 350, y: 655 },
  { id: "n9", assetId: "trace", x: 700, y: 40 },
  { id: "n10", assetId: "crm-prepared", x: 700, y: 245 },
  { id: "n11", assetId: "meta-quality", x: 700, y: 420 },
  { id: "n12", assetId: "meta-package", x: 700, y: 595 },
  { id: "n13", assetId: "crm-reports", x: 1050, y: 120 },
  { id: "n14", assetId: "meta-reports", x: 1050, y: 330 },
  { id: "n15", assetId: "dashboard", x: 1400, y: 235 },
  { id: "n16", assetId: "agents", x: 1400, y: 455 },
];

const overviewEdges: GraphEdgeSpec[] = [
  { id: "e1", source: "n1", target: "n5", mode: "event", label: "новая заявка" },
  { id: "e2", source: "n5", target: "n2", mode: "event" },
  { id: "e3", source: "n5", target: "n9", mode: "event" },
  { id: "e4", source: "n2", target: "n6", mode: "daily", label: "09:40" },
  { id: "e5", source: "n6", target: "n10", mode: "daily" },
  { id: "e6", source: "n9", target: "n10", mode: "daily" },
  { id: "e7", source: "n10", target: "n11", mode: "daily" },
  { id: "e8", source: "n3", target: "n7", mode: "daily", label: "09:50" },
  { id: "e9", source: "n7", target: "n12", mode: "daily" },
  { id: "e10", source: "n4", target: "n8", mode: "weekly", label: "чт 10:30" },
  { id: "e11", source: "n10", target: "n13", mode: "daily" },
  { id: "e12", source: "n12", target: "n14", mode: "daily" },
  { id: "e13", source: "n13", target: "n15", mode: "daily" },
  { id: "e14", source: "n14", target: "n15", mode: "daily", label: "10:45" },
  { id: "e15", source: "n8", target: "n15", mode: "weekly" },
  { id: "e16", source: "n11", target: "n16", mode: "daily" },
  { id: "e17", source: "n14", target: "n16", mode: "daily" },
];

function node(id: string, assetId: string, x: number, y: number): GraphNodeSpec {
  return { id, assetId, x, y };
}

export const graphViews: Record<ViewKey, GraphView> = {
  overview: {
    title: "От заявки и рекламы до управленческого решения",
    description: "Только главные зависимости. Подробности открываются через режимы сверху.",
    nodes: overviewNodes,
    edges: overviewEdges,
  },
  crm: {
    title: "CRM: заявки, Pipedrive и управленческие отчёты",
    description: "Как новая заявка становится сделкой, получает источник и попадает в отчётность.",
    nodes: [
      node("c1", "lead-sources", 0, 70),
      node("c2", "corporate-intake", 330, 70),
      node("c3", "trace", 660, 0),
      node("c4", "pipedrive", 660, 230),
      node("c5", "pipedrive-backup", 990, 370),
      node("c6", "crm-refresh", 990, 140),
      node("c7", "crm-prepared", 1320, 140),
      node("c8", "crm-reports", 1650, 30),
      node("c9", "meta-quality", 1650, 250),
      node("c10", "dashboard", 1980, 30),
      node("c11", "agents", 1980, 250),
    ],
    edges: [
      { id: "ce1", source: "c1", target: "c2", mode: "event" },
      { id: "ce2", source: "c2", target: "c3", mode: "event" },
      { id: "ce3", source: "c2", target: "c4", mode: "event" },
      { id: "ce4", source: "c4", target: "c5", mode: "daily", label: "08:30" },
      { id: "ce5", source: "c4", target: "c6", mode: "daily", label: "09:40" },
      { id: "ce6", source: "c3", target: "c7", mode: "daily" },
      { id: "ce7", source: "c6", target: "c7", mode: "daily" },
      { id: "ce8", source: "c7", target: "c8", mode: "daily" },
      { id: "ce9", source: "c7", target: "c9", mode: "daily" },
      { id: "ce10", source: "c8", target: "c10", mode: "daily", label: "10:45" },
      { id: "ce11", source: "c9", target: "c11", mode: "daily" },
    ],
  },
  meta: {
    title: "Meta: рекламные данные, аналитика и качество лидов",
    description: "Meta-таблицы свёрнуты по назначению, а не рассыпаны по всему экрану.",
    nodes: [
      node("m1", "meta-source", 0, 160),
      node("m2", "meta-refresh", 340, 160),
      node("m3", "meta-package", 680, 60),
      node("m4", "table-MnETvLgkCFzMPpxy", 680, 280),
      node("m5", "table-SYu1nXNTfTdocTtY", 1020, 0),
      node("m6", "table-ypQhvFGjmRsTfo4e", 1020, 210),
      node("m7", "table-3r2taUYxCAZATCo6", 1020, 420),
      node("m8", "meta-quality", 1360, 0),
      node("m9", "meta-reports", 1360, 230),
      node("m10", "agents", 1700, 110),
      node("m11", "dashboard", 1700, 340),
    ],
    edges: [
      { id: "me1", source: "m1", target: "m2", mode: "daily", label: "09:50" },
      { id: "me2", source: "m2", target: "m3", mode: "daily" },
      { id: "me3", source: "m2", target: "m4", mode: "daily" },
      { id: "me4", source: "m3", target: "m5", mode: "daily" },
      { id: "me5", source: "m3", target: "m6", mode: "daily" },
      { id: "me6", source: "m3", target: "m7", mode: "daily" },
      { id: "me7", source: "m5", target: "m9", mode: "daily" },
      { id: "me8", source: "m6", target: "m9", mode: "daily" },
      { id: "me9", source: "m7", target: "m10", mode: "daily" },
      { id: "me10", source: "m8", target: "m10", mode: "daily" },
      { id: "me11", source: "m9", target: "m11", mode: "daily", label: "10:45" },
    ],
  },
  platrum: {
    title: "Platrum: продажи и встречи в недельной отчётности",
    description: "Недельные и месячные показатели идут в отдельную вкладку, Weekly и Dashboard.",
    nodes: [
      node("p1", "platrum-source", 0, 130),
      node("p2", "platrum-refresh", 350, 130),
      node("p3", "sheet-1153325794", 700, 130),
      node("p4", "sheet-1860558469", 1050, 20),
      node("p5", "dashboard", 1400, 130),
    ],
    edges: [
      { id: "pe1", source: "p1", target: "p2", mode: "weekly", label: "чт 10:30" },
      { id: "pe2", source: "p2", target: "p3", mode: "weekly" },
      { id: "pe3", source: "p3", target: "p4", mode: "weekly" },
      { id: "pe4", source: "p3", target: "p5", mode: "weekly" },
      { id: "pe5", source: "p4", target: "p5", mode: "daily", label: "10:45" },
    ],
  },
  google: {
    title: "Google Ads: рабочая аналитическая цепочка",
    description: "Текущие таблицы собраны в один компактный рекламный контур.",
    nodes: [
      node("g1", "google-source", 0, 140),
      node("g2", "table-IqlUsmR1uQrueHmB", 350, 20),
      node("g3", "table-mQv532cw0t9XkOIf", 350, 250),
      node("g4", "table-JOWhCn0UhpYKAG1R", 700, 20),
      node("g5", "table-CTJCIkZE7jby8HVW", 700, 250),
      node("g6", "google-data", 1050, 140),
      node("g7", "agents", 1400, 140),
    ],
    edges: [
      { id: "ge1", source: "g1", target: "g2", mode: "daily" },
      { id: "ge2", source: "g1", target: "g3", mode: "daily" },
      { id: "ge3", source: "g2", target: "g4", mode: "daily" },
      { id: "ge4", source: "g3", target: "g5", mode: "manual" },
      { id: "ge5", source: "g4", target: "g6", mode: "manual" },
      { id: "ge6", source: "g5", target: "g6", mode: "manual" },
      { id: "ge7", source: "g6", target: "g7", mode: "manual" },
    ],
  },
  schedule: {
    title: "Как проходит обычное утро обновлений",
    description: "Последовательность построена так, чтобы каждый следующий отчёт видел уже принятые данные.",
    nodes: [
      node("s1", "pipedrive-backup", 0, 130),
      node("s2", "crm-refresh", 360, 130),
      node("s3", "meta-refresh", 720, 130),
      node("s4", "platrum-refresh", 1080, 20),
      node("s5", "dashboard", 1440, 130),
    ],
    edges: [
      { id: "se1", source: "s1", target: "s2", mode: "daily", label: "08:30 → 09:40" },
      { id: "se2", source: "s2", target: "s3", mode: "daily", label: "09:40 → 09:50" },
      { id: "se3", source: "s3", target: "s5", mode: "daily", label: "09:50 → 10:45" },
      { id: "se4", source: "s4", target: "s5", mode: "weekly", label: "только по четвергам" },
    ],
  },
  service: {
    title: "Служебные, старые и проверочные объекты",
    description: "Они доступны в полном инвентаре ниже и не загромождают основную карту.",
    nodes: [
      node("v1", "table-hP3fFu5SZ1pekBuW", 0, 40),
      node("v2", "table-14hlGWgYCuJ141Ka", 350, 40),
      node("v3", "table-G7HLicyzbRSKwPLH", 700, 40),
      node("v4", "sheet-1906202601", 1050, 40),
      node("v5", "sheet-1010133851", 1400, 40),
    ],
    edges: [],
  },
};

export const viewOrder: Array<{ key: ViewKey; label: string }> = [
  { key: "overview", label: "Общая карта" },
  { key: "crm", label: "CRM" },
  { key: "meta", label: "Meta" },
  { key: "platrum", label: "Platrum" },
  { key: "google", label: "Google Ads" },
  { key: "schedule", label: "Расписание" },
  { key: "service", label: "Служебное" },
];

export const systemLabels: Record<SystemKey, string> = {
  source: "Источник",
  crm: "CRM",
  meta: "Meta",
  platrum: "Platrum",
  google: "Google Ads",
  reports: "Отчёты",
  system: "Служебное",
};

export const statusLabels: Record<AssetStatus, string> = {
  active: "Работает",
  reference: "Справочное",
  legacy: "Старое",
  manual: "Вручную",
};

export const kindLabels: Record<AssetKind, string> = {
  source: "Источник",
  process: "Процесс",
  table: "Внутренняя таблица",
  report: "Отчёт",
  consumer: "Получатель",
  backup: "Резервная копия",
  group: "Группа",
};
