// Interfaz común de todos los proveedores de texto bíblico.
export class BibleProvider {
  async listBooks(_version) { throw new Error('No implementado'); }
  async getPassage(_version, _referencia) { throw new Error('No implementado'); }
  async search(_version, _texto, _opciones) { throw new Error('No implementado'); }
}
