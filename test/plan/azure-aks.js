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
                assert.equal(nodePool.name, 'default');
                assert.equal(nodePool.vm_size, ctx.prompts.vmsize);
                assert.equal(nodePool.os_disk_size_gb, 60);
                assert.equal(nodePool.max_pods, ctx.prompts.podsPerNode);
                assert.equal(nodePool.vm_size, ctx.prompts.vmsize);
                assert.equal(nodePool.node_count, ctx.prompts.vms);
                assert.equal(nodePool.enable_auto_scaling, false);
                assert.equal(nodePool.max_pods, 60);
                assert.equal(nodePool.type, 'VirtualMachineScaleSets');
            });

            it('Plans the right networking', () => {
                var ctx = helper.getAks();
                var networkProfile = ctx.aks.network_profile();
                assert.equal(networkProfile.dns_service_ip, '172.0.2.2');
                assert.equal(networkProfile.docker_bridge_cidr, '172.17.0.1/16');
                assert.equal(networkProfile.load_balancer_sku, 'basic');
                assert.equal(networkProfile.network_plugin, 'azure');
                assert.equal(networkProfile.network_policy, 'calico');
                assert.equal(networkProfile.outbound_type, 'loadBalancer');
                assert.equal(networkProfile.service_cidr, '172.0.2.0/23');
            });

            it('Plans the correct linux profile', () => {
                var ctx = helper.getAks();
                var linuxProfile = ctx.aks.linux_profile();
                assert.equal(linuxProfile.admin_username, ctx.prompts.adminUser);
                assert.ok(linuxProfile.ssh_key, 'No SSH key configuration found');
                assert.equal(linuxProfile.ssh_key[0].key_data, ctx.prompts.sshKey);
            });

            it('Enables RBAC', () => {
                var ctx = helper.getAks();
                var rbac = ctx.aks.rbac();
                assert.equal(rbac.enabled, ctx.prompts.features.includes('rbac'), 'The configuration and prompt doesn\'t match');
                assert.equal(rbac.azure_active_directory.length, 0, 'No AD has been specified. Should be an empty array')
            });

            it('Disables the Kubernetes dashboard by default', () => {
                var ctx = helper.getAks();
                var addon_profile = ctx.aks.addon_profile(0);
                assert.ok(addon_profile.kube_dashboard, `No kube_dashboard configuration found`);
                assert.equal(addon_profile.kube_dashboard[0].enabled, false, `Kube dashboard expected value: ${false}. Actual: ${addon_profile.kube_dashboard[0].enabled}`);
            });

            it('Plans the correct VNET and subnets', () => {
                var ctx = helper.getVnet();
                var vnet = ctx.vnet;
                vnet.name().is('cloudcommons')
                    .mode().is('managed')
                    .type().is('azurerm_virtual_network')
                    .providerName().is('azurerm');
                
                assert.equal(ctx.getArrayValue('address_space'), '172.0.0.0/22');
                vnet.value('dns_servers').is(null);
                vnet.value('location').is(ctx.prompts.location);
                var subnet = ctx.getArrayValue('subnet', 0);
                assert.equal(subnet.name, 'Cluster');
                assert.equal(subnet.address_prefix, '172.0.0.0/23');
                assert.equal(subnet.security_group, '');
            });

            it('Disables OMS by default', () => {
                var ctx = helper.getAks();
                var addon_profile = ctx.aks.addon_profile(0);
                assert.ok(addon_profile.oms_agent, 'No oms_agent configuration found');
                assert.ok(!addon_profile.oms_agent[0].enabled, 'OMS integration is enabled');
                assert.equal(addon_profile.oms_agent[0].log_analytics_workspace_id, null, 'OMS');
            });

            it('Plans the correct service principal', () => {
                var ctx = helper.getAks();
                var sp = ctx.aks.sp();
                assert.equal(sp.client_id, ctx.prompts.clientId);
                assert.equal(sp.client_secret, ctx.prompts.clientSecret);
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
                    getArrayValue(name, index = 0) {
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
                    },
                    network_profile(index = 0) {
                        return this.getArrayValue('network_profile', index);
                    },
                    linux_profile(index = 0) {
                        return this.getArrayValue('linux_profile', index);
                    },
                    rbac(index = 0) {
                        return this.getArrayValue('role_based_access_control', index);
                    },
                    sp(index = 0) {
                        return this.getArrayValue('service_principal', index);
                    }
                }
            }
        },
        getVnet: function () {
            var prompts = spec.generators['azure-aks'].prompts;
            var module = this.plan.planned_values.root_module
                .child_modules(`module.${prompts.name}-kubernetes`)
                .child_modules(`module.${prompts.name}-kubernetes.module.vnet`);
            var vnetResource = module.resources('module.mycluster-kubernetes.module.vnet.azurerm_virtual_network.cloudcommons[0]');

            return {
                prompts: prompts,
                module: module,
                vnet: vnetResource,
                getArrayValue: function (name, index = 0) {
                    var array = this.vnet.value(name).get();
                    assert.notEqual(array.length, 0, `No ${name} found`);
                    assert.ok(array.length > index, `${name} out of range`);
                    return array[index];
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
