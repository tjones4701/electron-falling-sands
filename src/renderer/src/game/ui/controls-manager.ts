import { Control } from './control.ui';

export class ControlsManager {
  public parent: HTMLDivElement;
  public document: Document;
  public controls: Control[] = [];

  constructor(div: HTMLDivElement) {
    this.parent = div;
    this.document = div.ownerDocument;
  }

  generateId(): string {
    const id = Math.random().toString(36).substring(7);
    if (this.document.getElementById(id)) {
      return this.generateId();
    }
    return id;
  }
  addControl(control: Control): void {
    this.controls.push(control);
    this.redraw();
  }

  redraw(): void {
    this.unrender();
    this.render();
  }
  unrender(): void {
    for (const control of this.controls) {
      control.unrender();
    }
  }
  render(): void {
    for (const control of this.controls) {
      control.render();
    }
  }
}
