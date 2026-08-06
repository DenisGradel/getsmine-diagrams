import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import SmmFlowClient from "./smm-flow-client";

const root = document.getElementById("root");

if (!root) throw new Error("SMM flow root element was not found");

createRoot(root).render(<SmmFlowClient />);
