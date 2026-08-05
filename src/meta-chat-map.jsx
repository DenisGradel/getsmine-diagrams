import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edges as edgeSpecs, nodes as nodeSpecs } from "./meta-chat-data";
import "./meta-chat-map.css";

function ArchitectureNode({ data, selected }) {
  const { item } = data;

  return (
    <article className={`architecture-node ${item.color} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Left} className="node-handle" />
      <p className="node-eyebrow">{item.eyebrow}</p>
      <h2>{item.title}</h2>
      <p className="node-summary">{item.summary}</p>
      <span className="node-action">Открыть описание</span>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </article>
  );
}

const nodeTypes = { architecture: ArchitectureNode };

function Detail({ item, onClose }) {
  const detail = item.details;
  const sections = [
    ["Где находится", detail.where],
    ["Зачем нужен", detail.role],
    ["Что получает", detail.receives],
    ["Что возвращает", detail.returns],
    ["Граница", detail.boundary],
  ].filter(([, value]) => value);

  return (
    <aside className="inspector" aria-label="Описание сущности">
      <div className="inspector-topline">
        <span>{item.eyebrow}</span>
        <button type="button" onClick={onClose} aria-label="Закрыть описание">×</button>
      </div>
      <h2>{item.title}</h2>
      <p className="inspector-summary">{item.summary}</p>
      <dl>
        {sections.map(([term, definition]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
      {detail.href ? (
        <a className="open-link" href={detail.href} target="_blank" rel="noreferrer">
          {detail.linkLabel} <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </aside>
  );
}

function App() {
  const [selectedId, setSelectedId] = useState("chat");
  const selected = nodeSpecs.find((item) => item.id === selectedId) ?? nodeSpecs[0];

  const nodes = useMemo(
    () => nodeSpecs.map((item) => ({
      id: item.id,
      type: "architecture",
      position: { x: item.x, y: item.y },
      data: { item },
      draggable: false,
      selectable: true,
      width: 250,
    })),
    [],
  );

  const edges = useMemo(
    () => edgeSpecs.map(([source, target, label]) => ({
      id: `${source}-${target}`,
      source,
      target,
      label,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4e7291" },
      style: { stroke: "#4e7291", strokeWidth: 2 },
      labelStyle: { fill: "#475c6b", fontSize: 12, fontWeight: 700 },
      labelBgStyle: { fill: "#f4f6f5", fillOpacity: 0.95 },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 4,
    })),
    [],
  );

  return (
    <main className="architecture-page">
      <header className="architecture-header">
        <a className="back-link" href="../index.html">GetsMine Diagrams</a>
        <p className="kicker">Рабочая карта</p>
        <h1>Архитектура чата Meta Ads</h1>
        <p className="lead">Как вопрос сотрудника проходит через Claude к свежим данным, превращается в понятный ответ и где возникает риск смешения со старой историей разговора.</p>
      </header>

      <section className="orientation" aria-label="Как читать карту">
        <p><strong>Нажмите на сущность</strong>, чтобы справа увидеть: где она находится, что делает, что получает и что возвращает.</p>
        <p><strong>Перемещайте и увеличивайте карту</strong>, чтобы рассмотреть нужную часть. Цвета различают человека, Claude, внутренний рабочий процесс, источники фактов и наблюдаемый риск.</p>
      </section>

      <section className="workspace" aria-label="Карта архитектуры">
        <div className="map-panel">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedId(node.data.item.id)}
            fitView
            fitViewOptions={{ padding: 0.14, minZoom: 0.4, maxZoom: 1 }}
            minZoom={0.35}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color="#d6dedb" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <Detail item={selected} onClose={() => setSelectedId("chat")} />
      </section>

      <section className="reading-note">
        <h2>Главный вывод карты</h2>
        <p>Свежие рекламные и CRM-факты собираются отдельно от разговора. Слабое место находится после этого: Claude ещё формулирует итоговый ответ с учётом длинной истории конкретного чата. Поэтому исправлять нужно не доступ к Meta, а способ, которым свежая фактическая основа становится ответом сотруднику.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
