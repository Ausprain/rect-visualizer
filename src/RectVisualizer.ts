import { createRectDiv, getColors } from "./utils";

class DrawHub {
  public readonly hubEl: HTMLDivElement;
  private readonly container: HTMLDivElement;
  private readonly drawnMap = new Map<
    DOMRect,
    [HTMLDivElement, HTMLSpanElement]
  >();
  private readonly itemMap = new WeakMap<HTMLSpanElement, DOMRect>();
  constructor() {
    const hub = document.createElement("div");
    Object.assign(hub.style, {
      cursor: "move",
      position: "fixed",
      top: "0",
      left: "0",
      minHeight: "100px",
      width: "180px",
      border: "1px solid #888",
      borderRadius: "8px",
      backgroundColor: "#555",
      overflow: "hidden",
      userSelect: "none",
      zIndex: "9999",
      pointerEvents: "auto",
      transform: "translate(0, 0)",
      willChange: "transform",
    } as CSSStyleDeclaration);

    let xOffset = 0;
    let yOffset = 0;
    const moveHub = function (ev: MouseEvent) {
      if (!hub) {
        return;
      }
      const x = ev.clientX - xOffset;
      const y = ev.clientY - yOffset;
      hub.style.transform = `translate(${x}px, ${y}px)`;
      ev.preventDefault();
    };
    const clearHandler = () => {
      document.removeEventListener("mousemove", moveHub);
      document.removeEventListener("mouseup", clearHandler);
    };
    hub.onmousedown = (ev) => {
      if (ev.target !== hub) {
        return;
      }
      const rect = hub.getBoundingClientRect();
      xOffset = ev.clientX - rect.x;
      yOffset = ev.clientY - rect.y;
      document.addEventListener("mousemove", moveHub);
      document.addEventListener("mouseup", clearHandler);
      ev.preventDefault();
    };

    const container = document.createElement("div");
    Object.assign(container.style, {
      padding: "10px",
      marginBottom: "20px",
      maxHeight: "80vh",
      overflowY: "auto",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontSize: "11px",
    } as CSSStyleDeclaration);
    container.onclick = (ev) => {
      const target = ev.target as HTMLSpanElement;
      const rect = this.itemMap.get(target);
      if (!rect) {
        return;
      }
      const div = this.drawnMap.get(rect)?.[0];
      if (!div) {
        return;
      }
      const isSelected = target.style.backgroundColor !== "transparent";
      if (isSelected) {
        target.style.backgroundColor = "transparent";
        div.style.visibility = "hidden";
      } else {
        target.style.backgroundColor = target.style.borderColor;
        div.style.visibility = "visible";
      }
    };
    container.ondblclick = (ev) => {
      const target = ev.target as HTMLSpanElement;
      const rect = this.itemMap.get(target);
      if (!rect) {
        return;
      }
      const div = this.drawnMap.get(rect)?.[0];
      if (!div) {
        return;
      }
      target.remove();
      div.remove();
      this.drawnMap.delete(rect);
      this.itemMap.delete(target);
    };

    const btn = document.createElement("button");
    btn.textContent = "hide all";
    Object.assign(btn.style, {
      width: "100%",
      height: "22px",
      marginTop: "22px",
      cursor: "pointer",
    });
    btn.onclick = () => {
      if (btn.textContent === "show all") {
        this.drawnMap.values().forEach(([div, span]) => {
          div.style.visibility = "visible";
          span.style.backgroundColor = span.style.borderColor;
        });
        btn.textContent = "hide all";
      } else {
        // hide all
        this.drawnMap.values().forEach(([div, span]) => {
          div.style.visibility = "hidden";
          span.style.backgroundColor = "transparent";
        });
        btn.textContent = "show all";
      }
    };

    hub.appendChild(btn);
    hub.appendChild(container);
    this.hubEl = hub;
    this.container = container;
  }
  #createHubItem(rect: DOMRect, color: string, name = "") {
    const span = document.createElement("span");
    if (name) {
      name = `[${name}]\n`;
    }
    span.textContent = `${name}x: ${rect.x.toFixed(1)}, y: ${rect.y.toFixed(
      1
    )}, r: ${rect.right.toFixed(1)}, b: ${rect.bottom.toFixed(
      1
    )}, width: ${rect.width.toFixed(1)}, height: ${rect.height.toFixed(1)}`;
    Object.assign(span.style, {
      cursor: "pointer",
      backgroundColor: color,
      borderColor: color,
      borderWidth: "1px",
      borderStyle: "solid",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "4px",
      borderRadius: "4px",
      padding: "4px",
      whiteSpace: "pre-wrap",
    } as CSSStyleDeclaration);
    this.itemMap.set(span, rect);
    return span;
  }
  addDraw(rect: DOMRect, div: HTMLDivElement, color: string, name = "") {
    if (this.drawnMap.has(rect)) {
      return;
    }
    const item = this.#createHubItem(rect, color, name);
    this.drawnMap.set(rect, [div, item]);
    this.container.appendChild(item);
  }
  clear() {
    this.container.textContent = "";
    this.drawnMap.clear();
  }
}
class RectVisualizer {
  private readonly wrapper: HTMLDivElement;
  private readonly hub: DrawHub;

  constructor() {
    const wrapper = document.createElement("div");
    wrapper.id = "rect-visualizer-wrapper";
    Object.assign(wrapper.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "9998",
    } as CSSStyleDeclaration);

    this.hub = new DrawHub();
    wrapper.appendChild(this.hub.hubEl);
    this.wrapper = wrapper;
  }
  clear() {
    this.wrapper.textContent = "";
    this.wrapper.appendChild(this.hub.hubEl);
    this.wrapper.remove();
    this.hub.clear();
  }
  /**
   * 绘制 DOMRect 矩形, 带有 1px 实线边框，避免面积为零时不可见
   * @param rects 要绘制的矩形数组
   * @param options
   *  * alpha 矩形透明度，默认 0.6
   *  * clear 是否清除之前绘制的矩形，默认 true
   *  * colors 矩形颜色数组，默认随机生成; 若提供, 则必须与 rects 长度相同, 否则使用默认值
   *  * order 绘制顺序，默认 "default" 即 rects 数组顺序；"area" 表示按面积从大到小排序
   */
  drawClientRects(
    rects: DOMRect[],
    {
      alpha = 0.6,
      clear = true,
      colors = void 0,
      order = "default",
    }: {
      alpha?: number;
      clear?: boolean;
      colors?: string[];
      order?: "default" | "area";
    } = {}
  ) {
    if (!rects.length) {
      return;
    }
    if (!Array.isArray(rects)) {
      rects = [...rects];
    }
    if (order === "area") {
      // 按面积从大到小排序，先画大的，后画小的
      rects.sort((a, b) => b.width * b.height - a.width * a.height);
    }
    if (!colors || colors.length !== rects.length) {
      colors = getColors(rects.length, alpha);
    }

    if (clear) {
      this.hub.clear();
      this.wrapper.textContent = "";
      this.wrapper.appendChild(this.hub.hubEl);
    }

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i] as DOMRect;
      const color = colors[i] || "#8888";
      const div = createRectDiv(rect, color);
      this.wrapper.appendChild(div);
      this.hub.addDraw(rect, div, color);
    }

    if (this.wrapper.parentNode !== document.body) {
      document.body.appendChild(this.wrapper);
    }
  }

  /**
   * 绘制单个 DOMRect 矩形, 并在 hub 中显示其信息
   * @param rect 要绘制的矩形
   * @param options
   *  * name 矩形名称，默认空字符串
   *  * color 矩形颜色，默认随机生成
   */
  drawClientRect(
    rect: DOMRect,
    {
      name = "",
      color = void 0,
    }: {
      name?: string;
      color?: string;
    } = {}
  ) {
    if (!color) {
      color = getColors(1)[0];
    }
    const div = createRectDiv(rect, color!);
    this.wrapper.appendChild(div);
    this.hub.addDraw(rect, div, color!, name);

    if (this.wrapper.parentNode !== document.body) {
      document.body.appendChild(this.wrapper);
    }
  }
}

export const rv = new RectVisualizer();
