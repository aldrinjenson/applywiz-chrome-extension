import reducer, { bgStoreStateType } from './reducer';
import { User } from '@supabase/supabase-js';

const initialState: bgStoreStateType = {
  user: null,
  counter: 0,
  extensionVersion: chrome.runtime.getManifest().version,
};

class Store {
  private state: bgStoreStateType;
  private listeners: ((state: bgStoreStateType) => void)[];
  private storageKey: string;

  constructor(storageKey: string, initialState: bgStoreStateType) {
    this.storageKey = storageKey;
    this.listeners = [];
    this.initState(initialState);
  }
  private initState(initialState: bgStoreStateType) {
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

  dispatch(action: string, data?: unknown) {
    const newState = reducer(this.state, action, data);
    if (newState !== this.state) {
      this.state = newState;
      // this.saveState();
      this.notifyListeners();
    }
  }

  subscribe(listener: (state: bgStoreStateType) => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (state: bgStoreStateType) => void) {
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

const store = new Store(storageKey, initialState);

export default store;
