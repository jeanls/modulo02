import {
  startOfDay,
  endOfDay,
  setMinutes,
  setSeconds,
  setHours,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import consts from '../../config/consts';
import Appointment from '../models/Appointment';

class AvaiableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(consts.badRequest).json({ error: 'Invalid date!' });
    }
    const searchDate = Number(date);
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: [['date', 'ASC']],
    });
    const scheduleHours = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];
    const avaiable = scheduleHours.map((time) => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaiable:
          isAfter(value, new Date()) &&
          !appointments.find((item) => format(item.date, 'HH.mm') === time),
      };
    });
    return res.json(avaiable);
  }
}

export default new AvaiableController();
