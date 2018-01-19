'use strict';

/* global chai: false, sinon: false */

var expect = chai.expect;

describe('The meetings.invitation module', function() {

  beforeEach(function() {
    module('op.live-conference');
    module('meetings.invitation');
    module('meetings.jade.templates');
  });

  describe('The invitationDialogLauncher directive', function() {
    var $rootScope, $timeout, $compile, $scope, $stateParams;

    beforeEach(function() {
      var webRTCService = this.webRTCService = {
        _disconnectCallbacks: [],

        connect: function(conf, cb) { cb(null); },
        leaveRoom: function(conf) {},
        performCall: function(id) {},
        addDisconnectCallback: function(cb) { this._disconnectCallbacks.push(cb); }
      };

      angular.mock.module(function($provide) {
        $provide.value('webRTCService', webRTCService);
        $provide.constant('MAX_RECONNECT_TIMEOUT', 6000);
        $provide.value('$stateParams', $stateParams = {});
      });
    });

    beforeEach(inject(function($window, _$rootScope_, _$timeout_, _$compile_) {
      $window.easyrtc = {
        enableDataChannels: function() {},
        setDisconnectListener: function() {},
        setDataChannelCloseListener: function() {},
        setCallCancelled: function() {},
        setOnStreamClosed: function() {}
      };

      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      $compile = _$compile_;

      $scope = $rootScope.$new();
    }));

    function compile() {
      $compile('<div live-conference invitation-dialog-launcher></div>')($scope);
      $rootScope.$digest();
    }

    it('should show invitation modal on localMediaReadyEvent if no user is online', function() {
      compile();

      $scope.showInvitation = sinon.spy();
      $scope.conferenceState = {
        conference: {
          members: [
            {status: 'offline'}
          ]
        }
      };
      $scope.$emit('localMediaReady');
      $timeout.flush();

      expect($scope.showInvitation).to.have.been.calledOnce;
    });

    it('should not show invitation modal on localMediaReadyEvent if some user is online', function() {
      compile();

      $scope.showInvitation = sinon.spy();
      $scope.conferenceState = {
        conference: {
          members: [{ status: 'online' }]
        }
      };
      $scope.$emit('localMediaReady');

      expect($scope.showInvitation).to.have.not.been.calledWith();
    });

    it('should not show invitation modal on localMediaReadyEvent if behavior is disabled through URL', function() {
      $stateParams.noAutoInvite = true;

      compile();

      $scope.showInvitation = sinon.spy();
      $scope.conferenceState = {
        conference: {
          members: [{ status: 'online' }]
        }
      };
      $scope.$emit('localMediaReady');

      expect($scope.showInvitation).to.have.not.been.calledWith();
    });
  });
});
