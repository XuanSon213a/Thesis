import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Định nghĩa kiểu dữ liệu cho UserState
export interface UserState {
  id: string;
  mongoId: string;
  fullname: string;
  email: string;
  role: string;
  profile_pic: string;
  token: string; // Có thể là token JWT nếu cần
  selectedUser: string | null;
  onlineUser: string[];
  socketConnection: any | null;
}

const initialState: UserState = {
  id: "",
  mongoId: "",
  fullname: "",
  email: "",
  role: "", // Nếu không có role, để mặc định là string rỗng
  profile_pic: "",
  token: "", // Để trống nếu không có token
  selectedUser: null,
  onlineUser: [],
  socketConnection: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      // Cập nhật state từ action.payload, nếu không có giá trị, giữ nguyên giá trị cũ của state
      state.id = action.payload.id || state.id; // Gán MySQL ID vào `id`
      state.mongoId = action.payload.mongoId || state.mongoId; // Gán MongoDB ID vào `mongoId`
      state.fullname = action.payload.fullname || state.fullname;
      state.email = action.payload.email || state.email;
      state.role = action.payload.role || state.role; // Gán role nếu có
      state.profile_pic = action.payload.profile_pic || state.profile_pic; // Gán profile_pic nếu có
      state.token = action.payload.token || state.token; // Gán token nếu có
    },
    logout: () => initialState, // Khi logout, reset state về giá trị mặc định
    setOnlineUser: (state, action: PayloadAction<string[]>) => {
      state.onlineUser = action.payload; // Cập nhật danh sách người dùng online
    },
    setSocketConnection: (state, action: PayloadAction<any | null>) => {
      state.socketConnection = action.payload; // Cập nhật thông tin kết nối socket
    },
  },
});

export const { setUser, logout, setOnlineUser, setSocketConnection } = userSlice.actions;

export default userSlice.reducer;
