import React from "react";
import ReactDOM from "react-dom/client";
import "@xyflow/react/dist/style.css";
import TrackingMapClient from "./tracking-map-client";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TrackingMapClient />
  </React.StrictMode>,
);
