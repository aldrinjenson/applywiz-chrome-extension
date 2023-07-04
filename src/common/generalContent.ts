import store from '../background/store';

console.log('running from content script');

// Example usage
store.subscribe((state) => {
  // Update UI based on state changes
  //   console.log('User:', state.user);
  console.log(state);

  console.log('Counter:', state.counter);
});

console.log('sotore');

console.log(store);
