export class GeneralStore {
  private state: any;

  constructor(initialState: any = {}) {
    this.state = initialState;
  }

  setState(newState: any = {}) {
    this.state = { ...this.state, ...newState };
  }

  getState() {
    return this.state;
  }
}
