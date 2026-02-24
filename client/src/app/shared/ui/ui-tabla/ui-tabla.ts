import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface AccionTabla {
  urlIcono: string;
  accion: (registro: any) => void;
}

@Component({
  selector: 'app-ui-tabla',
  standalone: false,
  templateUrl: './ui-tabla.html',
  styleUrls: ['./ui-tabla.scss']
})
export class UiTabla {
  @Input() minWidth: string = "725px"

  @Input() theadData: string[] = [
    "columna1",
    "columna2",
    "columna3",
    "columna4",
    "columna5",
    "columna6",
    "columna7"
  ];

  @Input() acciones: AccionTabla[] = [
    {
      urlIcono: "icons/editar.svg",
      accion: (registro: any) => this.onEditar(registro)
    },
    {
      urlIcono: "icons/eliminar.svg",
      accion: (registro: any) => this.onEliminar(registro)
    }
  ];

  @Input() tbodyData: Array<any> = [
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
    {
      "columna1": "valor1",
      "columna2": "valor2",
      "columna3": "valor3",
      "columna4": "valor4",
      "columna5": "valor5",
      "columna6": "valor6",
      "columna7": "valor7",
    },
  ];

  @Output() editarRegistro = new EventEmitter<any>();
  @Output() eliminarRegistro = new EventEmitter<any>();
  @Output() accionPersonalizada = new EventEmitter<{ accion: string; registro: any }>();

  onEditar(fila: any): void {
    this.editarRegistro.emit(fila);
  }

  onEliminar(fila: any): void {
    this.eliminarRegistro.emit(fila);
  }

  ejecutarAccion(accion: AccionTabla, registro: any): void {
    accion.accion(registro);
  }
}
