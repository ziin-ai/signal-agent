export interface Post {
  slug: string;
  entities?: Record<string, string[]>;
}

export interface GraphNode {
  id: string;
  label: string;
  nodeType: "post" | "entity";
  group: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraph(posts: Post[]): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

  for (const post of posts) {
    const postNodeId = `post:${post.slug}`;
    nodeMap.set(postNodeId, {
      id: postNodeId,
      label: post.slug,
      nodeType: "post",
      group: "post",
    });

    const entities = post.entities ?? {};
    for (const [relation, values] of Object.entries(entities)) {
      for (const value of values) {
        const entityNodeId = `entity:${relation}:${value}`;
        if (!nodeMap.has(entityNodeId)) {
          nodeMap.set(entityNodeId, {
            id: entityNodeId,
            label: value,
            nodeType: "entity",
            group: relation,
          });
        }

        const edgeId = `${postNodeId}->${entityNodeId}`;
        edgeMap.set(edgeId, {
          id: edgeId,
          source: postNodeId,
          target: entityNodeId,
          relation,
          weight: 1,
        });
      }
    }
  }

  return {
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  };
}
