import Notification from '../schemas/Notification';
import consts from '../../config/consts';

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findById(req.params.id);
    if (notification.user !== req.userId) {
      return res.status(consts.unauthorized).json({ error: 'Unauthorized.' });
    }
    notification.read = true;
    await Notification.update({ _id: req.params.id }, { read: true });
    return res.status(consts.success).json(notification);
  }
}

export default new NotificationController();
