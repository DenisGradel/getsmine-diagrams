import { useDeferredValue, useMemo, useState } from "react";
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
  edgeLabels,
  itemById,
  items,
  statusLabels,
  systemLabels,
  verifiedAt,
  viewOrder,
  views,
  type EdgeMode,
  type StatusKey,
  type SystemKey,
  type TrackingItem,
  type ViewKey,
} from "./tracking-map-data";
import styles from "./tracking-map.module.css";

type TrackingNode = Node<{ item: TrackingItem }, "trackingItem">;

const edgeStyles: Record<EdgeMode, { color: string; dash?: string; animated: boolean }> = {
  browser: { color: "#5ebbd1", animated: true },
  server: { color: "#6f8fe8", animated: true },
  business: { color: "#52b788", animated: false },
  report: { color: "#e6b65c", animated: false },
  planned: { color: "#87909a", dash: "9 7", animated: false },
};

function TrackingItemNode({ data, selected }: NodeProps<TrackingNode>) {
  const { item } = data;
  return (
    <article className={`${styles.node} ${styles[`node_${item.system}`]} ${selected ? styles.nodeSelected : ""}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeMeta}>
        <span>{systemLabels[item.system]}</span>
        <i className={`${styles.statusDot} ${styles[`status_${item.status}`]}`} />
      </div>
      <h3>{item.title}</h3>
      {item.technicalName ? <p>{item.technicalName}</p> : null}
      <footer>
        <span>{statusLabels[item.status]}</span>
        <strong>{item.phase}</strong>
      </footer>
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </article>
  );
}

const nodeTypes = { trackingItem: TrackingItemNode };

function matches(item: TrackingItem, query: string) {
  const haystack = [
    item.title,
    item.technicalName,
    item.technicalId,
    item.owner,
    item.phase,
    item.summary,
    item.location,
    item.searchTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ru");
  return haystack.includes(query.toLocaleLowerCase("ru"));
}

export default function TrackingMapClient() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [selectedId, setSelectedId] = useState("trace");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");
  const deferredQuery = useDeferredValue(query.trim());
  const view = views[activeView];
  const selected = itemById.get(selectedId) ?? itemById.get("trace")!;

  const nodes: TrackingNode[] = view.nodes.flatMap((spec) => {
    const item = itemById.get(spec.itemId);
    if (!item) return [];
    return [{
      id: spec.id,
      type: "trackingItem",
      position: { x: spec.x, y: spec.y },
      data: { item },
      width: spec.width ?? 292,
      draggable: false,
      selectable: true,
    }];
  });

  const edges: Edge[] = view.edges.map((spec) => {
    const edgeStyle = edgeStyles[spec.mode];
    return {
      id: spec.id,
      source: spec.source,
      target: spec.target,
      label: spec.label,
      type: "smoothstep",
      animated: edgeStyle.animated,
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeStyle.color },
      style: { stroke: edgeStyle.color, strokeWidth: 2.2, strokeDasharray: edgeStyle.dash },
      labelStyle: { fill: "#dce2e6", fontSize: 12, fontWeight: 700 },
      labelBgStyle: { fill: "#161c20", fillOpacity: 0.96 },
      labelBgPadding: [7, 4],
      labelBgBorderRadius: 4,
    };
  });

  const searchResults = useMemo(() => {
    const filtered = items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (deferredQuery && !matches(item, deferredQuery)) return false;
      return true;
    });
    return filtered.slice(0, deferredQuery || statusFilter !== "all" ? 30 : 0);
  }, [deferredQuery, statusFilter]);

  const liveCount = items.filter((item) => item.status === "live").length;
  const nextCount = items.filter((item) => item.status === "planned" || item.status === "ready").length;

  function switchView(key: ViewKey) {
    setActiveView(key);
    const first = views[key].nodes[0];
    if (first) setSelectedId(first.itemId);
  }

  function chooseItem(item: TrackingItem) {
    setSelectedId(item.id);
    const targetView = viewOrder.find((key) => views[key].nodes.some((node) => node.itemId === item.id));
    if (targetView) setActiveView(targetView);
    setQuery("");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTopline}>
          <a href="/getsmine-diagrams/">GetsMine Diagrams</a>
          <span>Факты проверены: {verifiedAt}</span>
        </div>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Tracking · GA4 · GTM · CRM</p>
            <h1>Как GetsMine связывает источник, лид и результат</h1>
            <p className={styles.lead}>Рабочая архитектура после этапа 2: от рекламного клика и web-сессии до доказанного лида, CRM и будущей сквозной выручки.</p>
          </div>
          <div className={styles.metrics} aria-label="Состояние архитектуры">
            <div><strong>1</strong><span>основной GA4-контур</span></div>
            <div><strong>{liveCount}</strong><span>рабочих элементов</span></div>
            <div><strong>{nextCount}</strong><span>следующих изменений</span></div>
          </div>
        </div>
      </header>

      <section className={styles.controlsBar} aria-label="Управление схемой">
        <nav className={styles.tabs} aria-label="Режим схемы">
          {viewOrder.map((key) => (
            <button key={key} type="button" className={activeView === key ? styles.activeTab : ""} onClick={() => switchView(key)}>
              {views[key].label}
            </button>
          ))}
        </nav>
        <div className={styles.searchArea}>
          <input aria-label="Найти систему, событие или владельца" type="search" placeholder="Найти событие, систему или владельца" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select aria-label="Фильтр по статусу" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusKey | "all")}>
            <option value="all">Все статусы</option>
            {(Object.keys(statusLabels) as StatusKey[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
          {searchResults.length ? (
            <div className={styles.searchResults}>
              {searchResults.map((item) => (
                <button key={item.id} type="button" onClick={() => chooseItem(item)}>
                  <span>{item.title}</span>
                  <small>{systemLabels[item.system]} · {statusLabels[item.status]}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.contextBand}>
        <div><span>Сейчас открыто</span><strong>{view.title}</strong></div>
        <p>{view.focus}</p>
      </section>

      <section className={styles.workspace}>
        <div className={styles.mapPanel}>
          <div className={styles.mapHeading}>
            <div><h2>{view.title}</h2><p>{view.description}</p></div>
            <div className={styles.legend} aria-label="Типы связей">
              {(Object.keys(edgeLabels) as EdgeMode[]).map((mode) => <span key={mode}><i className={styles[`line_${mode}`]} />{edgeLabels[mode]}</span>)}
            </div>
          </div>
          <div className={styles.flowWrap}>
            <ReactFlow
              key={activeView}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.data.item.id)}
              fitView
              fitViewOptions={{ padding: 0.1, minZoom: 0.34, maxZoom: 0.92 }}
              minZoom={0.28}
              maxZoom={1.4}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#334047" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.inspectorTopline}>
            <span className={`${styles.systemPill} ${styles[`pill_${selected.system}`]}`}>{systemLabels[selected.system]}</span>
            <span className={`${styles.statusLabel} ${styles[`statusText_${selected.status}`]}`}>{statusLabels[selected.status]}</span>
          </div>
          <h2>{selected.title}</h2>
          {selected.technicalName ? <p className={styles.inspectorTechnical}>{selected.technicalName}</p> : null}
          <p className={styles.summary}>{selected.summary}</p>
          <dl>
            <div><dt>Владелец</dt><dd>{selected.owner}</dd></div>
            <div><dt>Получает</dt><dd>{selected.receives}</dd></div>
            <div><dt>Передаёт дальше</dt><dd>{selected.sends}</dd></div>
            <div><dt>Как проверить</dt><dd>{selected.check}</dd></div>
            <div><dt>Как откатить</dt><dd>{selected.rollback}</dd></div>
            {selected.location ? <div><dt>Где находится</dt><dd>{selected.location}</dd></div> : null}
            {selected.technicalId ? <div><dt>Техническая привязка</dt><dd className={styles.mono}>{selected.technicalId}</dd></div> : null}
          </dl>
          {selected.href ? <a className={styles.openLink} href={selected.href} target="_blank" rel="noreferrer">Открыть связанный объект <span>↗</span></a> : null}
        </aside>
      </section>

      <section className={styles.statusStrip} aria-label="Легенда статусов">
        {(Object.keys(statusLabels) as StatusKey[]).map((status) => (
          <div key={status}><i className={`${styles.statusDot} ${styles[`status_${status}`]}`} /><span><strong>{statusLabels[status]}</strong>{status === "live" ? "проверено в рабочем контуре" : status === "ready" ? "решение уже подготовлено" : status === "planned" ? "в принятом плане" : status === "external" ? "нужен другой владелец или решение" : "заменено, но сохранено для отката"}</span></div>
        ))}
      </section>
    </main>
  );
}
