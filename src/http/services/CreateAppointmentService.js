import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import UnauthorizedException from '../../exceptions/UnauthorizedException';
import BadRequestException from '../../exceptions/BadRequestException';
import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ userId, provider_id, date }) {
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      throw new UnauthorizedException();
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new BadRequestException({
        error: 'Past dates are not permitted.',
      });
    }

    const checkAvaiability = await Appointment.findOne({
      where: { provider_id, date: hourStart, canceled_at: null },
    });

    if (checkAvaiability) {
      throw new BadRequestException({ error: 'Date is not avaiable.' });
    }

    const appointment = await Appointment.create({
      user_id: userId,
      provider_id,
      date: hourStart,
    });

    const user = await User.findByPk(userId);
    const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    await Cache.invalidatePrefix(`user:${userId}:appointments`);
    return appointment;
  }
}

export default new CreateAppointmentService();
