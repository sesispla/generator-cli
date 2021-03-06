var helpers = require('yeoman-test');
var path = require('path');
var assert = require('yeoman-assert');

describe("cloudcommons/cli:azure-sql", function () {
    describe('Creates a SQL Server', () => {
        describe('Using an existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'cloudcommons',
                serverLocation: 'westeu',
                features: [],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.fileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                assert.fileContent('terraform.tfvars.json', `"${prompts.serverLocation}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.fileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });

        describe('Creating a existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'azurerm_resource_group.workspace',
                serverLocation: 'westeu',
                features: [],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.noFileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                assert.fileContent('terraform.tfvars.json', `"${prompts.serverLocation}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.noFileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });        
    });

    describe('Creates a SQL Server with database', () => {
        describe('Using an existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'cloudcommons',
                serverLocation: 'westeu',
                features: ['database'],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',
                databaseName: 'my-database'                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.fileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                assert.fileContent('terraform.tfvars.json', `"${prompts.serverLocation}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.fileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });

        describe('Creating a existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'azurerm_resource_group.workspace',
                serverLocation: 'westeu',
                features: ['database'],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.noFileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                assert.fileContent('terraform.tfvars.json', `"${prompts.serverLocation}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.noFileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });        
    });    

    describe('Creates a SQL Server with database failover', () => {
        describe('Using an existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'cloudcommons',
                serverLocations: ['westeu','northeu'],
                features: ['database', 'fail-over'],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',
                databaseName: 'my-database'                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file(`${prompts.databaseName}-failover.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.fileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                prompts.serverLocations.forEach((location) => {
                    assert.fileContent('terraform.tfvars.json', `"${location}"`);
                });                
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.fileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });

        describe('Creating a existing resource group', () => {
            var prompts = {
                name: 'cloudcommons-sql',
                resourceGroup: 'azurerm_resource_group.workspace',
                serverLocation: 'westeu',
                features: ['database'],
                serverAdminLogin: 'youradmin',
                serverAdminPassword: 'yourpassword',                
            };
            before(done => {
                helpers
                    .run(path.join(__dirname, '../generators/azure-sql'))
                    .withPrompts(prompts)
                    .once('end', done);
            });

            it('Generates SQL files', () => {
                assert.file(`${prompts.name}-sql-server.tf`);
                assert.file('terraform.tfvars.json');
                assert.file('variables.tf.json');
                assert.file('providers.tf.json');
                assert.file('output.tf.json');
            });

            it('Defines terraform variables', () => {
                assert.fileContent('variables.tf.json', '"SQL_LOCATIONS":');
                assert.fileContent('variables.tf.json', '"SQL_NAME_PREFIX":');
                assert.fileContent('variables.tf.json', '"SQL_VERSION":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_LOGIN":');
                assert.fileContent('variables.tf.json', '"SQL_ADMIN_PASSWORD":');
                assert.noFileContent('variables.tf.json', '"RESOURCE_GROUP_NAME":');
            });

            it('Includes sql server in the variables', () => {
                assert.fileContent('terraform.tfvars.json', `"SQL_LOCATIONS":`);
                assert.fileContent('terraform.tfvars.json', `"${prompts.serverLocation}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_NAME_PREFIX": "${prompts.name}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_VERSION": "12.0"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_LOGIN": "${prompts.serverAdminLogin}"`);
                assert.fileContent('terraform.tfvars.json', `"SQL_ADMIN_PASSWORD": "${prompts.serverAdminPassword}"`);
                assert.noFileContent('terraform.tfvars.json', `"RESOURCE_GROUP_NAME": "${prompts.resourceGroup}"`);
            });

            it('Creates the right output values', () => {
                var name = `azurerm_sql_server.${prompts.name}.*`;
                var failoverName = `azurerm_sql_failover_group.${prompts.name}`
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDS":');
                assert.fileContent('output.tf.json', `${name}.id`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_FQDNS":');
                assert.fileContent('output.tf.json', `${name}.fully_qualified_domain_name`);
                assert.fileContent('output.tf.json', '"SQL_SERVER_IDENTITIES":');
                assert.fileContent('output.tf.json', `${name}.identity`);       
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ID":');
                assert.noFileContent('output.tf.json', `${failoverName}.id`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_LOCATION":');
                assert.noFileContent('output.tf.json', `${failoverName}.location`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_SERVER_NAME":');
                assert.noFileContent('output.tf.json', `${failoverName}.server_name`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_ROLE":');
                assert.noFileContent('output.tf.json', `${failoverName}.role`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_DATABASES":');
                assert.noFileContent('output.tf.json', `${failoverName}.databases`);
                assert.noFileContent('output.tf.json', '"SQL_FAILOVER_PARTNER_SERVERS":');
                assert.noFileContent('output.tf.json', `${failoverName}.partner_servers`);                
            });

            it('Adds azurerm provider', () => {
                assert.fileContent('providers.tf.json', '"provider":');
                assert.fileContent('providers.tf.json', '"azurerm":');
            });
        });        
    });    
});