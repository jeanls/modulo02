export default {
  success: 200,
  notFound: 404,
  unauthorized: 401,
  badRequest: 400,
  appKey: process.env.APP_SECRET,
  tokenDuration: '7d',
  userProvider: 'provider',
  userCommon: 'common',
};
