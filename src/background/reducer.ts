function reducer(state: any, action: string, data?: any) {
  switch (action) {
    case 'SET_USER':
      return { ...state, user: data };

    // Add more cases for other actions

    default:
      return state;
  }
}

export default reducer;
