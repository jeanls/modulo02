import User from '../models/User';
import consts from '../../config/consts';

exports.grantAccess = (role) => {
  return async (req, res, next) => {
    if (role === 'provider') {
      const isUserProvider = await User.findOne({
        where: { id: req.userId, provider: true },
      });
      if (!isUserProvider) {
        return res.status(consts.unauthorized).json({ error: 'Unauthorized!' });
      }
    } else {
      const isUserCommon = await User.findOne({
        where: { id: req.userId, provider: false },
      });
      if (!isUserCommon) {
        return res.status(consts.unauthorized).json({ error: 'Unauthorized!' });
      }
    }
    return next();
  };
};
