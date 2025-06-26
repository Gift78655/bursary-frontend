// 📁 src/utils/auth.js
export const getStudentId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.student_id || null;
};

export const getAdminId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.admin_id || null;
};
