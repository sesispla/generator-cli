const assert = require('yeoman-assert');
const genSpec = require('../helpers/geneteratorSpecificationHelper');

describe('cloudcommons/cli:azure-aks', function () {
    describe('Terraform plan validations', function () {
        describe('Creates an AKS with Application Insights with log analytics', function () {
            var spec = {
                config: {
                    terraform: {
                        init: true,
                        plan: true
                    }
                },
                generators: {
                    'terraform': {
                        prompts: {
                            app: 'cloudcommons',
                            version: '0.12.20',
                            backendType: 'local'
                        }
                    },
                    'azure-resource-group': {
                        prompts: {
                            name: 'cloudcommons',
                            location: 'uksouth'
                        }
                    },
                    'azure-aks': {
                        prompts: {
                            name: 'mycluster',
                            resourceGroup: 'azurerm_resource_group.cloudcommons',
                            location: 'uksouth',
                            kubernetesVersion: '1.15.7',
                            sizingKind: 'development',
                            sizingAccesibility: 'public',
                            vmsize: 'Standard_DS2_v2',
                            vms: '1',
                            vmsMax: '4',
                            podsPerNode: '60',
                            adminUser: 'cloudcommons',
                            sshKey: 'mysshkey',
                            clientId: 'myclientid',
                            clientSecret: 'myclientsecret',
                            features: ['network-plugin', 'network-policy', 'rbac'],
                            networkPluginCidr: '172.0.0.0'
                        }
                    },
                    'azure-log-analytics': {
                        prompts: {
                            name: 'cloudcommons-log',
                            resourceGroup: 'azurerm_resource_group.cloudcommons',
                            location: 'uksouth',
                            retention: 30
                        }
                    }
                }
            };

            var helper = null;

            before(done => {
                genSpec(spec, (terraformPlan) => {
                    helper = getTestHelper(spec, terraformPlan);
                    done();
                });
            });

            it('Generates a valid plan', () => {
                var plan = helper.plan;
                assert.ok(plan);
            });

            it('Plans to create all the variables', () => {
                var plan = helper.plan;
                plan.variables('ADMIN_USER').is(spec.generators['azure-aks'].prompts.adminUser);
                plan.variables('APP').is(spec.generators['terraform'].prompts.app);
                plan.variables('AUTO_SCALING_ENABLED').is(false);
                plan.variables('AUTO_SCALING_MAX_COUNT').is(0);
                plan.variables('AUTO_SCALING_MIN_COUNT').is(0);
                plan.variables('CREATOR').is('cloudcommons');
                plan.variables('ENVIRONMENT').is('default');
                plan.variables('KUBERNETES_AGENT_COUNT').is(spec.generators['azure-aks'].prompts.vms);
                plan.variables('KUBERNETES_CLIENT_ID').is(spec.generators['azure-aks'].prompts.clientId);
                plan.variables('KUBERNETES_CLIENT_SECRET').is(spec.generators['azure-aks'].prompts.clientSecret);
                plan.variables('KUBERNETES_CLUSTER_NAME').is(spec.generators['azure-aks'].prompts.name);
                plan.variables('KUBERNETES_VERSION').is(spec.generators['azure-aks'].prompts.kubernetesVersion);
                plan.variables('KUBERNETES_VM_SIZE').is(spec.generators['azure-aks'].prompts.vmsize);
                plan.variables('KUBE_DASHBOARD_ENABLED').is(false);
                plan.variables('LOCATION').is(spec.generators['azure-resource-group'].prompts.location);
                plan.variables('LOG_ANALYTICS_RETENTION_DAYS').is(spec.generators['azure-log-analytics'].prompts.retention);
                plan.variables('OS_DISK_SIZE_GB').is(60);
                plan.variables('RBAC_ENABLED').is(spec.generators['azure-aks'].prompts.features.includes('rbac'));
                plan.variables('RESOURCE_GROUP_NAME').is(spec.generators['azure-resource-group'].prompts.name);
                plan.variables('SSH_KEY').is(spec.generators['azure-aks'].prompts.sshKey);
                plan.variables('VNET_ADDRESS_SPACE').is(`${spec.generators['azure-aks'].prompts.networkPluginCidr}/22`);
                plan.variables('VNET_CLUSTER_CIDR').is('172.0.0.0/23');
                plan.variables('VNET_SERVICE_CIDR').is('172.0.2.0/23');
            });

            it('Plans the right output variables', () => {
                var plan = helper.plan;
                plan.planned_values.outputs("AKS_KUBE_CONFIG").isSensitive();
                plan.planned_values.outputs("AKS_KUBE_CONFIG_RAW").isSensitive();
                plan.planned_values.outputs("LOG_ANALYTICS_ID").isNotSensitive();
                plan.planned_values.outputs("LOG_ANALYTICS_PORTAL_URL").isNotSensitive();
                plan.planned_values.outputs("LOG_ANALYTICS_PRIMARY_SHARED_KEY").isSensitive();
                plan.planned_values.outputs("LOG_ANALYTICS_SECONDARY_SHARED_KEY").isSensitive();
                plan.planned_values.outputs("LOG_ANALYTICS_WORKSPACE_ID").isNotSensitive();
                plan.planned_values.outputs("RESOURCE_GROUP_ID").isNotSensitive();
            });

            it(`Plans resource group`, () => {
                var ctx = helper.getResourceGroup();
                var prompts = ctx.prompts;
                var resourceGroup = ctx.resource;

                resourceGroup.mode().is("managed")
                    .type().is("azurerm_resource_group")
                    .name().is(prompts.name)
                    .providerName().is("azurerm")
                    .value("location").is(prompts.location);
            });

            it(`Plans a managed AKS azurerm_kubernetes_cluster`, () => {
                var ctx = helper.getAks();
                var resource = ctx.aks.resource;
                resource.name().is('cloudcommons')
                    .type().is('azurerm_kubernetes_cluster')
                    .mode().is('managed')
                    .providerName().is('azurerm');
            });

            it('Plans the right node_pool configuration', () => {
                var ctx = helper.getAks();
                var nodePool = ctx.aks.default_node_pool();
                assert.equal(nodePool.vm_size, ctx.prompts.vmsize);
                assert.equal(nodePool.os_disk_size_gb, 60);
                assert.equal(nodePool.max_pods, ctx.prompts.podsPerNode);
            });

            it('Disables the Kubernetes dashboard by default', () => {
                var ctx = helper.getAks();
                var addon_profile = ctx.aks.addon_profile(0);
                assert.ok(addon_profile.kube_dashboard, `No kube_dashboard configuration found`);
                assert.equal(addon_profile.kube_dashboard[0].enabled, false, `Kube dashboard expected value: ${false}. Actual: ${addon_profile.kube_dashboard[0].enabled}`);
            });

            it('Plans Azure Log', () => {
                var ctx = helper.getLogAnalytics();
                var prompts = ctx.prompts;
                var logAnalytics = ctx.resource;
                logAnalytics.name().is(`${prompts.name}`)
                    .mode().is('managed')
                    .type().is('azurerm_log_analytics_workspace')
                    .providerName().is('azurerm');

                logAnalytics.value('location').is(prompts.location)
                    .value('retention_in_days').is(prompts.retention)
                    .value('sku').is('PerGB2018')
                    .value('timeouts').is(null);
            });

            it('Plans Random Id', () => {
                var random = helper.getRandomId().resource;
                random.name().is('cloudcommons')
                    .mode().is('managed')
                    .type().is('random_id')
                    .providerName().is('random');

                random.value('byte_length').is(4);
            });
        });
    });
});

/**
 * This helper function returns an object to simplify the access to the plan assert
 * @param {*} spec 
 * @param {*} plan 
 */
function getTestHelper(spec, plan) {
    return {
        plan: plan,
        getAks: function () {
            var prompts = spec.generators['azure-aks'].prompts;
            var module = this.plan.planned_values.root_module
                .child_modules(`module.${prompts.name}-kubernetes`);
            var aksResource = module.resources(`module.${prompts.name}-kubernetes.azurerm_kubernetes_cluster.cloudcommons`);
            return {
                prompts: prompts,
                aks: {
                    module: module,
                    resource: aksResource,
                    getArrayValue(name, index) {
                        var array = aksResource.value(name).get();
                        assert.notEqual(array.length, 0, `No ${name} found`);
                        assert.ok(array.length > index, `${name} out of range`);
                        return array[index];
                    },
                    addon_profile(index = 0) {
                        return this.getArrayValue('addon_profile', index);
                    },
                    default_node_pool(index = 0) {
                        return this.getArrayValue('default_node_pool', index);
                    }
                }
            }
        },
        getLogAnalytics: function () {
            var prompts = spec.generators['azure-log-analytics'].prompts;
            return {
                prompts: prompts,
                resource: this.plan.planned_values.root_module.resources(`azurerm_log_analytics_workspace.${prompts.name}`)
            }
        },
        getRandomId: function () {
            return {
                resource: this.plan.planned_values.root_module.resources('random_id.cloudcommons')
            }
        },
        getResourceGroup: function () {
            var prompts = spec.generators['azure-resource-group'].prompts;
            return {
                prompts: prompts,
                resource: this.plan.planned_values.root_module.resources(`azurerm_resource_group.${prompts.name}`)
            }
        }
    }
}
