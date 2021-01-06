import CommonController from './CommonController'
import VehiclesService from '../services/VehiclesService'

export default class VehiclesController extends CommonController {
  constructor() {
    // const attrs = require('../models/ExampleAttr')
    const attrs = () => {}
    super(VehiclesService, attrs(), 'Vehicles')
  }
}
