// // utils/auth.js
// export const TEMP_ADMIN_LOGIN = {
//   username: "admin",
//   password: "789456123",
//   role: "admin",
//   token: "admin-token"
// };

// /**
//  * Checks if login matches temporary admin credentials.
//  * Returns user object if match, otherwise null.
//  */
// export function checkTempAdminLogin(username, password) {
//   return username === TEMP_ADMIN_LOGIN.username &&
//     password === TEMP_ADMIN_LOGIN.password
//     ? {
//         username,
//         role: TEMP_ADMIN_LOGIN.role,
//         isAdmin: true,
//         token: TEMP_ADMIN_LOGIN.token
//       }
//     : null;
// }
