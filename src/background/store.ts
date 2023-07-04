import reducer from './reducer';

class Store {
  private state: any;
  private listeners: ((state: any) => void)[];

  constructor(initialState: any) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  dispatch(action: string, data?: any) {
    const newState = reducer(this.state, action, data);
    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  subscribe(listener: (state: any) => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (state: any) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

const initialState = {
  user: null,
};

const store = new Store(initialState);

export default store;
