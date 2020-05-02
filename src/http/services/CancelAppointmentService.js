import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import UnauthorizedException from '../../exceptions/UnauthorizedException';
import BadRequestException from '../../exceptions/BadRequestException';
import Queue from '../../lib/Queue';
import CancellationMail from '../../jobs/CancellationMail';

class CancelAppointmentService {
  async run({ appointment_id, user_id }) {
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
      ],
    });
    if (appointment.user_id !== user_id) {
      throw new UnauthorizedException();
    }
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      throw new BadRequestException();
    }
    appointment.canceled_at = new Date();
    appointment.save();
    await Queue.add(CancellationMail.key, { appointment });
    return appointment;
  }
}

export default new CancelAppointmentService();
