export class GeneralStore {
  private state: object;

  constructor(initialState: object = {}) {
    this.state = initialState;
  }

  setState(newState: object = {}) {
    this.state = { ...this.state, ...newState };
  }

  getState() {
    return this.state;
  }
}
