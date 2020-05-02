import { createStore } from 'redux';

const INITIAL_STATE = {
    data: {
        "name": '',
        "token": ''
    },
};

function user(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'UPDATE_USER':
            return { state, data: action.user }
            break;

        default:
            return state
            break;
    }
}

const store = createStore(user);

export default store;