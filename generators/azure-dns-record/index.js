// var Generator = require('yeoman-generator');
var TerraformGenerator = require('../../core/TerraformGenerator');
var writer = require('./writer');
var getQuestions = require('./questions');
const options = require('./options');

module.exports = class extends TerraformGenerator {

  constructor(args, opts) {
    super(args, opts, "azure-resource-group", "azurerm_resource_group");
    super.addOptions(options);
  }

  initializing() {
  }

  async prompting() {
    var questions = getQuestions(this, this.az, this.terraform, this.resources, this.configManager);
    this.answers = this.mergeOptions(options, await this.prompt(questions));    
  }

  paths() {
  }

  configuring() {
  }

  default() {
  }

  writing() {
    writer(this.terraform, this.fsTools, this.answers);
    this.addResource(this.answers.name);
  }

  conflicts() {
  }

  install() {
  }

  end() {
    this.save(cleanupSecrets(this.answers));
  }
};

function cleanupSecrets(answers) {
  return answers;
}
