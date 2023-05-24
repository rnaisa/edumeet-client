import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PERSIST } from 'redux-persist';
import { Permission } from '../../utils/roles';
import edumeetConfig from '../../utils/edumeetConfig';
import { roomActions } from './roomSlice';

export interface PermissionsState {
	loginEnabled?: boolean;
	loggedIn?: boolean;
	locked?: boolean;
	signInRequired?: boolean;
	permissions: Permission[];
}

const initialState: PermissionsState = {
	loginEnabled: true,
	loggedIn: false,
	locked: false,
	signInRequired: false,
	permissions: [],
};

const permissionsSlice = createSlice({
	name: 'permissions',
	initialState,
	reducers: {
		setLoginEnabled: ((state, action: PayloadAction<boolean>) => {
			state.loginEnabled = action.payload;
		}),
		setLoggedIn: ((state, action: PayloadAction<boolean>) => {
			state.loggedIn = action.payload;
		}),
		setLocked: ((state, action: PayloadAction<boolean>) => {
			state.locked = action.payload;
		}),
		setSignInRequired: ((state, action: PayloadAction<boolean>) => {
			state.signInRequired = action.payload;
		}),
		setPermissions: ((state, action: PayloadAction<Permission[]>) => {
			state.permissions = action.payload;
		}),
		addPermission: ((state, action: PayloadAction<Permission>) => {
			state.permissions.push(action.payload);
		}),
		removePermission: ((state, action: PayloadAction<Permission>) => {
			state.permissions = state.permissions.filter((p) => p !== action.payload);
		})
	},
	extraReducers: (builder) => {
		builder
			.addCase(PERSIST, (state) => {
				state.loginEnabled = edumeetConfig.loginEnabled;
			})
			.addCase(roomActions.setState, (state, action) => {
				if (action.payload === 'left') {
					state.loggedIn = false;
					state.locked = false;
					state.signInRequired = false;
					state.permissions = [];
				}
			});
	}
});

export const permissionsActions = permissionsSlice.actions;
export default permissionsSlice;