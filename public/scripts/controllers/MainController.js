'use strict';

 angular.module('main')
 .controller('MainCtrl', function ($rootScope, $scope, $location, $mdSidenav, $mdDialog, $interval, $mdToast, Auth, Order) {

  var showToast = function (message) {
    $mdToast.show($mdToast.simple().content(message).action('OK').hideDelay(false));
  };

  var loadPendingOrders = function () {
    Auth.ensureLoggedIn().then(function () {
      Order.pending().then(function (orders) {
        $scope.pendingOrders = orders;
        if (orders.length) {
          showToast('You have ' + orders.length + ' pending ' + (orders.length > 1 ? 'orders' : 'order'));
          var audio = new Audio('/audio/notify.mp3');
          audio.play();
        }
      });
    });
  };

  $scope.toggle = function () {
    $mdSidenav('leftMenu').toggle();
  }

  $scope.navigateTo = function (url) {
 		$location.path(url);
    $mdSidenav('leftMenu').toggle();
 	};

 	$rootScope.currentUser = Auth.getLoggedUser();

	$rootScope.isLoggedIn = function () {
	  return $rootScope.currentUser !== null;
	};

  $scope.onChangePassword = function (ev) {

    $mdDialog.show({
      controller: 'ChangePasswordController',
      templateUrl: '/views/partials/change-password.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

  if ($scope.isLoggedIn()) {
    $interval(function() {
      loadPendingOrders();
    }, 30000);

    loadPendingOrders();
  }


}).controller('ChangePasswordController', function ($scope, $mdToast, $mdDialog, User, Auth) {

  $scope.formData = {};

  $scope.user = Auth.getLoggedUser();

  var showToast = function (message) {
    $mdToast.show($mdToast.simple().content(message).action('OK').hideDelay(false));
  };

  $scope.onSave = function () {

    if ($scope.formData.newPassword !== $scope.formData.confirmedPassword) {
      showToast('Password doesn\'t match confirmation');
      return;
    }

    if ($scope.formData.newPassword.length < 6) {
      showToast('Password must be of minimum 6 characters');
      return;
    }

    $scope.isSaving = true;

    Auth.logIn($scope.user.getUsername(), $scope.formData.oldPassword)
    .then(function () {
      $scope.user.password = $scope.formData.newPassword;
      return User.save($scope.user);
    }).then(function () {
      showToast('Password updated successfully');
      $scope.onClose();
      $scope.isSaving = false;
    }, function () {
      showToast('Current Password is Invalid');
      $scope.isSaving = false;
    });
  };

  $scope.onClose = function() {
    $mdDialog.cancel();
  };

});
