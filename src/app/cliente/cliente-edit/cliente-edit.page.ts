import { Component, OnInit } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  Firestore,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.page.html',
  styleUrls: ['./cliente-edit.page.scss'],
})
export class ClienteEditPage implements OnInit {
  
  registroForm = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl(''),
    apellido: new FormControl(''),
    fechaNacimiento: new FormControl(''),
    bienAsegurado: new FormControl(''),
    montoAsegurado: new FormControl(''),
  });

  clienteId: string | null = null;
  cliente: any = {};

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      console.log(params);
      this.clienteId = params.id;
    });

    if (this.clienteId) {
      this.obtenerCliente(this.clienteId);
    }
  }

  incluirCliente = () => {
    console.log('Aqui incluir en firebase');
    let clientesRef = collection(this.firestore, 'cliente');

    const fechaNacimientoValue = this.registroForm.value.fechaNacimiento;
    const fechaNacimientoTimestamp = fechaNacimientoValue 
      ? Timestamp.fromDate(new Date(fechaNacimientoValue))
      : null;

    addDoc(clientesRef, {
      ...this.registroForm.value,
      fechaNacimiento: fechaNacimientoTimestamp
    })
      .then((doc) => {
        console.log('Registro hecho');
        this.router.navigate(['/cliente-list']);
      })
      .catch((error) => {
        console.error('Error al crear el cliente:', error);
      });
  };

  editarCliente = (id: string) => {
    console.log('Aqui editar en firebase');
    let document = doc(this.firestore, 'cliente', id);

    const fechaNacimientoValue = this.registroForm.value.fechaNacimiento;
    const fechaNacimientoTimestamp = fechaNacimientoValue 
      ? Timestamp.fromDate(new Date(fechaNacimientoValue))
      : null;

    updateDoc(document, {
      ...this.registroForm.value,
      fechaNacimiento: fechaNacimientoTimestamp
    })
      .then((doc) => {
        console.log('Registro editado');
        this.router.navigate(['/cliente-list']);
      })
      .catch((error) => {
        console.error('Error al editar el cliente:', error);
      });
  };

  eliminarCliente = (id: string) => {
    console.log('Aqui editar en firebase');
    let document = doc(this.firestore, 'cliente', id);

    updateDoc(document, this.registroForm.value)
      .then((doc) => {
        console.log('Registro editado');
        this.router.navigate(['/cliente-list']);
      })
      .catch((error) => {
        console.error('Error al editar el cliente:', error);
      });
  };

  obtenerCliente = (id: string) => {
    console.log('Listar cliente');
    let documentRef = doc(this.firestore, 'cliente', id);

    getDoc(documentRef)
      .then((doc) => {
        if (doc.exists()) {
          console.log('Detalle del cliente:', doc.data());
          this.cliente = doc.data();
          this.registroForm.setValue({
            id: this.clienteId || '',
            nombre: this.cliente['nombre'] || '',
            apellido: this.cliente['apellido'] || '',
            fechaNacimiento: this.convertTimestampToDate(this.cliente['fechaNacimiento']),
            bienAsegurado: this.cliente['bienAsegurado'] || '',
            montoAsegurado: this.cliente['montoAsegurado'] || '',
          });
        } else {
          console.log('No se encontró el cliente con el ID proporcionado.');
        }
      })
      .catch((error) => {
        console.error('Error al consultar el cliente:', error);
      });
  };

  convertTimestampToDate(timestamp: Timestamp | null): string {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  };

  incluirOEditarCliente() {
    if (this.clienteId) {
      this.editarCliente(this.clienteId);
    } else {
      this.incluirCliente();
    }
  }
}
