import yaml from "js-yaml";
import type { Node } from "../types.ts";

interface NodeMeta {
  id: string;
  title: string;
  prerequisites: string[];
  next: string[];
}

function extractDirectoryPath(metaPath: string): string {
  const withoutContent = metaPath.replace("/content/", "").replace("/meta.yaml", "");
  const parts = withoutContent.split("/");
  parts.pop();
  return parts.length > 0 ? parts.join("/") : "";
}

export async function loadNodes(): Promise<Node[]> {
  const metaModules = import.meta.glob("/content/**/meta.yaml", {
    query: "?raw",
    import: "default",
  });
  const contentModules = import.meta.glob("/content/**/content.md", {
    query: "?raw",
    import: "default",
  });

  const nodes: Node[] = [];

  for (const metaPath in metaModules) {
    const dirPath = metaPath.replace("/meta.yaml", "");
    const contentPath = `${dirPath}/content.md`;

    const metaRaw = (await metaModules[metaPath]()) as string;
    const meta = yaml.load(metaRaw) as NodeMeta;

    let text = "";
    if (contentModules[contentPath]) {
      text = (await contentModules[contentPath]()) as string;
    }

    const directoryPath = extractDirectoryPath(metaPath);

    nodes.push({
      id: meta.id,
      title: meta.title,
      text: text.trim(),
      prerequisites: meta.prerequisites || [],
      next: meta.next || [],
      directoryPath,
    });
  }

  return nodes;
}

