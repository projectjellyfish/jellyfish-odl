(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(StateOverride) {
    StateOverride.override('services.details', function(service) {
      if ('JellyfishOdl::Service::Server' == service.type) {
        return {
          templateUrl: 'extensions/odl/states/services/details/odl/server/server.html',
          controller: StateController
        };
      }
    })
  }

  /** @ngInject */
  function StateController($scope, service, OdlData) {
    var vm = this;

    vm.title = '';

    vm.service = service;

    vm.refreshNodes = refreshNodes;
    vm.addRule = addRule;
    vm.editRule = editRule;
    vm.removeRule = removeRule;
    vm.shiftDropRule = shiftDropRule;

    vm.activate = activate;

    activate();

    function activate() { }

    function handleResults(data) {
      console.log(data);

      vm.response = data;

      // CREATE EMPTY FIREWALL RULES STATE
      var firewall_rules = [];

      // EXTRACT RULES
      try {
        // GET FIREWALL POLICIES
        var policies = data[0]['vyatta-security-firewall:name'];

        // RETRIEVE CURRENT POLICY - TEST
        var policy = policies[0]; // THERE COULD BE MULTIPLE POLICIES
        var tagnode = policy['tagnode'];

        // PARSE TEST POLICY RULES AND ADD TO FIREWALL RULES
        var rules = policy['rule'];
        for(var i=0; i<rules.length;i++){
          var rule = rules[i];
          rule['policy'] = tagnode;
          firewall_rules.push(rule);
        }

        firewall_rules.sort(odl_firewall_rule_compare);
      }catch (Exception){
        console.log(Exception)
      }

      // ADD FIREWALL RULES TO VIEW MODEL
      vm.firewall_rules = firewall_rules;
    }

    function odl_firewall_rule_compare(a,b) {
      if (a.tagnode < b.tagnode)
        return -1;
      if (a.tagnode > b.tagnode)
        return 1;
      return 0;
    }

    function handleError(response) {
      console.log(response);
      vm.response = response;
    }

    function refreshNodes(){
      vm.response = '';
      vm.firewall_rules = null;
      OdlData['networkTopology'](vm.service.provider.id).then(handleResults, handleError);
    }

    function shiftDropRule(){
      vm.response = '';
      vm.firewall_rules = null;
      OdlData['shiftDropRule'](vm.service.provider.id).then(handleResults, handleError);
    }

    function addRule(rule){
      //vm.response = '';
      //vm.firewall_rules = null;
      //OdlData['addRule'](vm.service.provider.id, rule).then(handleResults, handleError);
    }

    function editRule(rule){
      OdlData['editRule'](vm.service.provider.id, rule).then(handleError, handleError);
    }

    function removeRule(rule_idx, rule){
      vm.firewall_rules.splice(rule_idx,1);
      OdlData['removeRule'](vm.service.provider.id, rule.tagnode).then(handleError, handleError);
    }
  }
})();
