import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';
import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const cacheKey = `user:${req.userId}:appointments:${page}`;
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      offset: (page - 1) * 20,
      limit: 20,
      attributes: ['id', 'date', 'past', 'cancelable'],
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'url', 'path'] },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'url', 'path'] },
          ],
        },
      ],
    });
    Cache.set(cacheKey, appointments);
    return res.json(appointments);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;
    const appointment = await CreateAppointmentService.run({
      userId: req.userId,
      provider_id,
      date,
    });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      appointment_id: req.params.id,
      user_id: req.userId,
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
