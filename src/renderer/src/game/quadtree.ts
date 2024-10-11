import { ParticleInstance } from "./particle-manager";

export class Quadtree {
  private MAX_OBJECTS = 4;
  private MAX_LEVELS = 5;

  private level: number;
  private bounds: { x: number; y: number; width: number; height: number };
  private objects: ParticleInstance[];
  private nodes: Quadtree[];

  constructor(level: number, bounds: { x: number; y: number; width: number; height: number }) {
    this.level = level;
    this.bounds = bounds;
    this.objects = [];
    this.nodes = [];
  }

  clear(): void {
    this.objects = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new Quadtree(this.level + 1, { x: x + subWidth, y: y, width: subWidth, height: subHeight });
    this.nodes[1] = new Quadtree(this.level + 1, { x: x, y: y, width: subWidth, height: subHeight });
    this.nodes[2] = new Quadtree(this.level + 1, { x: x, y: y + subHeight, width: subWidth, height: subHeight });
    this.nodes[3] = new Quadtree(this.level + 1, { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight });
  }

  getIndex(particle: ParticleInstance): number {
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const topQuadrant = particle.y < horizontalMidpoint;
    const bottomQuadrant = particle.y >= horizontalMidpoint;

    if (particle.x < verticalMidpoint) {
      if (topQuadrant) {
        return 1;
      } else if (bottomQuadrant) {
        return 2;
      }
    } else if (particle.x >= verticalMidpoint) {
      if (topQuadrant) {
        return 0;
      } else if (bottomQuadrant) {
        return 3;
      }
    }

    return -1;
  }

  insert(particle: ParticleInstance): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(particle);

      if (index !== -1) {
        this.nodes[index].insert(particle);
        return;
      }
    }

    this.objects.push(particle);

    if (this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  retrieve(returnObjects: ParticleInstance[], particle: ParticleInstance): ParticleInstance[] {
    const index = this.getIndex(particle);
    if (index !== -1 && this.nodes.length > 0) {
      this.nodes[index].retrieve(returnObjects, particle);
    }

    returnObjects.push(...this.objects);

    return returnObjects;
  }
}
