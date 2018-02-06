(function(angular) {
  'use strict';

  angular.module('op.live-conference', [
    'op.liveconference-templates',
    'op.websocket',
    'op.notification',
    'meetings.authentication',
    'meetings.session',
    'meetings.conference',
    'meetings.invitation',
    'meetings.report',
    'meetings.wizard',
    'ngMaterial'
  ]);
})(angular);
