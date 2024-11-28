import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Định nghĩa kiểu dữ liệu cho UserState
export interface UserState {
  id: string;
  fullname: string;
  email: string;
  role: string;
  profile_pic: string;
  token: string; // Bạn có thể để trống nếu không cần token
  selectedUser: string | null;
  onlineUser: string[];
  socketConnection: any | null;
}

const initialState: UserState = {
  id: "",
  fullname: "",
  email: "",
  role: "",
  profile_pic: "",
  token: "",
  selectedUser: null,
  onlineUser: [],
  socketConnection: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      // Cập nhật từng thuộc tính của state bằng giá trị từ action.payload
      state.id = action.payload.id || state.id;
      state.fullname = action.payload.fullname || state.fullname;
      state.email = action.payload.email || state.email;
      state.role = action.payload.role || state.role;
      state.profile_pic = action.payload.profile_pic || state.profile_pic;
    },
    logout: () => initialState,
    setOnlineUser: (state, action: PayloadAction<string[]>) => {
      state.onlineUser = action.payload;
    },
    setSocketConnection: (state, action: PayloadAction<any | null>) => {
      state.socketConnection = action.payload;
    },
  },
});
export const userSliceStore = (state: RootState) => state.user;
export const { setUser, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

export default userSlice.reducer;
