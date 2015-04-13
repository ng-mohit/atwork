var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'atwork.posts', 'atwork.activities', 'atwork.notifications', 'atwork.settings', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$rootScope', 
  '$mdSidenav',
  '$mdBottomSheet',
  '$location',
  '$timeout',
  'appLocation',
  'appAuth',
  'appWebSocket',
  'appSettings',
  'appSettingsValid',
  'appToast',
  function($scope, $rootScope, $mdSidenav, $mdBottomSheet, $location, $timeout, appLocation, appAuth, appWebSocket, appSettings, appSettingsValid, appToast) {
    $scope.barTitle = '';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.updateLoginStatus = function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.user = appAuth.getUser();
    };

    $scope.goHome = function() {
      appLocation.url('/feed');
    };

    $scope.showUserActions = function($event) {
      $mdBottomSheet.show({
        templateUrl: '/modules/users/views/user-list.html',
        controller: 'UserSheet',
        targetEvent: $event
      }).then(function(clickedItem) {
        $scope.alert = clickedItem.name + ' clicked!';
      });
    };

    $scope.$on('loggedIn', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = '';
      appWebSocket.emit('online', {token: appAuth.getToken()});

      /**
       * Fetch settings and get the app ready
       */
      appSettings.fetch(function(settings) {
        $scope.$on('$routeChangeStart', function (event, toState) {
          var valid = appSettingsValid();
          if (!valid) {
            appToast('Please complete the setup first.');
          }
        });
        $rootScope.systemSettings = settings;
        $scope.appReady = true;
        $timeout(appSettingsValid);
        
      });
    });

    $scope.$on('loggedOut', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = 'AtWork';
    });

    appWebSocket.on('connect', function() {
      if (appAuth.isLoggedIn()) {
        appWebSocket.emit('online', {token: appAuth.getToken()});
      }
    });

    
    $scope.updateLoginStatus();
    $timeout(function() {
      if (!appAuth.isLoggedIn()) {
        $scope.barTitle = 'AtWork';
        appLocation.url('/login');
        $scope.appReady = true;
      } else {
        $scope.barTitle = '';
        $scope.$broadcast('loggedIn');
      }
      
    });
  }
]);