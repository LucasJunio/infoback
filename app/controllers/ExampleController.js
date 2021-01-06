import CommonController from './CommonController'
import ExampleService from '../services/ExampleService'

export default class ExampleController extends CommonController {
  constructor() {
    // const attrs = require('../models/ExampleAttr')
    const attrs = () => {}
    super(ExampleService, attrs(), 'Example')
  }
}
