// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // ---------------------------
// // LOGIN ACTION
// // ---------------------------
// export const login = createAsyncThunk(
//   "auth/login",
//   async ({ username, password }, { rejectWithValue }) => {
//     try {
//       let users = JSON.parse(localStorage.getItem("users")) || [];

//       const fallbackUsers = [
//         {
//           username: "admin",
//           password: "admin123",
//           role: "Admin",
//           active: true,
//           regions: ["Bharat"],
//         },
//         {
//           username: "manager1",
//           password: "manager123",
//           role: "Manager",
//           active: true,
//           regions: ["Maharashtra", "Karnataka"],
//         },
//         {
//           username: "user1",
//           password: "user123",
//           role: "Normal User",
//           active: true,
//           regions: ["Gujarat"],
//         },
//       ];

//       users = [...fallbackUsers, ...users];

//       const foundUser = users.find(
//         (u) => u.username === username && u.password === password
//       );

//       if (!foundUser) return rejectWithValue("❌ Invalid credentials");
//       if (!foundUser.active)
//         return rejectWithValue("❌ User is deactivated. Contact admin.");

//       const userObj = {
//         username: foundUser.username,
//         role: foundUser.role,
//         isAdmin: foundUser.role?.toLowerCase() === "admin",
//         regions: Array.isArray(foundUser.regions) ? foundUser.regions : [],
//       };

//       const token = "fake-jwt-token-123";
//       const loginTime = new Date().toISOString();

//       localStorage.setItem("currentUser", JSON.stringify(userObj));
//       localStorage.setItem("token", token);
//       localStorage.setItem("loginTime", loginTime);

//       return { user: userObj, token, loginTime };
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // ---------------------------
// // RESTORE SESSION
// // ---------------------------
// export const restoreSession = createAsyncThunk(
//   "auth/restoreSession",
//   async (_, { rejectWithValue }) => {
//     const token = localStorage.getItem("token");
//     const user = localStorage.getItem("currentUser");
//     const loginTime = localStorage.getItem("loginTime");

//     if (!token || !user || !loginTime)
//       return rejectWithValue("No session found");
//     return { user: JSON.parse(user), token, loginTime };
//   }
// );

// // ---------------------------
// // CREATE USER ACTION
// // ---------------------------
// export const createUser = createAsyncThunk(
//   "auth/createUser",
//   async ({ username, password, role, regions }, { rejectWithValue }) => {
//     try {
//       let users = JSON.parse(localStorage.getItem("users")) || [];
//       if (users.find((u) => u.username === username)) {
//         return rejectWithValue("❌ Username already exists");
//       }

//       const newUser = { username, password, role, active: true, regions };
//       users.push(newUser);
//       localStorage.setItem("users", JSON.stringify(users));
//       return newUser;
//     } catch (err) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // ---------------------------
// // SLICE
// // ---------------------------
// const initialState = {
//   user: JSON.parse(localStorage.getItem("currentUser")) || null,
//   token: localStorage.getItem("token") || null,
//   loginTime: localStorage.getItem("loginTime") || null,
//   loading: false,
//   error: null,
//   message: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.loginTime = null;
//       state.loading = false;
//       state.error = null;
//       state.message = null;

//       localStorage.removeItem("currentUser");
//       localStorage.removeItem("token");
//       localStorage.removeItem("loginTime");
//     },
//     clearMessage(state) {
//       state.message = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.loginTime = action.payload.loginTime;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(restoreSession.fulfilled, (state, action) => {
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.loginTime = action.payload.loginTime;
//       })
//       .addCase(restoreSession.rejected, (state) => {
//         state.user = null;
//         state.token = null;
//         state.loginTime = null;
//       })
//       .addCase(createUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createUser.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(createUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout, clearMessage } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ---------------------------
// LOGIN ACTION
// ---------------------------
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      let users = JSON.parse(localStorage.getItem("users")) || [];

      const fallbackUsers = [
        {
          username: "admin",
          password: "admin123",
          role: "Admin",
          active: true,
          regions: ["Bharat"]
        },
        {
          username: "manager1",
          password: "manager123",
          role: "Manager",
          active: true,
          regions: ["Maharashtra", "Karnataka"]
        },
        {
          username: "user1",
          password: "user123",
          role: "Normal User",
          active: true,
          regions: ["Gujarat"]
        }
      ];

      users = [...fallbackUsers, ...users];

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!foundUser) return rejectWithValue("❌ Invalid credentials");
      if (!foundUser.active)
        return rejectWithValue("❌ User is deactivated. Contact admin.");

      const userObj = {
        username: foundUser.username,
        role: foundUser.role,
        isAdmin: foundUser.role?.toLowerCase() === "admin",
        regions: Array.isArray(foundUser.regions) ? foundUser.regions : []
      };

      const token = "fake-jwt-token-123";
      const loginTime = new Date().toISOString();

      localStorage.setItem("currentUser", JSON.stringify(userObj));
      localStorage.setItem("token", token);
      localStorage.setItem("loginTime", loginTime);

      return { user: userObj, token, loginTime };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------------------
// RESTORE SESSION
// ---------------------------
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("currentUser");
    const loginTime = localStorage.getItem("loginTime");

    if (!token || !user || !loginTime)
      return rejectWithValue("No session found");
    return { user: JSON.parse(user), token, loginTime };
  }
);

// ---------------------------
// CREATE USER ACTION
// ---------------------------
export const createUser = createAsyncThunk(
  "auth/createUser",
  async ({ username, password, role, regions }, { rejectWithValue }) => {
    try {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find((u) => u.username === username)) {
        return rejectWithValue("❌ Username already exists");
      }

      const newUser = { username, password, role, active: true, regions };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      return newUser;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ---------------------------
// SLICE
// ---------------------------
const initialState = {
  user: JSON.parse(localStorage.getItem("currentUser")) || null,
  token: localStorage.getItem("token") || null,
  loginTime: localStorage.getItem("loginTime") || null,
  loading: false,
  error: null,
  message: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.loginTime = null;
      state.loading = false;
      state.error = null;
      state.message = null;

      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
    },
    clearMessage(state) {
      state.message = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loginTime = action.payload.loginTime;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loginTime = action.payload.loginTime;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loginTime = null;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearMessage } = authSlice.actions;
export default authSlice.reducer;
