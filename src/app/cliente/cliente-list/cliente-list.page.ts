import { Component, OnInit } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, Firestore, Timestamp } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
})
export class ClienteListPage implements OnInit {
  constructor(
    private readonly firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  clientesArray: any[] = [];
  isSearch: boolean = false;
  query: string = "";
  listaClientes: any[] = [];
  lastVisible = null;

  clickSearch = () => {
    this.isSearch = true;
  }

  clearSearch = () => {
    this.isSearch = false;
    this.query = "";
    this.filtrarClientes();
  }
  
  buscarSearch = (e: any) => {
    this.query = e.target.value.toLowerCase();
    this.filtrarClientes();
  }

  ngOnInit() {
    this.listarClientes();
  }

  listarClientes = () => {
    console.log('Listar clientes');
    const clientesRef = collection(this.firestore, 'cliente');
    collectionData(clientesRef, { idField: 'id' }).subscribe((respuesta) => {
      this.clientesArray = respuesta.map(cliente => {
        return {
          ...cliente,
          fechaNacimiento: cliente['fechaNacimiento'] ? this.convertTimestampToDate(cliente['fechaNacimiento']) : ''
        };
      });
      this.filtrarClientes();  // Filtrar los clientes después de cargar los datos
      console.log('Estos son los clientes', this.clientesArray);
    });
  };

  filtrarClientes = () => {
    if (this.query.trim() === "") {
      this.listaClientes = [...this.clientesArray];
    } else {
      this.listaClientes = this.clientesArray.filter(cliente => 
        cliente.nombre.toLowerCase().includes(this.query)
      );
    }
  }

  convertTimestampToDate(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  };

  async eliminarClienteConfirmacion(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmación',
      message: '¿Estás seguro que deseas eliminar este cliente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarCliente(id);
          },
        },
      ],
    });
    await alert.present();
  }

  eliminarCliente = async (id: string) => {
    try {
      await deleteDoc(doc(this.firestore, 'cliente', id));
      console.log('Archivo eliminado: ' + id);
      this.clientesArray = this.clientesArray.filter(cliente => cliente.id !== id);
      this.filtrarClientes();  // Actualizar la lista filtrada después de eliminar
    } catch (error) {
      console.error('Algo salió mal al eliminar: ' + error);
    }
  }
}
