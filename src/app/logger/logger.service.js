'use strict';

/**
 * @ngdoc service
 * @name vegalite-ui.logger
 * @description
 * # logger
 * Service in the vegalite-ui.
 */
angular.module('vleApp')
  .service('Logger', function ($location, $webSql, consts, Papa) {

    var service = {};

    // get user id once in the beginning
    var user = $location.search().user;

    service.db = $webSql.openDatabase('logs', '1.0', 'Logs', 2 * 1024 * 1024);

    service.tableName = 'log_' + consts.appId;

    service.db.createTable(service.tableName, {
      'userid':{
        'type': 'INTEGER',
        'null': 'NOT NULL'
      },
      'time':{
        'type': 'TIMESTAMP',
        'null': 'NOT NULL',
        'default': 'CURRENT_TIMESTAMP'
      },
      'action':{
        'type': 'TEXT',
        'null': 'NOT NULL'
      },
      'data': {
        'type': 'TEXT'
      },
      'diff': {
        'type': 'TEXT'
      }
    });

    service.clear = function() {
      var r = confirm('Really clear the logs?');
      if (r == true) {
        service.db.dropTable(service.tableName);
      }
    };

    service.export = function() {
      var data = service.db.selectAll(service.tableName).then(function(results) {
        if (results.rows.length === 0) {
          console.warn('No logs');
          return;
        }

        var rows = [];

        for(var i=0; i < results.rows.length; i++) {
          rows.push(results.rows.item(i));
        }
        var csv = Papa.unparse(rows);

        var element = angular.element('<a/>');
        element.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(csv),
          target: '_blank',
          download: 'logs.csv'
        })[0].click();
      });
    }

    service.logInteraction = function(action, data, diff) {
      if (!consts.logging)
        return;

      var row = {userid: user, action: action};
      if (data !== undefined) {
        row.data = JSON.stringify(data);
      }

      if (diff !== undefined) {
        row.diff = JSON.stringify(diff);
      }

      service.db.insert(service.tableName, row).then(function(results) {});
    };

    return service;
  });