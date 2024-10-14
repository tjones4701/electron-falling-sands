import { Control } from '../control.ui';

export class Label extends Control {
  text?: string;

  setText(text: string): void {
    this.text = text;
    this.render();
  }

  onRender(): void {
    const element = this.getElement();
    if (!element) {
      const label = this.parent.document.createElement('label');
      label.id = this.id;
      label.innerText = this.text || 'Label';
      this.parent.parent.appendChild(label);
    }
  }
}
