import jwt from 'jsonwebtoken';
import consts from '../../config/consts';

import User from '../models/User';

class AuthController {
  async login(request, response) {
    const { email, password } = request.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response
        .status(consts.unauthorized)
        .json({ error: 'Unauthorized' });
    }

    if (!(await user.passwordVerification(password))) {
      return response
        .status(consts.unauthorized)
        .json({ error: 'Unauthorized' });
    }

    const { id, name } = user;
    return response.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, consts.appKey, {
        expiresIn: consts.tokenDuration,
      }),
    });
  }
}

export default new AuthController();
