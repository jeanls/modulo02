import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../http/models/User';
import File from '../http/models/File';
import Appointment from '../http/models/Appointment';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
