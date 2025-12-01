import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Serviço para gerenciar loading específico de componentes
 * Permite que cada componente tenha seu próprio estado de loading
 * independente do loading global da aplicação
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentLoadingService {

  private loadingSubjects = new Map<string, BehaviorSubject<boolean>>();

  /**
   * Registra um novo BehaviorSubject para um componente específico
   * @param componentId ID único do componente
   * @returns BehaviorSubject para controlar o loading
   */
  registerComponent(componentId: string): BehaviorSubject<boolean> {
    if (this.loadingSubjects.has(componentId)) {
      return this.loadingSubjects.get(componentId)!;
    }

    const subject = new BehaviorSubject<boolean>(false);
    this.loadingSubjects.set(componentId, subject);

    return subject;
  }

  /**
   * Obtém o BehaviorSubject de um componente específico
   * @param componentId ID único do componente
   * @returns BehaviorSubject ou null se não encontrado
   */
  getComponentLoading(componentId: string): BehaviorSubject<boolean> | null {
    return this.loadingSubjects.get(componentId) || null;
  }

  /**
   * Remove o registro de um componente (útil para cleanup)
   * @param componentId ID único do componente
   */
  unregisterComponent(componentId: string): void {
    const subject = this.loadingSubjects.get(componentId);
    if (subject) {
      subject.complete();
      this.loadingSubjects.delete(componentId);
    }
  }

  /**
   * Obtém um Observable para o loading de um componente
   * @param componentId ID único do componente
   * @returns Observable<boolean> ou null se não encontrado
   */
  getComponentLoadingObservable(componentId: string): Observable<boolean> | null {
    const subject = this.getComponentLoading(componentId);
    return subject ? subject.asObservable() : null;
  }
}
