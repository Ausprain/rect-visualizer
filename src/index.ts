import { rv } from "./RectVisualizer";

declare global {
  interface Window {
    rv: typeof rv;
  }
}

window.rv = rv;
export { rv };
