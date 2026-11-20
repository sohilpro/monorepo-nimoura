export default defineEventHandler(async (event) => {
  deleteCookie(event, 'accesstoken', {
    path: '/',
  });

  return {
    success: true,
    message: 'با موفقیت از حساب کاربری خارج شدید',
  };
});
