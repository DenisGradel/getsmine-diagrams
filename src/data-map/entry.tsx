import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import DataMapClient from "./data-map-client";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Data map root element was not found");
}

createRoot(root).render(<DataMapClient />);
