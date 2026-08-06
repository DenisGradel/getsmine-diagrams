"use client";

import { useDeferredValue, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  assetById,
  graphViews,
  inventory,
  kindLabels,
  statusLabels,
  systemLabels,
  verifiedAt,
  viewOrder,
  type Asset,
  type SystemKey,
  type ViewKey,
} from "./system-map-data";
import styles from "./data-map.module.css";

type MapNodeData = {
  asset: Asset;
};

type MapNode = Node<MapNodeData, "asset">;

const edgeColors = {
  event: "#56c5c8",
  daily: "#6f94e8",
  weekly: "#70b57b",
  manual: "#a8a29a",
};

function AssetNode({ data, selected }: NodeProps<MapNode>) {
  const { asset } = data;

  return (
    <article
      className={`${styles.node} ${styles[`node_${asset.system}`]} ${selected ? styles.nodeSelected : ""}`}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeTopline}>
        <span>{systemLabels[asset.system]}</span>
        <span className={`${styles.statusDot} ${styles[`status_${asset.status}`]}`} />
      </div>
      <h3>{asset.title}</h3>
      {asset.technicalName && asset.technicalName !== asset.title ? (
        <p className={styles.technicalName}>{asset.technicalName}</p>
      ) : null}
      <div className={styles.nodeFooter}>
        <span>{asset.update}</span>
        {asset.count ? <strong>{asset.count} внутри</strong> : null}
      </div>
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </article>
  );
}

const nodeTypes = { asset: AssetNode };

function uniqueInventory() {
  const seen = new Set<string>();
  return inventory.filter((asset) => {
    const key = `${asset.kind}:${asset.technicalId ?? asset.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const cleanInventory = uniqueInventory();

function includesQuery(asset: Asset, query: string) {
  const haystack = [
    asset.title,
    asset.technicalName,
    asset.technicalId,
    asset.group,
    asset.purpose,
    asset.update,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ru");
  return haystack.includes(query.toLocaleLowerCase("ru"));
}

export default function DataMapClient() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(
    assetById.get("dashboard")!,
  );
  const [query, setQuery] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [systemFilter, setSystemFilter] = useState<SystemKey | "all">("all");
  const deferredQuery = useDeferredValue(query.trim());
  const view = graphViews[activeView];

  const nodes: MapNode[] = view.nodes.flatMap((spec) => {
    const asset = assetById.get(spec.assetId);
    if (!asset) return [];
    return [
      {
        id: spec.id,
        type: "asset",
        position: { x: spec.x, y: spec.y },
        data: { asset },
        draggable: false,
        selectable: true,
        width: spec.width ?? 280,
      },
    ];
  });

  const edges: Edge[] = view.edges.map((edge) => {
    const mode = edge.mode ?? "daily";
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: "smoothstep",
      animated: mode === "event",
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeColors[mode] },
      style: {
        stroke: edgeColors[mode],
        strokeWidth: 2,
        strokeDasharray: mode === "weekly" ? "8 6" : mode === "manual" ? "3 7" : undefined,
      },
      labelStyle: { fill: "#c8ced8", fontSize: 12, fontWeight: 650 },
      labelBgStyle: { fill: "#171c25", fillOpacity: 0.92 },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4,
    };
  });

  const searchResults = deferredQuery
    ? cleanInventory.filter((asset) => includesQuery(asset, deferredQuery)).slice(0, 12)
    : [];

  const filteredInventory = cleanInventory.filter((asset) => {
    if (systemFilter !== "all" && asset.system !== systemFilter) return false;
    if (deferredQuery && !includesQuery(asset, deferredQuery)) return false;
    return true;
  });

  const counts = {
    internal: cleanInventory.filter((asset) => asset.kind === "table").length,
    reports: cleanInventory.filter((asset) => asset.id.startsWith("sheet-")).length,
    active: cleanInventory.filter((asset) => asset.status === "active").length,
  };

  function chooseAsset(asset: Asset) {
    setSelectedAsset(asset);
    setQuery("");
    if (asset.view) setActiveView(asset.view);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <a href="/getsmine-diagrams/" className={styles.backLink}>GetsMine Diagrams</a>
          <span className={styles.verified}>Проверено: {verifiedAt}</span>
        </div>
        <div className={styles.heroRow}>
          <div>
            <p className={styles.eyebrow}>Система управленческих данных</p>
            <h1>Карта данных GetsMine</h1>
            <p className={styles.lead}>
              Откуда приходят данные, где они обрабатываются, в каких таблицах хранятся
              и когда обновляются.
            </p>
          </div>
          <div className={styles.metrics} aria-label="Сводка объектов">
            <span><strong>{counts.internal}</strong> внутренних таблиц</span>
            <span><strong>{counts.reports}</strong> вкладки Google Sheets</span>
            <span><strong>103</strong> процесса n8n</span>
          </div>
        </div>
      </header>

      <section className={styles.controlsBar} aria-label="Управление картой">
        <nav className={styles.tabs} aria-label="Режим карты">
          {viewOrder.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={activeView === key ? styles.activeTab : ""}
              onClick={() => setActiveView(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.searchWrap}>
          <label htmlFor="asset-search">Найти таблицу или процесс</label>
          <input
            id="asset-search"
            type="search"
            placeholder="Например, Weekly или Campaign Context"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {searchResults.length ? (
            <div className={styles.searchResults}>
              {searchResults.map((asset) => (
                <button key={asset.id} type="button" onClick={() => chooseAsset(asset)}>
                  <span>{asset.title}</span>
                  <small>{asset.group} · {kindLabels[asset.kind]}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.canvasPanel}>
          <div className={styles.canvasHeading}>
            <div>
              <h2>{view.title}</h2>
              <p>{view.description}</p>
            </div>
            <div className={styles.legend} aria-label="Обозначения связей">
              <span><i className={styles.eventLine} />при событии</span>
              <span><i className={styles.dailyLine} />ежедневно</span>
              <span><i className={styles.weeklyLine} />еженедельно</span>
              <span><i className={styles.manualLine} />вручную</span>
            </div>
          </div>
          <div className={styles.flowWrap}>
            <ReactFlow
              key={activeView}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedAsset(node.data.asset)}
              fitView
              fitViewOptions={{ padding: 0.12, minZoom: 0.5, maxZoom: 1 }}
              minZoom={0.5}
              maxZoom={1.45}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#303746" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </div>

        <aside className={styles.detailPanel} aria-live="polite">
          <div className={styles.detailHeader}>
            <div>
              <span className={`${styles.systemPill} ${styles[`pill_${selectedAsset.system}`]}`}>
                {systemLabels[selectedAsset.system]}
              </span>
              <span className={styles.kindPill}>{kindLabels[selectedAsset.kind]}</span>
            </div>
            <span className={`${styles.statusLabel} ${styles[`statusText_${selectedAsset.status}`]}`}>
              {statusLabels[selectedAsset.status]}
            </span>
          </div>
          <h2>{selectedAsset.title}</h2>
          {selectedAsset.technicalName ? (
            <p className={styles.detailTechnical}>{selectedAsset.technicalName}</p>
          ) : null}
          <p className={styles.purpose}>{selectedAsset.purpose}</p>

          <dl className={styles.detailList}>
            <div><dt>Получает данные</dt><dd>{selectedAsset.source}</dd></div>
            <div><dt>Передаёт дальше</dt><dd>{selectedAsset.targets}</dd></div>
            <div><dt>Обновление выбранного объекта</dt><dd>{selectedAsset.update}</dd></div>
            {selectedAsset.lastVerified ? (
              <div><dt>Последняя проверка</dt><dd>{selectedAsset.lastVerified}</dd></div>
            ) : null}
            {selectedAsset.technicalId ? (
              <div><dt>Идентификатор</dt><dd className={styles.mono}>{selectedAsset.technicalId}</dd></div>
            ) : null}
          </dl>

          <div className={styles.detailActions}>
            {selectedAsset.href ? (
              <a href={selectedAsset.href} target="_blank" rel="noreferrer">Открыть источник</a>
            ) : null}
            {selectedAsset.view && selectedAsset.view !== activeView ? (
              <button type="button" onClick={() => setActiveView(selectedAsset.view!)}>
                Показать в своей группе
              </button>
            ) : null}
          </div>
        </aside>
      </section>

      <section className={styles.inventorySection}>
        <button
          type="button"
          className={styles.inventoryToggle}
          onClick={() => setInventoryOpen((open) => !open)}
          aria-expanded={inventoryOpen}
        >
          <span>
            <strong>Полный инвентарь</strong>
            <small>Все таблицы и рабочие объекты, скрытые с главной карты</small>
          </span>
          <span>{inventoryOpen ? "Свернуть" : `Открыть · ${cleanInventory.length}`}</span>
        </button>

        {inventoryOpen ? (
          <div className={styles.inventoryBody}>
            <div className={styles.inventoryFilters}>
              {(["all", "crm", "meta", "platrum", "google", "reports", "system"] as const).map(
                (system) => (
                  <button
                    key={system}
                    type="button"
                    className={systemFilter === system ? styles.activeFilter : ""}
                    onClick={() => setSystemFilter(system)}
                  >
                    {system === "all" ? "Все" : systemLabels[system]}
                  </button>
                ),
              )}
            </div>
            <div className={styles.inventoryGrid}>
              {filteredInventory.map((asset) => (
                <button key={asset.id} type="button" onClick={() => chooseAsset(asset)}>
                  <span className={`${styles.inventoryMarker} ${styles[`marker_${asset.system}`]}`} />
                  <span>
                    <strong>{asset.title}</strong>
                    <small>{asset.group} · {statusLabels[asset.status]}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
