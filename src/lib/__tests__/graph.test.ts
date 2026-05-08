import { describe, expect, it } from "vitest";
import { buildGraph, type Post } from "../graph";

describe("buildGraph", () => {
  it("creates post and entity nodes with edges", () => {
    const posts: Post[] = [
      {
        slug: "p1",
        entities: {
          company: ["SK hynix"],
        },
      },
    ];
    const graph = buildGraph(posts);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "post:p1",
      target: "entity:company:SK hynix",
      relation: "company",
    });
  });

  it("deduplicates shared entity nodes across posts", () => {
    const posts: Post[] = [
      { slug: "p1", entities: { company: ["SK hynix"] } },
      { slug: "p2", entities: { company: ["SK hynix"] } },
    ];
    const graph = buildGraph(posts);

    const sharedNode = graph.nodes.filter((node) => node.id === "entity:company:SK hynix");
    expect(sharedNode).toHaveLength(1);
    expect(graph.edges).toHaveLength(2);
  });

  it("handles posts without entities", () => {
    const posts: Post[] = [{ slug: "p1" }];
    const graph = buildGraph(posts);

    expect(graph.nodes).toEqual([
      {
        id: "post:p1",
        label: "p1",
        nodeType: "post",
        group: "post",
      },
    ]);
    expect(graph.edges).toHaveLength(0);
  });
});
