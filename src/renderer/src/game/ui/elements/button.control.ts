import { Control } from '../control.ui';

export class Button extends Control {
  text?: string;

  setText(text: string): void {
    this.text = text;
    this.render();
  }
  onRender(): void {
    const element = this.getElement();
    if (!element) {
      const button = this.parent.document.createElement('button');
      button.id = this.id;
      button.innerText = this.text || 'Button';
      button.onclick = (): void => {
        this.onClick();
      };
      this.parent.parent.appendChild(button);
    }
  }
}
