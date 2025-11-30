import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Confirmação';
  @Input() message: string = 'Tem certeza que deseja realizar esta ação?';
  @Input() icon: string = 'pi pi-exclamation-triangle';
  @Input() severity: 'success' | 'info' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = 'danger';
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
    this.close();
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
