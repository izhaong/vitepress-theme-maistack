const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i;

/** 取封面 URL 末字符（去掉常见图片扩展名，避免 `.png` 的 g 干扰判定） */
function coverParityChar(cover: string): string {
  const trimmed = cover.trim();
  if (!trimmed) return "";
  return trimmed.replace(IMAGE_EXT, "").slice(-1);
}

/** 末字符 Unicode 偶数 → 右侧，奇数 → 左侧 */
export function isCoverOnRight(cover: string): boolean {
  const last = coverParityChar(cover);
  if (!last) return false;
  return last.charCodeAt(0) % 2 === 0;
}
