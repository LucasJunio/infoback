import VehiclesController from '../controllers/VehiclesController'
import CommonRoute from './CommonRoute'

export default class VehiclesRoute extends CommonRoute {
  constructor(app) {
    super(VehiclesController, app, 'vehicles')
  }
}
