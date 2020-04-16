import User from '../models/User';
import consts from '../../config/consts';
import userValidator from '../validations/userValidator';

class UserController {
  async store(req, res) {
    if (!(await userValidator.store.isValid(req.body))) {
      return res
        .status(consts.badRequest)
        .json({ error: 'Validation fields failed.' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res
        .status(consts.badRequest)
        .json({ error: 'User.email already exists.' });
    }
    const { id, name, email } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    // const validResponse = userValidator.update.validateSync(req.body);
    if (!(await userValidator.update.isValid(req.body))) {
      return res
        .status(consts.badRequest)
        .json({ error: 'Validation fields failed.' });
    }
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(consts.badRequest)
          .json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.passwordVerification(oldPassword))) {
      return res
        .status(consts.badRequest)
        .json({ error: 'Password does not match.' });
    }
    const { id, name, provider } = await user.update(req.body);
    return res.json({ id, name, provider });
  }
}

export default new UserController();
