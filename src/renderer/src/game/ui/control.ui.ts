import { ControlsManager } from './controls-manager';

/* eslint-disable @typescript-eslint/no-empty-function */
export class Control {
  id: string;
  parent: ControlsManager;
  constructor(parent: ControlsManager) {
    this.parent = parent;
    this.id = parent.generateId();
    this.parent.addControl(this);
  }
  getElement(): HTMLElement | null {
    return this.parent.document.getElementById(this.id);
  }
  unrender(): void {
    const element = this.getElement();
    if (element) {
      element.remove();
    }
  }
  render(): void {
    const existingElement = this.getElement();
    const previousElement = existingElement?.previousElementSibling;
    this.unrender();
    this.onRender();
    const newElement = this.getElement();
    if (newElement && previousElement && previousElement.parentNode) {
      previousElement.parentNode.insertBefore(newElement, previousElement.nextSibling);
    }
  }
  onRender(): void {}

  onClick(): void {}
}
