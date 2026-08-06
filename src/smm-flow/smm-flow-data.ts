export type LayerKey = "context" | "automation" | "data" | "editorial" | "video";
export type ItemStatus = "active" | "manual" | "current" | "reference" | "pending";
export type ViewKey = "overview" | "sources" | "objects";

export type FlowItem = {
  id: string;
  title: string;
  technicalName?: string;
  technicalId?: string;
  layer: LayerKey;
  status: ItemStatus;
  summary: string;
  receives: string;
  returns: string;
  rhythm: string;
  detail?: string;
  href?: string;
  count?: string;
};

export type NodeSpec = { id: string; itemId: string; x: number; y: number; width?: number };
export type EdgeSpec = {
  id: string;
  source: string;
  target: string;
  label: string;
  mode: "automatic" | "manual" | "handoff" | "pending";
};

export const verifiedAt = "6 августа 2026";

export const layerLabels: Record<LayerKey, string> = {
  context: "Контекст и источники",
  automation: "n8n workflow",
  data: "Рабочие данные",
  editorial: "Редакторское решение",
  video: "Видеопроизводство",
};

export const statusLabels: Record<ItemStatus, string> = {
  active: "Работает",
  manual: "Запускается вручную",
  current: "Текущий результат",
  reference: "В резерве",
  pending: "Следующий контур",
};

const workflowUrl = (id: string) => `https://n8n.dengradel.com/workflow/${id}`;

const coreItems: FlowItem[] = [
  {
    id: "sveta-sources",
    title: "Список источников Светы",
    technicalName: "Claude Project GetsMine / CMO + GetsMine_Источники_бот_видеоблок.xlsx",
    layer: "context",
    status: "active",
    summary: "Человеческая база СМИ, Telegram-каналов, публичных персон и отраслевых источников для образовательного контента.",
    receives: "Исследование Светы в двух Claude-чатах",
    returns: "21 конкретный источник для подключения и редакционной работы",
    rhythm: "Обновляется командой по мере появления полезных источников",
    detail: "Первичный чат — «Образовательный блок видео источники». Связанный чат Popular Telegram channels Israel добавил семь ивритоязычных Telegram-каналов.",
    href: "https://claude.ai/cowork/cse_01FhCct3FbQXoFQ1PkRHSMhg",
    count: "21 источник",
  },
  {
    id: "source-registry",
    title: "Подключённые источники",
    technicalName: "GM SMM Sources v0.1",
    technicalId: "HVcTPrmr5rVlUqww",
    layer: "data",
    status: "active",
    summary: "Технический реестр источников, которые уже умеет читать первый сборщик SMM.",
    receives: "Выбранные источники из базы Светы и проверенные способы получения материалов",
    returns: "Адрес, тип и способ подключения каждого активного источника",
    rhythm: "Читается сборщиком каждые 6 часов",
    detail: "Подключены Calcalist, Globes, Ynet, N12/mako Economy, CNBC, CryptoJungle, StarkWare Blog, Amit Segal Telegram и Abu Ali Express Telegram.",
    count: "9 подключено",
  },
  {
    id: "collector",
    title: "Сбор публикаций",
    technicalName: "GM SMM - Source Collector v0.1",
    technicalId: "ZYfPqpFSWZb9TweP",
    layer: "automation",
    status: "active",
    summary: "Получает последние материалы, приводит разные сайты и Telegram к одному виду и не создаёт точных копий.",
    receives: "Девять активных строк реестра источников",
    returns: "Единую ленту публикаций с источником, автором, датой, текстом и прямой ссылкой",
    rhythm: "Автоматически каждые 6 часов; доступен ручной запуск",
    href: workflowUrl("ZYfPqpFSWZb9TweP"),
    count: "6 узлов",
  },
  {
    id: "source-items",
    title: "Лента публикаций",
    technicalName: "GM SMM Source Items v0.1",
    technicalId: "0yexpnlNDXQuVz7k",
    layer: "data",
    status: "active",
    summary: "Проверяемая база исходных материалов до редакторского отбора тем.",
    receives: "Нормализованные публикации из сборщика",
    returns: "Материалы для поиска сюжетов и тем",
    rhythm: "Обновляется после каждого прохода сборщика",
    detail: "На контрольном снимке: 172 уникальные строки, 0 повторов по постоянному ключу, 0 повторов по ссылке.",
    count: "172 материала",
  },
  {
    id: "content-intelligence",
    title: "Поиск и объединение тем",
    technicalName: "GM SMM - Content Intelligence v0.1",
    technicalId: "Wqnuy8lhTG91bKu8",
    layer: "automation",
    status: "manual",
    summary: "Объединяет публикации об одном событии и предлагает темы, полезные для аудитории GetsMine.",
    receives: "Текущую ленту публикаций",
    returns: "Короткий список тем с исходными ссылками, смыслом, видеонаправлением и ограничениями",
    rhythm: "Пока запускается вручную; расписание не включено",
    href: workflowUrl("Wqnuy8lhTG91bKu8"),
    count: "8 узлов",
  },
  {
    id: "topic-candidates",
    title: "Предложенные темы",
    technicalName: "GM SMM Topic Candidates v0.1",
    technicalId: "e5sLVt6x3N5oPynH",
    layer: "data",
    status: "current",
    summary: "Результат контентного workflow, который ещё не считается редакционным решением.",
    receives: "Сгруппированные сюжеты и оценку Content Intelligence",
    returns: "Семь предложений для ручного редакторского выбора",
    rhythm: "Обновляется после принятого запуска Content Intelligence",
    count: "7 тем",
  },
  {
    id: "editorial-choice",
    title: "Редакторский выбор",
    technicalName: "Codex в рабочей задаче 13_gm_smm",
    layer: "editorial",
    status: "manual",
    summary: "Человекоподобное редакторское решение после автоматического списка, а не ещё один скрытый workflow.",
    receives: "Семь тем, их источники, связь с GetsMine и брендовые риски",
    returns: "Одну выбранную тему и объяснение, почему она подходит первой",
    rhythm: "Вручную после появления нового списка тем",
    detail: "Выбор учитывает продуктовую связь, пользу аудитории, видеопригодность и риск. В первом цикле выбрана тема №2.",
  },
  {
    id: "selected-topic",
    title: "Тема: инфраструктура больших вычислений",
    technicalName: "Тема №2 · AI-дата-центры → инфраструктурная модель GetsMine",
    layer: "editorial",
    status: "current",
    summary: "Актуальный пример объясняет, что цифровые вычисления зависят от питания, резервирования, охлаждения, мониторинга и обслуживания.",
    receives: "Редакторский выбор SMM и две исходные публикации",
    returns: "Органический видеобриф на иврите для Instagram Reels",
    rhythm: "Выбрано 6 августа 2026",
    detail: "Нельзя утверждать, что рост AI автоматически выгоден Bitcoin-майнингу, что SpaceX подтверждает GetsMine или что источник обещает финансовый результат клиенту.",
    href: "https://www.cnbc.com/2026/08/05/spacex-tesla-megapack-ai-data-centers.html",
  },
  {
    id: "video-intake",
    title: "Приём задания видеофабрикой",
    technicalName: "GM Video Production - Chat Access v0.1",
    technicalId: "fPFa3aHXDpKMYs6v",
    layer: "video",
    status: "active",
    summary: "Принимает готовый SMM-бриф, проверяет обязательные поля и сохраняет карточку до платного производства.",
    receives: "Тему, аудиторию, канал, язык, сценарий, формат, источники и ограничения",
    returns: "Сохранённую карточку видеозадачи и безопасный стоп перед расходом",
    rhythm: "При каждой новой видеозадаче",
    href: workflowUrl("fPFa3aHXDpKMYs6v"),
  },
  {
    id: "video-job",
    title: "Карточка первого органического ролика",
    technicalName: "gm_smm_ai_infrastructure_reels_he_v0_1_20260806",
    technicalId: "VQ57hUzF7UN4SHDr · gm_video_production_jobs_v0_1",
    layer: "data",
    status: "current",
    summary: "Ивритский сценарий и производственные требования сохранены в общем журнале видеозадач.",
    receives: "Полный SMM-бриф через Chat Access",
    returns: "Задание владельцу общей видеофабрики",
    rhythm: "Версия 0; генерация не начата",
    detail: "HeyGen выбран, вертикальный формат 9:16, Instagram Reels, иврит, 30–35 секунд. Расход не подтверждён, файла ещё нет.",
  },
  {
    id: "video-production",
    title: "Производство первой версии",
    technicalName: "13_gm_video-prod · GM Video Production Agent",
    layer: "video",
    status: "pending",
    summary: "Следующий владелец должен провести карточку через сервис, Drive, журнал и вернуть версию SMM на проверку.",
    receives: "Принятую карточку и отдельное разрешение одного платного запуска",
    returns: "Постоянную Drive-ссылку, версию, параметры производства и пакет проверки",
    rhythm: "Ещё не выполнено для текущей SMM-карточки",
    detail: "Этот серый участок сознательно показан как незавершённый. SMM не запускает HeyGen вручную и не подменяет общую фабрику.",
    href: "./gm-video-agent-network.html",
  },
];

const connectedSources = [
  ["calcalist", "Calcalist", "https://www.calcalist.co.il/", "Израильские финансы, технологии и бизнес"],
  ["globes", "Globes", "https://www.globes.co.il/", "Израильская экономика, компании и рынки"],
  ["ynet", "Ynet", "https://www.ynet.co.il/", "Широкая израильская новостная повестка"],
  ["n12", "N12 / mako Economy", "https://rcs.mako.co.il/rss/news-money.xml", "Актуальная экономическая лента N12/mako"],
  ["cnbc", "CNBC", "https://www.cnbc.com/", "Международные рынки, компании и Bitcoin"],
  ["cryptojungle", "CryptoJungle", "https://www.cryptojungle.co.il/", "Израильский крипторынок и объясняющие материалы"],
  ["starkware", "StarkWare Blog", "https://starkware.co/blog/", "Официальные отраслевые материалы"],
  ["amit-segal", "Amit Segal Telegram", "https://t.me/amitsegal", "Авторская израильская общественная повестка"],
  ["abu-ali", "Abu Ali Express Telegram", "https://t.me/abualiexpress", "Региональная оперативная повестка"],
] as const;

const reserveSources = [
  ["walla", "Walla", "https://www.walla.co.il/"],
  ["yahoo", "Yahoo Finance", "https://finance.yahoo.com/"],
  ["blockchair", "Blockchair News", "https://blockchair.com/news"],
  ["trump", "Donald Trump", "https://truthsocial.com/@realDonaldTrump"],
  ["musk", "Elon Musk", "https://x.com/elonmusk"],
  ["buffett", "Warren Buffett", ""],
  ["micha", "Micha Stocks — площадка не установлена", ""],
  ["daniel-amram", "דניאל עמרם ללא צנזורה", "https://t.me/danielamram3"],
  ["news-field", "חדשות 100שטח", "https://t.me/yediotnews25"],
  ["ksp", "KSP.co.il", "https://t.me/kspcoil"],
  ["news-il", "חדשות ישראל", "https://t.me/News_il_h"],
  ["israel1", "חדשות ישראל ללא צנזורה", "https://t.me/israel1"],
] as const;

const sourceItems: FlowItem[] = [
  ...connectedSources.map(([id, title, href, summary]) => ({
    id: `source-${id}`,
    title,
    technicalName: "Подключён в GM SMM Sources v0.1",
    layer: "context" as const,
    status: "active" as const,
    summary,
    receives: "Публикации официального сайта или публичного Telegram-канала",
    returns: "Материалы в GM SMM Source Items v0.1",
    rhythm: "Читается каждые 6 часов",
    href,
  })),
  ...reserveSources.map(([id, title, href]) => ({
    id: `source-${id}`,
    title,
    technicalName: "Источник из рабочей базы Светы",
    layer: "context" as const,
    status: "reference" as const,
    summary: "Сохранён в общей базе, но не включён в первую техническую версию сборщика.",
    receives: "Редакционные или публичные материалы",
    returns: "Будущий кандидат на подключение или осознанное исключение",
    rhythm: "Не собирается текущим workflow",
    href: href || undefined,
  })),
];

export const items = [...coreItems, ...sourceItems];
export const itemById = new Map(items.map((item) => [item.id, item]));

const overviewNodes: NodeSpec[] = [
  { id: "overview-sources", itemId: "sveta-sources", x: 0, y: 0 },
  { id: "overview-registry", itemId: "source-registry", x: 350, y: 0 },
  { id: "overview-collector", itemId: "collector", x: 700, y: 0 },
  { id: "overview-items", itemId: "source-items", x: 0, y: 220 },
  { id: "overview-intelligence", itemId: "content-intelligence", x: 350, y: 220 },
  { id: "overview-topics", itemId: "topic-candidates", x: 700, y: 220 },
  { id: "overview-editor", itemId: "editorial-choice", x: 0, y: 440 },
  { id: "overview-selected", itemId: "selected-topic", x: 350, y: 440 },
  { id: "overview-intake", itemId: "video-intake", x: 700, y: 440 },
  { id: "overview-job", itemId: "video-job", x: 0, y: 660 },
  { id: "overview-production", itemId: "video-production", x: 350, y: 660 },
];

const overviewEdges: EdgeSpec[] = [
  ["sources-registry", "overview-sources", "overview-registry", "21 в базе · 9 подключено", "manual"],
  ["registry-collector", "overview-registry", "overview-collector", "активные строки", "automatic"],
  ["collector-items", "overview-collector", "overview-items", "каждые 6 часов", "automatic"],
  ["items-intelligence", "overview-items", "overview-intelligence", "172 материала", "manual"],
  ["intelligence-topics", "overview-intelligence", "overview-topics", "7 предложений", "automatic"],
  ["topics-editor", "overview-topics", "overview-editor", "ручная оценка", "manual"],
  ["editor-selected", "overview-editor", "overview-selected", "тема №2", "manual"],
  ["selected-intake", "overview-selected", "overview-intake", "полный SMM-бриф", "handoff"],
  ["intake-job", "overview-intake", "overview-job", "карточка сохранена", "automatic"],
  ["job-production", "overview-job", "overview-production", "производство не запущено", "pending"],
].map(([id, source, target, label, mode]) => ({ id, source, target, label, mode })) as EdgeSpec[];

const sourceNodes: NodeSpec[] = [
  { id: "source-view-base", itemId: "sveta-sources", x: 0, y: 0, width: 300 },
  { id: "source-view-registry", itemId: "source-registry", x: 350, y: 0, width: 300 },
  ...connectedSources.map(([id], index) => ({
    id: `source-view-${id}`,
    itemId: `source-${id}`,
    x: (index % 3) * 350,
    y: 220 + Math.floor(index / 3) * 180,
  })),
  ...reserveSources.map(([id], index) => ({
    id: `source-view-${id}`,
    itemId: `source-${id}`,
    x: (index % 3) * 350,
    y: 800 + Math.floor(index / 3) * 180,
  })),
];

const sourceEdges: EdgeSpec[] = [{
  id: "source-base-registry",
  source: "source-view-base",
  target: "source-view-registry",
  label: "9 подключены · 12 в резерве",
  mode: "manual",
}];

const objectNodes: NodeSpec[] = [
  { id: "objects-registry", itemId: "source-registry", x: 0, y: 0 },
  { id: "objects-collector", itemId: "collector", x: 350, y: 0 },
  { id: "objects-items", itemId: "source-items", x: 700, y: 0 },
  { id: "objects-intelligence", itemId: "content-intelligence", x: 0, y: 240 },
  { id: "objects-topics", itemId: "topic-candidates", x: 350, y: 240 },
  { id: "objects-editor", itemId: "editorial-choice", x: 700, y: 240 },
  { id: "objects-intake", itemId: "video-intake", x: 0, y: 480 },
  { id: "objects-job", itemId: "video-job", x: 350, y: 480 },
];

const objectEdges = overviewEdges.slice(1, 6).concat([
  { id: "objects-topics-editor", source: "objects-topics", target: "objects-editor", label: "ручной выбор", mode: "manual" },
  { id: "objects-editor-intake", source: "objects-editor", target: "objects-intake", label: "принятый бриф", mode: "handoff" },
  { id: "objects-intake-job", source: "objects-intake", target: "objects-job", label: "job key", mode: "automatic" },
]).map((edge) => ({
  ...edge,
  source: edge.source.replace("overview-", "objects-"),
  target: edge.target.replace("overview-", "objects-"),
}));

export const views = {
  overview: {
    label: "Общий путь",
    title: "От источника до карточки видеозадачи",
    description: "Фактически работающая SMM-цепочка и точка, где ответственность переходит общей видеофабрике.",
    nodes: overviewNodes,
    edges: overviewEdges,
  },
  sources: {
    label: "Источники",
    title: "21 источник в рабочей базе Светы",
    description: "Девять источников подключены к сборщику; остальные сохранены как резерв и не изображаются работающими.",
    nodes: sourceNodes,
    edges: sourceEdges,
  },
  objects: {
    label: "Рабочие объекты",
    title: "Workflow, таблицы и ручные решения",
    description: "Точные названия технических объектов без подмены человеческого смысла внутренними идентификаторами.",
    nodes: objectNodes,
    edges: objectEdges,
  },
} satisfies Record<ViewKey, { label: string; title: string; description: string; nodes: NodeSpec[]; edges: EdgeSpec[] }>;

export const viewOrder: ViewKey[] = ["overview", "sources", "objects"];
