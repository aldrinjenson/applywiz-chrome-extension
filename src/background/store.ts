import reducer from './reducer';

class Store {
  private state: any;
  private listeners: ((state: any) => void)[];
  private storageKey: string;

  constructor(storageKey: string, initialState: any) {
    this.storageKey = storageKey;
    this.listeners = [];
    this.initState(initialState);
  }
  private initState(initialState: JSON) {
    this.state = initialState;
    // chrome.storage.sync.get(this.storageKey, (result) => {
    //   const storedData = result?.[this.storageKey];

    //   if (!storedData) {
    //     // Running extension for the first time
    //     this.state = initialState;
    //     this.saveState();
    //     this.notifyListeners();
    //     return;
    //   }

    //   const storedExtensionVersion = storedData.extensionVersion;
    //   if (
    //     !storedExtensionVersion ||
    //     storedExtensionVersion < initialState.extensionVersion
    //   ) {
    //     // Running new version for the first time
    //     this.state = { ...storedData, ...initialState };
    //   } else {
    //     // Running same version for the second time
    //     this.state = storedData;
    //   }

    //   this.notifyListeners();
    // });
  }

  getState() {
    return this.state;
  }

  dispatch(action: string, data?: any) {
    const newState = reducer(this.state, action, data);
    if (newState !== this.state) {
      this.state = newState;
      this.saveState();
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

  private saveState() {
    // console.log('saving state');
    // const data = {
    //   [this.storageKey]: this.state,
    // };
    // chrome.storage.sync.set(data);
  }
}

const storageKey = 'applyWizstoreData';
const initialState = {
  user: null,
  counter: 0,
  extensionVersion: chrome.runtime.getManifest().version,
};

const store = new Store(storageKey, initialState);

export default store;
