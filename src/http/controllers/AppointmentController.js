import { parseISO, startOfHour, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import validator from '../validations/appointmentValidator';
import consts from '../../config/consts';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
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
    return res.json(appointments);
  }

  async store(req, res) {
    if (!(await validator.store.isValid(req.body))) {
      return res.status(consts.badRequest).json({ error: 'Validation error.' });
    }

    const { provider_id, date } = req.body;
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return res
        .status(consts.unauthorized)
        .json({ error: 'User not authorized' });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res
        .status(consts.badRequest)
        .json({ error: 'Past dates are not permitted.' });
    }

    const checkAvaiability = await Appointment.findOne({
      where: { provider_id, date: hourStart, canceled_at: null },
    });

    if (checkAvaiability) {
      return res
        .status(consts.badRequest)
        .json({ error: 'Date is not avaiable.' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    const user = await User.findByPk(req.userId);
    const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(consts.unauthorized).json({ error: 'Unauthorized.' });
    }
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(consts.unauthorized).json({ error: 'Unauthorized.' });
    }
    appointment.canceled_at = new Date();
    appointment.save();
    await Queue.add(CancellationMail.key, { appointment });
    return res.status(consts.success).json(appointment);
  }
}

export default new AppointmentController();
