import { createRoot } from "react-dom/client";
import { useMemo, useState } from "react";
import {
  BaseEdge,
  Background,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  getSmoothStepPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edges as edgeSpecs, nodes as nodeSpecs } from "./meta-chat-data";
import "./meta-chat-map.css";

function ArchitectureNode({ data, selected }) {
  const { item, onOpen } = data;

  return (
    <article className={`architecture-node ${item.color} ${selected ? "selected" : ""}`}>
      <Handle id="left-upper" type="target" position={Position.Left} className="node-handle auxiliary" style={{ top: "32%" }} />
      <Handle id="left-center" type="target" position={Position.Left} className="node-handle" style={{ top: "50%" }} />
      <Handle id="left-lower" type="target" position={Position.Left} className="node-handle auxiliary" style={{ top: "68%" }} />
      <Handle id="right-center" type="target" position={Position.Right} className="node-handle auxiliary" style={{ top: "50%" }} />
      <Handle id="top-center" type="target" position={Position.Top} className="node-handle auxiliary" style={{ left: "50%" }} />
      <Handle id="bottom-center" type="target" position={Position.Bottom} className="node-handle auxiliary" style={{ left: "50%" }} />
      <p className="node-eyebrow">{item.eyebrow}</p>
      <h2>{item.title}</h2>
      <p className="node-summary">{item.summary}</p>
      <button
        type="button"
        className="node-action nodrag nopan"
        onClick={(event) => {
          event.stopPropagation();
          onOpen(item.id);
        }}
      >
        Открыть описание
      </button>
      <Handle id="right-upper" type="source" position={Position.Right} className="node-handle auxiliary" style={{ top: "32%" }} />
      <Handle id="right-center" type="source" position={Position.Right} className="node-handle" style={{ top: "50%" }} />
      <Handle id="right-lower" type="source" position={Position.Right} className="node-handle auxiliary" style={{ top: "68%" }} />
      <Handle id="right-bottom" type="source" position={Position.Right} className="node-handle auxiliary" style={{ top: "84%" }} />
      <Handle id="left-center" type="source" position={Position.Left} className="node-handle auxiliary" style={{ top: "50%" }} />
      <Handle id="top-center" type="source" position={Position.Top} className="node-handle auxiliary" style={{ left: "50%" }} />
      <Handle id="bottom-center" type="source" position={Position.Bottom} className="node-handle auxiliary" style={{ left: "50%" }} />
      <Handle id="bottom-right" type="source" position={Position.Bottom} className="node-handle auxiliary" style={{ left: "78%" }} />
    </article>
  );
}

const nodeTypes = { architecture: ArchitectureNode };

function ArchitectureEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, data }) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
    offset: 26,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="edge-label"
          style={{ transform: `translate(-50%, -50%) translate(${data.labelX}px, ${data.labelY}px)` }}
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = { architecture: ArchitectureEdge };

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
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId ? nodeSpecs.find((item) => item.id === selectedId) : null;

  const nodes = useMemo(
    () => nodeSpecs.map((item) => ({
      id: item.id,
      type: "architecture",
      position: { x: item.x, y: item.y },
      data: { item, onOpen: setSelectedId },
      draggable: false,
      selectable: true,
      width: 270,
    })),
    [],
  );

  const edges = useMemo(
    () => edgeSpecs.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: "architecture",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4e7291" },
      style: { stroke: "#4e7291", strokeWidth: 2 },
      data: edge,
    })),
    [],
  );

  return (
    <main className="architecture-page">
      <header className="architecture-header">
        <a className="back-link" href="../index.html">GetsMine Diagrams</a>
        <p className="kicker">Рабочая карта</p>
        <h1>Архитектура чата Meta Ads</h1>
        <p className="lead">Как принятый рабочий чат сам выбирает официальные данные Meta и отдельные чтения GetsMine, а человек сохраняет контроль над рекламными решениями.</p>
      </header>

      <section className="orientation" aria-label="Как читать карту">
        <p><strong>Нажмите на сущность</strong>, чтобы справа увидеть: где она находится, что делает, что получает и что возвращает.</p>
        <p><strong>Перемещайте и увеличивайте карту</strong>, чтобы рассмотреть нужную часть. Цвета различают человека, Claude, подключения, источники фактов, границу решений и путь отката.</p>
      </section>

      <section className="workspace" aria-label="Карта архитектуры">
        <div className="map-panel">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(_, node) => setSelectedId(node.data.item.id)}
            fitView
            fitViewOptions={{ padding: 0.11, minZoom: 0.18, maxZoom: 1 }}
            minZoom={0.16}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color="#d6dedb" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        {selected ? <Detail item={selected} onClose={() => setSelectedId(null)} /> : null}
      </section>

      <section className="reading-note">
        <h2>Главный вывод карты</h2>
        <p>Claude остаётся единственным аналитиком и собеседником. Официальный Meta MCP читает рекламный кабинет, GetsMine Meta Read Tools возвращает недостающие бизнес-факты, а n8n не пишет второй готовый ответ. Поверхность принята для человеческой работы; причинные выводы и любые изменения рекламы проверяет и принимает человек.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
