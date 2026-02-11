import type { Node } from "../types.ts";

export function validateNode(node: Node, allNodes: Node[], isEdit: boolean = false): string | null {
  if (!node.id.trim()) {
    return "ID is required";
  }

  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(node.id)) {
    return "ID must be kebab-case (lowercase letters, numbers, and hyphens only)";
  }

  if (!isEdit) {
    const existingNode = allNodes.find(n => n.id === node.id);
    if (existingNode) {
      return "ID must be unique";
    }
  }

  if (!node.text.trim()) {
    return "Text cannot be empty";
  }

  for (const prereqId of node.prerequisites) {
    const prereqExists = allNodes.some(n => n.id === prereqId);
    if (!prereqExists && prereqId !== node.id) {
      return `Prerequisite "${prereqId}" does not exist`;
    }
  }

  return null;
}

