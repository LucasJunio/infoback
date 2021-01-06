'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename  = path.basename(__filename)

console.log(process.env.DB_NAME, process.env.DB_USERNAME)
// const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {

var db = {}

function readModelAttrs() {
  db.modelAttrs = []
  fs
    .readdirSync(__dirname)
    .filter(file => (
      file.includes('Attr') &&
      file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js')
    )
    .forEach(file => {
      db.modelAttrs.push(file)
    })
}

function getInstance() {
  if (db.sequelize) return db

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
      define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        timestamps: true
      },
      host: process.env.DB_HOST,
      warnings: false,
      logging: process.env.SEQUELIZE_LOG==='true' || process.env.NODE_ENV != 'production',
      dialect: process.env.DB_DIALECT
    })
  const PaperTrail = require('sequelize-paper-trail').init(sequelize, {
    mysql: true,
    tableUnderscored: true,
    underscored: true,
    underscoredAttributes: true,
    tableName: 'revisions',
    // log: function() {console.log('[papertrail]', ...arguments)},
    debug: process.env.NODE_ENV != 'production' && process.env.LOG_PAPERTRAIL === 'true'
  })
  PaperTrail.defineModels()

  readModelAttrs()
  // db = {...db, ...()}
  fs
    .readdirSync(__dirname)
    .filter(file => (
      !file.includes('Attr') &&
      file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file !== 'Revision') &&
      (file.slice(-3) === '.js')
    )
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
      // const model = sequelize['import'](path.join(__dirname, file))
      db[model.name] = model
      if (!model.name.includes('Revision'))
        db[model.name].Revisions = db[model.name].hasPaperTrail()
    })

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  // db.Example.belongsTo(db.Another, { foreignKey: 'another_id', constraints: false })
  // db.Another.hasOne(db.Example, { foreignKey: 'another_id', constraints: false })

  // Company: Address, Contact, Segment, Contenttype, TypeCompany, Audience
  db.Address.hasOne(db.Company, { foreignKey: 'id_address' })
  db.Company.belongsTo(db.Address, { foreignKey: 'id_address' })

  db.Company.hasMany(db.Contact, { foreignKey: 'id_company' })
  db.Contact.belongsTo(db.Company, { foreignKey: 'id_company' })
  db.Company.belongsTo(db.Segment, { foreignKey: 'id_segment' })
  db.Segment.hasOne(db.Company, { foreignKey: 'id_segment' })
  db.Company.belongsToMany(db.Contenttype, { foreignKey: 'id_company', through: db.TypeCompany })
  db.Contenttype.belongsToMany(db.Company, { foreignKey: 'id_contenttype', through: db.TypeCompany })
  db.Company.hasMany(db.Audience, { foreignKey: 'id_company' })
  db.Audience.belongsTo(db.Company, { foreignKey: 'id_company' })
  db.User.hasOne(db.Company, { foreignKey: 'id_user', as: 'CompanyManaged' })
  db.Company.belongsTo(db.User, { foreignKey: 'id_user', as: 'CompanyManaged' })
  db.User.belongsTo(db.Company, { foreignKey: 'id_company', as: 'Company', constraints: false })
  db.Company.hasMany(db.User, { foreignKey: 'id_company', as: 'Company', constraints: false })

  // User: UserInterest, UserConquest, Resultrepresentational, SkillUser
  db.User.belongsToMany(db.Interest, { foreignKey: 'id_user', through: db.UserInterest })
  db.Interest.belongsToMany(db.User, { foreignKey: 'id_interest', through: db.UserInterest })
  db.User.belongsToMany(db.Conquest, { foreignKey: 'id_user', through: db.UserConquest })
  db.Conquest.belongsToMany(db.User, { foreignKey: 'id_conquest', through: db.UserConquest })
  db.User.hasMany(db.Resultrepresentational, { foreignKey: 'id_user' })
  db.Resultrepresentational.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.belongsToMany(db.Skill, { foreignKey: 'id_user', through: db.SkillUser })
  db.Skill.belongsToMany(db.User, { foreignKey: 'id_skill', through: db.SkillUser })
  db.User.hasMany(db.SkillUser, { foreignKey: 'id_user' })
  db.SkillUser.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Skill.hasMany(db.SkillUser, { foreignKey: 'id_skill' })
  db.SkillUser.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.User.hasMany(db.AuthenticationProvider, { foreignKey: 'id_user' })
  db.AuthenticationProvider.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.belongsToMany(db.QuestionEvaluation, { foreignKey: 'id_user', through: db.HistoryAnswer })
  db.QuestionEvaluation.belongsToMany(db.User, { foreignKey: 'id_question_evaluation', through: db.HistoryAnswer })
  db.User.hasMany(db.HistoryAnswer, { foreignKey: 'id_user' })
  db.HistoryAnswer.belongsTo(db.User, { foreignKey: 'id_user' })
  db.QuestionEvaluation.hasMany(db.HistoryAnswer, { foreignKey: 'id_question_evaluation' })
  db.HistoryAnswer.belongsTo(db.QuestionEvaluation, { foreignKey: 'id_question_evaluation' })
  db.User.hasMany(db.Participants, { foreignKey: 'id_user' })
  db.Participants.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Event.hasMany(db.Participants, { foreignKey: 'id_event' })
  db.Participants.belongsTo(db.Event, { foreignKey: 'id_event' })
  db.User.hasMany(db.Formation, { foreignKey: 'id_user' })
  db.Formation.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.hasMany(db.Experience, { foreignKey: 'id_user' })
  db.Experience.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.hasMany(db.Extra, { foreignKey: 'id_user' })
  db.Extra.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.hasMany(db.Pdi, { foreignKey: 'id_user' })
  db.Pdi.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Grouptype.hasMany(db.Group, { foreignKey: 'id_grouptype' })
  db.Group.belongsTo(db.Grouptype, { foreignKey: 'id_grouptype' })
  db.Group.hasMany(db.UserGroup, { foreignKey: 'id_group' })
  db.UserGroup.belongsTo(db.Group, { foreignKey: 'id_group' })
  db.User.hasMany(db.UserGroup, { foreignKey: 'id_user' })
  db.UserGroup.belongsTo(db.User, { foreignKey: 'id_user' })
  db.User.belongsToMany(db.Content, { foreignKey: 'id_user', through: db.UserContent })
  db.Content.belongsToMany(db.User, { foreignKey: 'id_content', through: db.UserContent })
  db.User.hasMany(db.UserContent, { foreignKey: 'id_user' })
  db.UserContent.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Content.hasMany(db.UserContent, { foreignKey: 'id_content' })
  db.UserContent.belongsTo(db.Content, { foreignKey: 'id_content' })
  db.User.hasMany(db.OfficeHistory, { foreignKey: 'id_user' })
  db.OfficeHistory.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Office.hasMany(db.OfficeHistory, { foreignKey: 'id_office' })
  db.OfficeHistory.belongsTo(db.Office, { foreignKey: 'id_office' })
  db.User.hasOne(db.Privacy, { foreignKey: 'id_user' })
  db.Privacy.belongsTo(db.User, { foreignKey: 'id_user' })






  // Office: Audience, User, OfficeSkill
  db.Office.hasMany(db.Audience, { foreignKey: 'id_office' })
  db.Audience.belongsTo(db.Office, { foreignKey: 'id_office' })
  db.Office.hasMany(db.User, { foreignKey: 'id_office' })
  db.User.belongsTo(db.Office, { foreignKey: 'id_office' })
  db.Office.belongsToMany(db.Skill, { foreignKey: 'id_office', through: db.OfficeSkill })
  db.Skill.belongsToMany(db.Office, { foreignKey: 'id_skill', through: db.OfficeSkill })
  db.Office.hasMany(db.OfficeSkill, { foreignKey: 'id_office' })
  db.OfficeSkill.belongsTo(db.Office, { foreignKey: 'id_office' })
  db.Skill.hasMany(db.OfficeSkill, { foreignKey: 'id_skill' })
  db.OfficeSkill.belongsTo(db.Skill, { foreignKey: 'id_skill' })

  // Department: Office, DepartmentContent
  db.Department.hasMany(db.Office, { foreignKey: 'id_department' })
  db.Office.belongsTo(db.Department, { foreignKey: 'id_department' })
  db.Department.belongsToMany(db.Content, { foreignKey: 'id_department', through: db.ContentDepartment })
  db.Content.belongsToMany(db.Department, { foreignKey: 'id_content', through: db.ContentDepartment })

  // Content: ContentSkill
  db.Content.belongsToMany(db.Skill, { foreignKey: 'id_content', through: db.ContentSkill })
  db.Skill.belongsToMany(db.Content, { foreignKey: 'id_skill', through: db.ContentSkill })
  db.Content.hasMany(db.SkillUser, { foreignKey: 'id_content' })
  db.SkillUser.belongsTo(db.Content, { foreignKey: 'id_content' })
  db.Skill.hasMany(db.SkillUser, { foreignKey: 'id_skill' })
  db.SkillUser.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.User.belongsToMany(db.Content, { foreignKey: 'id_user', through: db.Denunciation })
  db.Content.belongsToMany(db.User, { foreignKey: 'id_content', through: db.Denunciation })
  db.User.hasMany(db.UserContent, { foreignKey: 'id_user' })
  db.UserContent.belongsTo(db.User, { foreignKey: 'id_user' })
  db.Content.hasMany(db.UserContent, { foreignKey: 'id_content' })
  db.UserContent.belongsTo(db.Content, { foreignKey: 'id_content' })




  // Skill: SublevelSkill, Question
  db.Skill.belongsToMany(db.Sublevel, { foreignKey: 'id_skill', through: db.SublevelSkill })
  db.Sublevel.belongsToMany(db.Skill, { foreignKey: 'id_sublevel', through: db.SublevelSkill })
  db.Skill.hasMany(db.SublevelSkill, { foreignKey: 'id_skill' })
  db.SublevelSkill.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.Sublevel.hasMany(db.SublevelSkill, { foreignKey: 'id_sublevel' })
  db.SublevelSkill.belongsTo(db.Sublevel, { foreignKey: 'id_sublevel' })
  db.Skill.hasMany(db.Question, { foreignKey: 'id_skill' })
  db.Question.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.Skill.belongsToMany(db.Tip, { foreignKey: 'id_skill', through: db.TipSkill })
  db.Tip.belongsToMany(db.Skill, { foreignKey: 'id_tip', through: db.TipSkill })
  db.Tip.hasMany(db.TipSkill, { foreignKey: 'id_tip' })
  db.TipSkill.belongsTo(db.Tip, { foreignKey: 'id_tip' })
  db.Skill.hasMany(db.TipSkill, { foreignKey: 'id_skill' })
  db.TipSkill.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.Skill.belongsToMany(db.Pdi, { foreignKey: 'id_skill', through: db.PdiSkill })
  db.Pdi.belongsToMany(db.Skill, { foreignKey: 'id_pdi', through: db.PdiSkill })
  db.Skill.hasMany(db.PdiSkill, { foreignKey: 'id_skill' })
  db.PdiSkill.belongsTo(db.Skill, { foreignKey: 'id_skill' })
  db.Pdi.hasMany(db.PdiSkill, { foreignKey: 'id_pdi' })
  db.PdiSkill.belongsTo(db.Pdi, { foreignKey: 'id_pdi' })



  // Quadrant: Sublevel
  db.Quadrant.hasMany(db.Sublevel, { foreignKey: 'id_quadrant' })
  db.Sublevel.belongsTo(db.Quadrant, { foreignKey: 'id_quadrant' })

  // Question: QuestionEvaluation
  db.Question.belongsToMany(db.Evaluation, { foreignKey: 'id_question', through: db.QuestionEvaluation })
  db.Evaluation.belongsToMany(db.Question, { foreignKey: 'id_evaluation', through: db.QuestionEvaluation})
  db.Question.hasMany(db.Answer, { foreignKey: 'id_question' })
  db.Answer.belongsTo(db.Question, { foreignKey: 'id_question' })

  // Evaluation: Resultrepresentational
  db.Evaluation.hasMany(db.Resultrepresentational, { foreignKey: 'id_evaluation' })
  db.Resultrepresentational.belongsTo(db.Evaluation, { foreignKey: 'id_evaluation' })
  db.Evaluation.hasMany(db.Pdi, { foreignKey: 'id_evaluation' })
  db.Pdi.belongsTo(db.Evaluation, { foreignKey: 'id_evaluation' })


  /**
    * OBS: PEDENTE A CRIAÇÃO DAS RELAÇÕES ASSOCIATIVAS audience_content_user
    */



  sequelize.sync({ force: db.force === true })
    .then(function() {
      if (typeof db.finishCbFn == 'function') {
        console.log('db.finishCbFn(db)')
        db.finishCbFn(db)
        console.log('db.finishCbFn(db)')
      }
      console.log('syncronized?  sequelize ', typeof db.finishCbFn)
    })
    .catch(err => {
      console.log('log err called', err)
      typeof db.catchFinishCbFn == 'function'? db.catchFinishCbFn(): console.log(err)
    })

  db.sequelize = sequelize
  db.Sequelize = Sequelize
  return db
}
// sequelize.sync();

module.exports = (finishCbFn, catchFinishCbFn, force) => {

  Object.defineProperty(db, 'force', { value: force == 'true' } )
  if (typeof finishCbFn == 'function') {
    Object.defineProperty(db, 'finishCbFn', {
      value: finishCbFn
    })
  }
  if (typeof catchFinishCbFn == 'function') {
    Object.defineProperty(db, 'catchFinishCbFn', {
      value: catchFinishCbFn
    })
  }
  return getInstance()
}
