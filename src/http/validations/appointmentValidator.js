import * as Yup from 'yup';

export default {
  store: Yup.object().shape({
    date: Yup.date().required(),
    provider_id: Yup.number().required(),
  }),
};
