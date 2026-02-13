export type Node = {
  id: string;
  title: string;
  text: string;
  prerequisites: string[];
  next: string[];
  directoryPath: string;
};

export type View = {
  id: string;
  name: string;
  nodeIds: string[];
  childViewIds: string[];
  parentViewId: string | null;
};
