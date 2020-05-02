import consts from '../../config/consts';
import AvaiableService from '../services/AvaiableService';

class AvaiableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(consts.badRequest).json({ error: 'Invalid date!' });
    }
    const searchDate = Number(date);
    const avaiable = await AvaiableService.run({
      provider_id: req.params.providerId,
      searchDate,
    });
    return res.json(avaiable);
  }
}

export default new AvaiableController();
