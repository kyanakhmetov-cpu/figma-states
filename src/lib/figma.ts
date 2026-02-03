export type ParsedFigmaUrl = {
  isValid: boolean;
  fileKey?: string;
  nodeId?: string;
};

const FIGMA_HOST_RE = /(^|\.)figma\.com$/i;

export function parseFigmaUrl(raw: string): ParsedFigmaUrl {
  try {
    const url = new URL(raw);
    const isFigmaHost = FIGMA_HOST_RE.test(url.hostname);
    if (!isFigmaHost) {
      return { isValid: false };
    }

    const fileMatch =
      url.pathname.match(/\/(file|design|proto)\/([a-zA-Z0-9]+)/) ??
      url.pathname.match(/\/community\/file\/([a-zA-Z0-9]+)/);

    const fileKey = fileMatch
      ? fileMatch[2] ?? fileMatch[1]
      : undefined;

    const nodeParam =
      url.searchParams.get("node-id") ?? url.searchParams.get("node_id");
    const nodeId = nodeParam
      ? normalizeNodeId(nodeParam)
      : undefined;

    return {
      isValid: true,
      fileKey,
      nodeId,
    };
  } catch {
    return { isValid: false };
  }
}

function normalizeNodeId(nodeId: string) {
  if (/^\d+-\d+$/.test(nodeId)) {
    return nodeId.replace("-", ":");
  }
  return nodeId;
}
