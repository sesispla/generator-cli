var config = require('./js/config');
var fsTools = require ('../../common/fsTools');

/**
 * Application writer
 */
module.exports = function (generator, answers) {

    answers = Object.assign({
        acrEnabled: answers.features.includes("acr"),
        rbacEnabled: answers.features.includes("rbac")
    }, answers);
    
    fsTools.copy(generator, "aks.tf", answers);
    fsTools.copy(generator, "acr.tf", answers);
    fsTools.copy(generator, "outputs.tf", answers);
    fsTools.copy(generator, "providers.tf", answers);
    fsTools.copy(generator, "resource-group.tf", answers);
    config.copy(generator.fs, answers);
    fsTools.copy(generator, "variables.tf", answers);
    if (answers.features.includes("cert-manager")) {
        fsTools.copy(generator, `cert-manager/${answers.certManagerVersion}/crds.yml`, answers);
        fsTools.copy(generator, `cert-manager/${answers.certManagerVersion}/cluster-issuer.yml`, answers);
        fsTools.copyTo(generator, `cert-manager/${answers.certManagerVersion}/jetstack-helm-repo.tf`, "cert-manager-jetstack-helm-repo.tf", answers);
        fsTools.copyTo(generator, `cert-manager/${answers.certManagerVersion}/cert-manager.tf`, "cert-manager.tf", answers);
    }
    if (true) // Future condition to copy Tiller-related rubbish when people use Helm v2
    {
        fsTools.copyTo(generator, "helm/v2/cluster-role.tf", "tiller-cluster-role.tf");
        fsTools.copyTo(generator, "helm/v2/role-binding.tf", "tiller-role-binding.tf");
        fsTools.copyTo(generator, "helm/v2/service-account.tf", "tiller-service-account.tf");
    }
}