import { useState } from "react";
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
  itemById,
  layerLabels,
  statusLabels,
  verifiedAt,
  viewOrder,
  views,
  type FlowItem,
  type ViewKey,
} from "./smm-flow-data";
import styles from "./smm-flow.module.css";

type FlowNode = Node<{ item: FlowItem }, "flowItem">;

const edgeStyle = {
  automatic: { color: "#35b8a0", dash: undefined, animated: true },
  manual: { color: "#e5b85c", dash: "4 7", animated: false },
  handoff: { color: "#68a6df", dash: undefined, animated: true },
  pending: { color: "#77808c", dash: "10 8", animated: false },
};

function FlowItemNode({ data, selected }: NodeProps<FlowNode>) {
  const { item } = data;
  return (
    <article className={`${styles.node} ${styles[`node_${item.layer}`]} ${selected ? styles.nodeSelected : ""}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.nodeMeta}>
        <span>{layerLabels[item.layer]}</span>
        <i className={`${styles.statusDot} ${styles[`status_${item.status}`]}`} />
      </div>
      <h3>{item.title}</h3>
      {item.technicalName ? <p className={styles.technicalName}>{item.technicalName}</p> : null}
      <footer>
        <span>{statusLabels[item.status]}</span>
        {item.count ? <strong>{item.count}</strong> : null}
      </footer>
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </article>
  );
}

const nodeTypes = { flowItem: FlowItemNode };

export default function SmmFlowClient() {
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [selectedId, setSelectedId] = useState("sveta-sources");
  const view = views[activeView];
  const selected = itemById.get(selectedId) ?? itemById.get("sveta-sources")!;

  const nodes: FlowNode[] = view.nodes.flatMap((spec) => {
    const item = itemById.get(spec.itemId);
    if (!item) return [];
    return [{
      id: spec.id,
      type: "flowItem",
      position: { x: spec.x, y: spec.y },
      data: { item },
      width: spec.width ?? 286,
      draggable: false,
      selectable: true,
    }];
  });

  const edges: Edge[] = view.edges.map((spec) => {
    const style = edgeStyle[spec.mode];
    return {
      id: spec.id,
      source: spec.source,
      target: spec.target,
      label: spec.label,
      type: "smoothstep",
      animated: style.animated,
      markerEnd: { type: MarkerType.ArrowClosed, color: style.color },
      style: { stroke: style.color, strokeWidth: 2.2, strokeDasharray: style.dash },
      labelStyle: { fill: "#d8ddd8", fontSize: 12, fontWeight: 700 },
      labelBgStyle: { fill: "#151a1b", fillOpacity: 0.96 },
      labelBgPadding: [7, 4],
      labelBgBorderRadius: 5,
    };
  });

  function switchView(key: ViewKey) {
    setActiveView(key);
    const first = views[key].nodes[0];
    if (first) setSelectedId(first.itemId);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTopline}>
          <a href="../index.html">GetsMine Diagrams</a>
          <span>Состояние проверено: {verifiedAt}</span>
        </div>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Органический контент · действующий процесс</p>
            <h1>Как GetsMine находит тему и передаёт её в видео</h1>
            <p className={styles.lead}>Не теория SMM, а фактический путь: от списка Светы и девяти подключённых источников до сохранённой карточки первого органического ролика.</p>
          </div>
          <div className={styles.metrics} aria-label="Ключевые числа">
            <div><strong>9</strong><span>источников подключено</span></div>
            <div><strong>172</strong><span>публикации собрано</span></div>
            <div><strong>7 → 1</strong><span>темы и выбор</span></div>
          </div>
        </div>
      </header>

      <section className={styles.controlsBar}>
        <nav aria-label="Режим схемы">
          {viewOrder.map((key) => (
            <button key={key} type="button" className={activeView === key ? styles.activeTab : ""} onClick={() => switchView(key)}>
              {views[key].label}
            </button>
          ))}
        </nav>
        <div className={styles.legend} aria-label="Типы связей">
          <span><i className={styles.autoLine} />автоматически</span>
          <span><i className={styles.manualLine} />вручную</span>
          <span><i className={styles.handoffLine} />передача владельцу</span>
          <span><i className={styles.pendingLine} />ещё не выполнено</span>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.mapPanel}>
          <div className={styles.mapHeading}>
            <h2>{view.title}</h2>
            <p>{view.description}</p>
          </div>
          <div className={`${styles.flowWrap} ${styles[`flowWrap_${activeView}`]}`}>
            <ReactFlow
              key={activeView}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.data.item.id)}
              fitView
              fitViewOptions={{ padding: 0.1, minZoom: 0.36, maxZoom: 0.95 }}
              minZoom={0.3}
              maxZoom={1.45}
              nodesDraggable={false}
              nodesConnectable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#33403f" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.inspectorTopline}>
            <span className={`${styles.layerPill} ${styles[`pill_${selected.layer}`]}`}>{layerLabels[selected.layer]}</span>
            <span className={`${styles.statusLabel} ${styles[`statusText_${selected.status}`]}`}>{statusLabels[selected.status]}</span>
          </div>
          <h2>{selected.title}</h2>
          {selected.technicalName ? <p className={styles.inspectorTechnical}>{selected.technicalName}</p> : null}
          <p className={styles.summary}>{selected.summary}</p>
          <dl>
            <div><dt>Получает</dt><dd>{selected.receives}</dd></div>
            <div><dt>Передаёт дальше</dt><dd>{selected.returns}</dd></div>
            <div><dt>Как работает</dt><dd>{selected.rhythm}</dd></div>
            {selected.detail ? <div><dt>Важно</dt><dd>{selected.detail}</dd></div> : null}
            {selected.technicalId ? <div><dt>Техническая привязка</dt><dd className={styles.mono}>{selected.technicalId}</dd></div> : null}
          </dl>
          {selected.href ? <a className={styles.openLink} href={selected.href} target="_blank" rel="noreferrer">Открыть связанный объект <span>↗</span></a> : null}
        </aside>
      </section>

      <footer className={styles.conclusion}>
        <p>Текущая граница</p>
        <h2>SMM-путь доказан до сохранённой видеокарточки.</h2>
        <span>Производство первой версии продолжает отдельный владелец <strong>13_gm_video-prod</strong>. Этот незавершённый участок специально не показан работающим.</span>
      </footer>
    </main>
  );
}
