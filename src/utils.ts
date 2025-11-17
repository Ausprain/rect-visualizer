/**
 * 获取 size 个透明浅背景色
 * @param size 颜色数量
 * @param alpha 透明度 (0-1), 默认为 0.6, 不在范围内也是 0.6
 * @returns 颜色数组
 */
export const getColors = (size: number, alpha = 0.6) => {
  if (alpha <= 0 || alpha > 1) {
    alpha = 0.6;
  }
  const colors = [];
  for (let i = 0; i < size; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    colors.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
  }
  return colors;
};

/**
 * 创建一个矩形 div 元素, 带有 1px 实线边框，避免宽或高为 0 时看不见
 * @param rect 矩形区域
 * @param bgColor 背景颜色
 * @returns 矩形 div 元素, 绝对定位, 偏移量使用 rect.top/left
 */
export const createRectDiv = (rect: DOMRect, bgColor: string) => {
  const div = document.createElement("div");
  Object.assign(div.style, {
    position: "absolute",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: bgColor,
    backgroundColor: bgColor,
    boxSizing: "border-box",
  } as CSSStyleDeclaration);
  return div;
};
