import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public modals: IModal[] = [];

  constructor() { }

  isModalOpen(id: string): boolean {
    return !!this.modals.find(modal => modal.id === id)?.visible;
  }

  toggleModal(id: string) {
    const modal = this.modals.find(modal => modal.id === id);
    if (modal) modal.visible = !modal.visible;
  }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    });
  }

  unregister(id: string) {
    this.modals = this.modals.filter(modal => modal.id !== id);
  }
}
